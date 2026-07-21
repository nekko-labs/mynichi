"""Merge the winning LoRA adapter into the base model, convert it to GGUF, and
load it into LM Studio so the mynichi API can serve it.

The API's free-tier translate path (apps/api/src/translate/backends.ts) calls a
single model, `mynichi-translate`, over an OpenAI-compatible endpoint. This
script produces it:

  1. load the Apache-2.0 base (Qwen3-4B-Instruct-2507) + the LoRA adapter, merge
     the adapter weights in (peft `merge_and_unload`), save the merged model +
     tokenizer to <out> as safetensors,
  2. convert the merged model to an f16 GGUF with llama.cpp's `convert_hf_to_gguf.py`,
  3. import the GGUF into LM Studio (`lms import`) and load it (`lms load`) with a
     capped context, exposed on LM Studio's server as `mynichi-translate`.

Why LM Studio and not Ollama: Ollama 0.23's bundled llama.cpp mis-serves this
Qwen3-2507 GGUF (non-deterministic garbage, and it reverts hard cases like
「巻きで」). LM Studio ships a current, user-updatable llama.cpp runtime that
serves the identical GGUF correctly. backends.ts talks to it over the
OpenAI-compatible API, so a vLLM server is a drop-in replacement for production.

Decoding MUST be greedy (top_k 1, repeat_penalty 1.0) to match training/eval;
backends.ts sends those params. The Modelfile/preset defaults here are a
convenience only.

Toolchain for step 2 (converter + gguf library pinned to the SAME llama.cpp tag;
PyPI `gguf` drifts out of sync with the converter and crashes on enum mismatches):

    curl -fsSL -o convert_hf_to_gguf.py \\
      https://raw.githubusercontent.com/ggml-org/llama.cpp/b9000/convert_hf_to_gguf.py
    # install the matching gguf library from the same tag. On Windows, `pip install
    # "gguf @ git+...#subdirectory=gguf-py"` can hit long-path errors; if so, download
    # the tag tarball and `pip install` the extracted gguf-py/ directory instead.
    pip install "gguf @ git+https://github.com/ggml-org/llama.cpp.git@b9000#subdirectory=gguf-py"

`convert_hf_to_gguf.py` and the build artifacts (*-merged/, *.gguf) are gitignored.

Usage:
  python export_gguf.py                 # merge + convert, print the lms import/load cmds
  python export_gguf.py --load          # merge + convert + lms import + lms load
"""

import argparse
import subprocess
import sys
from pathlib import Path

from common import BASE_MODEL


def merge(adapter: str, base_model: str, out: Path) -> None:
    import torch
    from peft import PeftModel
    from transformers import AutoModelForCausalLM, AutoTokenizer

    print(f"[export] loading base {base_model}", file=sys.stderr)
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model = AutoModelForCausalLM.from_pretrained(
        base_model, torch_dtype=torch.bfloat16, device_map="cuda"
    )
    print(f"[export] applying adapter {adapter}", file=sys.stderr)
    model = PeftModel.from_pretrained(model, adapter)
    print("[export] merging adapter weights", file=sys.stderr)
    model = model.merge_and_unload()

    out.mkdir(parents=True, exist_ok=True)
    print(f"[export] saving merged model to {out}", file=sys.stderr)
    model.save_pretrained(out, safe_serialization=True)
    tokenizer.save_pretrained(out)


def convert(merged: Path, gguf: Path, convert_script: Path) -> None:
    if not convert_script.exists():
        sys.exit(
            f"[export] {convert_script} not found. Fetch it (see this file's docstring):\n"
            f"  curl -fsSL -o {convert_script} "
            f"https://raw.githubusercontent.com/ggml-org/llama.cpp/b9000/convert_hf_to_gguf.py"
        )
    cmd = [sys.executable, str(convert_script), str(merged), "--outfile", str(gguf), "--outtype", "f16"]
    print(f"[export] {' '.join(cmd)}", file=sys.stderr)
    subprocess.run(cmd, check=True)


def lms_import_and_load(gguf: Path, name: str, user_repo: str, context: int) -> None:
    imp = ["lms", "import", str(gguf), "--user-repo", user_repo, "-L", "-y"]
    print(f"[export] {' '.join(imp)}", file=sys.stderr)
    subprocess.run(imp, check=True)
    # `lms ls` keys the model by the repo name; load it and pin the API identifier.
    load = ["lms", "load", user_repo.split("/")[-1], "--gpu", "max",
            "--context-length", str(context), "--identifier", name, "-y"]
    print(f"[export] {' '.join(load)}", file=sys.stderr)
    subprocess.run(load, check=True)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--adapter", default="runs/r16-lr2e4-e3")
    p.add_argument("--base-model", default=BASE_MODEL)
    p.add_argument("--out", help="merged model dir (default: <adapter>-merged)")
    p.add_argument("--gguf", help="f16 gguf path (default: runs/<name>-f16.gguf)")
    p.add_argument("--convert-script", default="convert_hf_to_gguf.py")
    p.add_argument("--name", default="mynichi-translate", help="API identifier in LM Studio")
    p.add_argument("--user-repo", default="mynichi/translate", help="LM Studio import repo")
    p.add_argument("--context-length", type=int, default=8192)
    p.add_argument("--load", action="store_true", help="import + load into LM Studio after converting")
    a = p.parse_args()

    out = Path(a.out) if a.out else Path(a.adapter + "-merged")
    gguf = Path(a.gguf) if a.gguf else Path("runs") / f"{a.name}-f16.gguf"

    merge(a.adapter, a.base_model, out)
    convert(out, gguf, Path(a.convert_script))

    if a.load:
        lms_import_and_load(gguf, a.name, a.user_repo, a.context_length)
        print(f"[export] done. Served by LM Studio as '{a.name}' on its OpenAI API.", file=sys.stderr)
    else:
        print(
            f"[export] converted {gguf}. To serve via LM Studio:\n"
            f"  lms import {gguf} --user-repo {a.user_repo} -L -y\n"
            f"  lms load {a.user_repo.split('/')[-1]} --gpu max "
            f"--context-length {a.context_length} --identifier {a.name} -y",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
