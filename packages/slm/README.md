# @mynichi/slm — self-trained translation SLM pipeline

Trains a small, license-clean language model that replaces the two-stage local
translate pipeline (PLaMo reference + Shisa JSON layer) with **one** model that
maps Japanese text directly to `{"literal": ..., "practical": ...}` JSON.

Why: PLaMo-2-translate's community license requires a commercial agreement with
PFN (still pending). Everything in this pipeline is Apache-2.0 end to end:

- **Teacher**: `qwen/qwen3.6-27b` (Apache 2.0, outputs unrestricted), served
  locally by LM Studio at `http://127.0.0.1:1338/v1`.
- **Student**: `Qwen/Qwen3-4B-Instruct-2507` (Apache 2.0), LoRA fine-tuned.
- **Data**: fully synthetic "living in Japan" texts generated and labeled by
  the teacher on this machine. Nothing leaves the box.

## Layout

```
packages/slm/
├── datagen.py        # sources + labels via the LM Studio OpenAI API
├── train.py          # LoRA fine-tune (transformers + peft, bf16)
├── eval.py           # scored eval: tricky-case checks + chrF vs teacher
├── eval_cases.jsonl  # curated gold checks (bake-off cases live here)
├── requirements.txt
├── data/             # generated (gitignored): train.jsonl, heldout.jsonl
└── runs/             # training outputs (gitignored)
```

## Usage

```bash
uv venv --python 3.11 .venv
uv pip install -r requirements.txt --index-strategy unsafe-best-match
# 1. generate data (teacher must be loaded in LM Studio; unload big models first)
python datagen.py sources --out data/sources.jsonl
python datagen.py labels --sources data/sources.jsonl --out data/labeled.jsonl
python datagen.py split --labeled data/labeled.jsonl --outdir data
# 2. train
python train.py --data data/train.jsonl --out runs/r8-lr2e4 --rank 8 --lr 2e-4 --epochs 2
# 3. eval (prints one JSON line with "score")
python eval.py --adapter runs/r8-lr2e4
```

The kotrain training run drives steps 2-3 in a loop, varying hyperparameters
and reporting each experiment's `score`.

## Scoring

`score = 40 * case_pass_rate + 40 * chrF_practical/100 + 20 * json_valid_rate`

- `case_pass_rate`: fraction of `eval_cases.jsonl` where the practical output
  passes its `must_any` / `must_not` keyword checks (e.g. 「納期ちょっと巻きで」
  must read as *earlier*, never *extended*).
- `chrF_practical`: chrF of practical translations vs teacher labels on the
  held-out split.
- `json_valid_rate`: fraction of outputs that parse as the required JSON.
