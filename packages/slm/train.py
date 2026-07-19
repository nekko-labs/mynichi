"""LoRA fine-tune of the student on the generated corpus.

Example:
  python train.py --data data/train.jsonl --out runs/r8-lr2e4 --rank 8 --lr 2e-4 --epochs 2
"""

import argparse
import json
from pathlib import Path

import torch
from datasets import Dataset
from peft import LoraConfig, get_peft_model
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    DataCollatorForSeq2Seq,
    Trainer,
    TrainingArguments,
)

from common import BASE_MODEL, to_messages

MAX_LEN = 1024


def build_dataset(path: Path, tokenizer) -> Dataset:
    rows = [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines()]

    def to_features(row: dict) -> dict:
        target = json.dumps({"literal": row["literal"], "practical": row["practical"]}, ensure_ascii=False)
        messages = to_messages(row["text"]) + [{"role": "assistant", "content": target}]
        full = tokenizer.apply_chat_template(messages, tokenize=False)
        prompt = tokenizer.apply_chat_template(to_messages(row["text"]), tokenize=False, add_generation_prompt=True)
        full_ids = tokenizer(full, truncation=True, max_length=MAX_LEN)["input_ids"]
        prompt_len = len(tokenizer(prompt, truncation=True, max_length=MAX_LEN)["input_ids"])
        labels = [-100] * prompt_len + full_ids[prompt_len:]  # loss on the answer only
        return {"input_ids": full_ids, "labels": labels[: len(full_ids)]}

    return Dataset.from_list([to_features(r) for r in rows])


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--data", type=Path, default=Path("data/train.jsonl"))
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--rank", type=int, default=8)
    p.add_argument("--alpha", type=int, default=0)  # 0 = 2*rank
    p.add_argument("--lr", type=float, default=2e-4)
    p.add_argument("--epochs", type=float, default=2.0)
    p.add_argument("--batch", type=int, default=2)
    p.add_argument("--grad-accum", type=int, default=8)
    p.add_argument("--max-steps", type=int, default=-1)  # >0 = smoke test
    p.add_argument("--base-model", default=BASE_MODEL)
    a = p.parse_args()

    tokenizer = AutoTokenizer.from_pretrained(a.base_model)
    model = AutoModelForCausalLM.from_pretrained(a.base_model, torch_dtype=torch.bfloat16, device_map="cuda")
    model.config.use_cache = False
    model.gradient_checkpointing_enable()
    model.enable_input_require_grads()

    lora = LoraConfig(
        r=a.rank,
        lora_alpha=a.alpha or 2 * a.rank,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, lora)
    model.print_trainable_parameters()

    dataset = build_dataset(a.data, tokenizer)
    # Pads input_ids AND the precomputed labels (with -100) to a common length.
    collator = DataCollatorForSeq2Seq(tokenizer, padding=True, label_pad_token_id=-100)

    trainer = Trainer(
        model=model,
        args=TrainingArguments(
            output_dir=str(a.out),
            per_device_train_batch_size=a.batch,
            gradient_accumulation_steps=a.grad_accum,
            num_train_epochs=a.epochs,
            max_steps=a.max_steps,
            learning_rate=a.lr,
            lr_scheduler_type="cosine",
            warmup_ratio=0.03,
            bf16=True,
            logging_steps=5,
            save_strategy="no",
            report_to=[],
        ),
        train_dataset=dataset,
        data_collator=collator,
    )
    result = trainer.train()
    model.save_pretrained(str(a.out))
    tokenizer.save_pretrained(str(a.out))
    (a.out / "train_result.json").write_text(
        json.dumps({"loss": result.training_loss, "args": vars(a) | {"data": str(a.data), "out": str(a.out)}}),
        encoding="utf-8",
    )
    print(json.dumps({"final_loss": result.training_loss}))


if __name__ == "__main__":
    main()
