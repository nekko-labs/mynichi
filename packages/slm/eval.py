"""Scored evaluation of a student checkpoint (or the raw base model).

Prints one JSON line, e.g.:
  {"score": 71.4, "case_pass": 0.83, "chrf": 41.2, "json_valid": 1.0, "n_cases": 12, "n_heldout": 80}

score = 40 * case_pass + 40 * chrf/100 + 20 * json_valid

Usage:
  python eval.py --adapter runs/r8-lr2e4          # base + LoRA adapter
  python eval.py --base-only                      # untuned baseline
  python eval.py --api-model <id>                 # a model served by LM Studio
"""

import argparse
import json
import sys
from pathlib import Path

from common import BASE_MODEL, to_messages

MAX_NEW = 512


def load_hf_generator(adapter: str | None):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.bfloat16, device_map="cuda")
    if adapter:
        from peft import PeftModel

        model = PeftModel.from_pretrained(model, adapter)
    model.eval()

    @torch.inference_mode()
    def generate(text: str) -> str:
        prompt = tokenizer.apply_chat_template(to_messages(text), tokenize=False, add_generation_prompt=True)
        ids = tokenizer(prompt, return_tensors="pt").to(model.device)
        out = model.generate(**ids, max_new_tokens=MAX_NEW, do_sample=False, temperature=None, top_p=None, top_k=None)
        return tokenizer.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)

    return generate


def load_api_generator(model_id: str, base_url: str):
    import requests

    def generate(text: str) -> str:
        r = requests.post(
            f"{base_url}/chat/completions",
            json={"model": model_id, "messages": to_messages(text), "temperature": 0, "stream": False},
            timeout=300,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    return generate


def parse_json(raw: str) -> dict | None:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw[raw.find("{"):]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        obj = json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict) or "literal" not in obj or "practical" not in obj:
        return None
    return obj


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--adapter")
    p.add_argument("--base-only", action="store_true")
    p.add_argument("--api-model")
    p.add_argument("--api-url", default="http://127.0.0.1:1338/v1")
    p.add_argument("--cases", type=Path, default=Path("eval_cases.jsonl"))
    p.add_argument("--heldout", type=Path, default=Path("data/heldout.jsonl"))
    p.add_argument("--max-heldout", type=int, default=80)
    a = p.parse_args()

    if a.api_model:
        generate = load_api_generator(a.api_model, a.api_url)
    else:
        generate = load_hf_generator(None if a.base_only else a.adapter)

    total, valid = 0, 0

    def run(text: str) -> dict | None:
        nonlocal total, valid
        total += 1
        obj = parse_json(generate(text))
        if obj is not None:
            valid += 1
        return obj

    # 1. curated tricky cases
    cases = [json.loads(x) for x in a.cases.read_text(encoding="utf-8").splitlines()]
    passed = 0
    for c in cases:
        obj = run(c["text"])
        got = (obj or {}).get(c["field"], "").lower()
        ok = bool(obj) and any(m.lower() in got for m in c["must_any"]) and not any(
            m.lower() in got for m in c["must_not"]
        )
        passed += ok
        print(f"  case {'PASS' if ok else 'FAIL'}: {c['text'][:30]}... -> {got[:80]}", file=sys.stderr)
    case_pass = passed / len(cases) if cases else 0.0

    # 2. chrF vs teacher labels on held-out
    chrf_score = 0.0
    n_heldout = 0
    if a.heldout.exists():
        import sacrebleu

        rows = [json.loads(x) for x in a.heldout.read_text(encoding="utf-8").splitlines()][: a.max_heldout]
        n_heldout = len(rows)
        hyps, refs = [], []
        for r in rows:
            obj = run(r["text"])
            hyps.append((obj or {}).get("practical", ""))
            refs.append(r["practical"])
        chrf_score = sacrebleu.corpus_chrf(hyps, [refs]).score if rows else 0.0

    json_valid = valid / total if total else 0.0
    score = 40 * case_pass + 40 * (chrf_score / 100) + 20 * json_valid
    print(
        json.dumps(
            {
                "score": round(score, 2),
                "case_pass": round(case_pass, 3),
                "chrf": round(chrf_score, 2),
                "json_valid": round(json_valid, 3),
                "n_cases": len(cases),
                "n_heldout": n_heldout,
            }
        )
    )


if __name__ == "__main__":
    main()
