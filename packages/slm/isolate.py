"""Isolate why the served GGUF reverts to base behavior on tricky cases.

Runs the flagship case through three model states via transformers (eval.py's
exact generation path) so we can tell merge-loss from conversion-loss:
  A) base only            (untuned baseline)
  B) base + LoRA adapter  (what eval.py scored 12/12)
  C) merged model dir     (what we converted to GGUF)
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from common import BASE_MODEL, to_messages

CASE = "納期ちょっと巻きでお願いできますか？"
ADAPTER = "runs/r16-lr2e4-e3"
MERGED = "runs/r16-lr2e4-e3-merged"


@torch.inference_mode()
def gen(model, tok, text: str) -> str:
    prompt = tok.apply_chat_template(to_messages(text), tokenize=False, add_generation_prompt=True)
    ids = tok(prompt, return_tensors="pt").to(model.device)
    out = model.generate(**ids, max_new_tokens=256, do_sample=False, temperature=None, top_p=None, top_k=None)
    return tok.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)


def main() -> None:
    tok = AutoTokenizer.from_pretrained(BASE_MODEL)

    print("=== A) base only ===")
    base = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.bfloat16, device_map="cuda")
    print(gen(base, tok, CASE)[:300])

    print("\n=== B) base + adapter (eval path) ===")
    from peft import PeftModel

    peft = PeftModel.from_pretrained(base, ADAPTER)
    print(gen(peft, tok, CASE)[:300])

    print("\n=== C) merged dir (converted to GGUF) ===")
    tok_m = AutoTokenizer.from_pretrained(MERGED)
    merged = AutoModelForCausalLM.from_pretrained(MERGED, torch_dtype=torch.bfloat16, device_map="cuda")
    print(gen(merged, tok_m, CASE)[:300])


if __name__ == "__main__":
    main()
