"""Generate the training corpus with a local teacher model (LM Studio).

Three subcommands, run in order:
  sources  -> data/sources.jsonl   (synthetic Japanese texts by category)
  labels   -> data/labeled.jsonl   ({text, literal, practical, category})
  split    -> data/train.jsonl + data/heldout.jsonl

The teacher must be loaded in LM Studio (default qwen/qwen3.6-27b). Unload
other large models first so it fits: `lms unload --all && lms load qwen/qwen3.6-27b`.
"""

import argparse
import json
import random
import sys
import time
from pathlib import Path

import requests

BASE_URL = "http://127.0.0.1:1338/v1"
# Default teacher. qwen3.6-27b (Apache) is the license-cleanest choice but its
# always-on reasoning makes bulk generation ~10x slower; gemma-4-31b-qat is the
# fast/strong default. Swap with --teacher for a license-pure regeneration.
TEACHER = "google/gemma-4-31b-qat"

CATEGORIES: dict[str, str] = {
    "ward-office": "letters and notices from a Japanese city/ward office (国民健康保険, 年金, 住民税, マイナンバー, 児童手当)",
    "workplace-chat": "casual Japanese business chat messages between coworkers (Slack/Teams tone, includes idioms like 巻きで, 前倒し, 持ち帰る, なるはや, リスケ)",
    "apartment": "notices posted in or delivered to a Japanese apartment building (断水, 工事, ゴミ出し, 管理組合, 更新料)",
    "shop-sign": "short signs and notices in Japanese shops and restaurants (営業時間, 定休日, 売り切れ, セルフレジ, 食券)",
    "hospital": "instructions and notices from Japanese clinics and hospitals (問診票, 処方箋, 診察券, 空腹時, 再診)",
    "delivery": "Japanese delivery slips and app notifications (不在票, 再配達, 置き配, 宅配ボックス)",
    "train": "Japanese station and train announcements and signs (遅延, 振替輸送, 各駅停車, 優先席, 終電)",
    "bank-tax": "Japanese bank, tax office, and phone-carrier letters (引き落とし, 確定申告, 源泉徴収票, 残高不足, 解約)",
    "school": "notices from Japanese schools and nurseries to parents (保護者, 持ち物, 懇談会, 検温, 上履き)",
    "line-casual": "casual LINE messages between Japanese friends (invitations, canceling plans, slang, abbreviations)",
    "restaurant-menu": "Japanese menu items and ordering notes (税込/税抜, おかわり自由, 品切れ, 辛さ選べます)",
    "official-forms": "field labels and instructions on Japanese paperwork (記入例, 押印, 続柄, 該当する方に〇)",
}

LABEL_SYSTEM = """You are an expert Japanese-to-English translator for foreign residents of Japan.
Translate the given Japanese text. Respond with JSON only:
{
  "literal": "a literal English translation that mirrors the Japanese structure and word choice",
  "practical": "what the text actually means for the reader in plain everyday English, including what they should do if it implies an action"
}
Idiom care (business Japanese): 巻きで/巻きでお願い means EARLIER/faster than planned, never an extension. 持ち帰る in a meeting means to take a question back to consider internally, not to physically take something home. なるはや means as soon as possible. 前倒し means moving something earlier. リスケ means reschedule."""

def extract_json(raw: str, opener: str, closer: str):
    """Lenient JSON extraction. Grammar-constrained decoding (json_schema) stalls
    gemma in LM Studio, so we prompt for JSON and pull out the first block."""
    start, end = raw.find(opener), raw.rfind(closer)
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"no JSON block in: {raw[:120]!r}")
    return json.loads(raw[start : end + 1])


def chat(model: str, messages: list[dict], temperature: float, opener: str, closer: str, retries: int = 3):
    body = {"model": model, "messages": messages, "temperature": temperature, "stream": False, "max_tokens": 4096}
    for attempt in range(retries):
        try:
            r = requests.post(f"{BASE_URL}/chat/completions", json=body, timeout=600)
            r.raise_for_status()
            msg = r.json()["choices"][0]["message"]
            # Reasoning models may leave content empty and put text in reasoning_content.
            raw = (msg.get("content") or "").strip() or (msg.get("reasoning_content") or "").strip()
            return extract_json(raw, opener, closer)
        except Exception as e:  # noqa: BLE001 - retry any transport/parse error
            if attempt == retries - 1:
                raise
            print(f"  retry after error: {e}", file=sys.stderr)
            time.sleep(5)
    raise RuntimeError("unreachable")


def gen_sources(out: Path, per_batch: int, batches: int) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    seen: set[str] = set()
    if out.exists():  # resumable
        for line in out.read_text(encoding="utf-8").splitlines():
            seen.add(json.loads(line)["text"])
        print(f"resuming, {len(seen)} existing")
    with out.open("a", encoding="utf-8") as f:
        for category, desc in CATEGORIES.items():
            for b in range(batches):
                prompt = (
                    f"Generate {per_batch} realistic, distinct Japanese texts: {desc}. "
                    "Vary length (5 to 120 characters), politeness level, and topic. "
                    "Write ONLY natural Japanese as it would really appear, no translations, no romaji. "
                    f"Batch {b + 1} of {batches}, avoid repeating obvious phrasings. "
                    'Respond with ONLY a JSON array of strings: ["...", "..."]'
                )
                texts = chat(TEACHER, [{"role": "user", "content": prompt}], 0.9, "[", "]")
                fresh = [t.strip() for t in texts if isinstance(t, str) and t.strip() and t.strip() not in seen]
                for t in fresh:
                    seen.add(t)
                    f.write(json.dumps({"text": t, "category": category}, ensure_ascii=False) + "\n")
                f.flush()
                print(f"{category} batch {b + 1}/{batches}: +{len(fresh)} (total {len(seen)})")


def gen_labels(sources: Path, out: Path) -> None:
    done: set[str] = set()
    if out.exists():  # resumable
        for line in out.read_text(encoding="utf-8").splitlines():
            done.add(json.loads(line)["text"])
        print(f"resuming, {len(done)} labeled")
    rows = [json.loads(x) for x in sources.read_text(encoding="utf-8").splitlines()]
    with out.open("a", encoding="utf-8") as f:
        for i, row in enumerate(rows):
            if row["text"] in done:
                continue
            label = chat(
                TEACHER,
                [{"role": "system", "content": LABEL_SYSTEM}, {"role": "user", "content": row["text"]}],
                0.2,
                "{",
                "}",
            )
            if not isinstance(label.get("literal"), str) or not isinstance(label.get("practical"), str):
                print(f"  skipping malformed label for: {row['text'][:40]}", file=sys.stderr)
                continue
            f.write(json.dumps({**row, **label}, ensure_ascii=False) + "\n")
            f.flush()
            if (i + 1) % 25 == 0:
                print(f"labeled {i + 1}/{len(rows)}")


def split(labeled: Path, outdir: Path, heldout_n: int) -> None:
    rows = [json.loads(x) for x in labeled.read_text(encoding="utf-8").splitlines()]
    random.Random(42).shuffle(rows)
    heldout, train = rows[:heldout_n], rows[heldout_n:]
    (outdir / "train.jsonl").write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in train), encoding="utf-8"
    )
    (outdir / "heldout.jsonl").write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in heldout), encoding="utf-8"
    )
    print(f"train={len(train)} heldout={len(heldout)}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--teacher", default=TEACHER)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sources")
    s.add_argument("--out", type=Path, default=Path("data/sources.jsonl"))
    s.add_argument("--per-batch", type=int, default=12)
    s.add_argument("--batches", type=int, default=10)
    l = sub.add_parser("labels")
    l.add_argument("--sources", type=Path, default=Path("data/sources.jsonl"))
    l.add_argument("--out", type=Path, default=Path("data/labeled.jsonl"))
    sp = sub.add_parser("split")
    sp.add_argument("--labeled", type=Path, default=Path("data/labeled.jsonl"))
    sp.add_argument("--outdir", type=Path, default=Path("data"))
    sp.add_argument("--heldout", type=int, default=80)
    a = p.parse_args()
    TEACHER = a.teacher
    if a.cmd == "sources":
        gen_sources(a.out, a.per_batch, a.batches)
    elif a.cmd == "labels":
        gen_labels(a.sources, a.out)
    else:
        split(a.labeled, a.outdir, a.heldout)
