"""Detached experiment runner for agent-driven training (Nekkos).

The Nekkos agent's bash tool kills anything after 120 seconds, so training
must run detached. This wrapper starts train.py + eval.py as a background
process and lets the agent poll for the result.

  python launch.py start --out runs/r8 --rank 8 --lr 2e-4 --epochs 2
  python launch.py eval --out runs/cand-e4b -- --api-model google/gemma-4-e4b
  python launch.py status --out runs/r8
  python launch.py active

`start` returns immediately. `status` prints runs/<name>/result.json plus the
log tail; when "status" is "done" the JSON includes the eval score.
Only one experiment may run at a time (one GPU).
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).parent
PYTHON = str(HERE / ".venv" / "Scripts" / "python.exe")
ACTIVE = HERE / "runs" / ".active.json"

TRAIN_FLAGS = ["rank", "alpha", "lr", "epochs", "batch", "grad_accum", "max_steps", "data"]


def pid_alive(pid: int) -> bool:
    out = subprocess.run(
        ["tasklist", "/FI", f"PID eq {pid}", "/NH"], capture_output=True, text=True, check=False
    ).stdout
    return str(pid) in out


def start(args: argparse.Namespace, extra: list[str]) -> None:
    out = Path(args.out)
    if ACTIVE.exists():
        info = json.loads(ACTIVE.read_text(encoding="utf-8"))
        if pid_alive(info["pid"]):
            print(json.dumps({"error": f"experiment {info['out']} still running (pid {info['pid']}), wait for it"}))
            return
    out.mkdir(parents=True, exist_ok=True)
    (out / "result.json").write_text(json.dumps({"status": "running", "started": time.time()}), encoding="utf-8")
    log = (out / "log.txt").open("w", encoding="utf-8")
    worker = "_worker_eval" if args.cmd == "eval" else "_worker"
    worker_args = [PYTHON, str(HERE / "launch.py"), worker, "--out", str(out), *extra]
    proc = subprocess.Popen(
        worker_args,
        stdout=log,
        stderr=subprocess.STDOUT,
        cwd=str(HERE),
        creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
    )
    ACTIVE.parent.mkdir(exist_ok=True)
    ACTIVE.write_text(json.dumps({"pid": proc.pid, "out": str(out)}), encoding="utf-8")
    print(json.dumps({"status": "started", "pid": proc.pid, "out": str(out)}))


def worker(args: argparse.Namespace, extra: list[str]) -> None:
    out = Path(args.out)
    result: dict = {"status": "running", "started": time.time()}
    try:
        train_cmd = [PYTHON, str(HERE / "train.py"), "--out", str(out), *extra]
        print(f"+ {' '.join(train_cmd)}", flush=True)
        subprocess.run(train_cmd, check=True, cwd=str(HERE))
        train_info = json.loads((out / "train_result.json").read_text(encoding="utf-8"))
        eval_cmd = [PYTHON, str(HERE / "eval.py"), "--adapter", str(out)]
        print(f"+ {' '.join(eval_cmd)}", flush=True)
        proc = subprocess.run(eval_cmd, check=True, cwd=str(HERE), capture_output=True, text=True)
        print(proc.stderr, flush=True)
        metrics = json.loads(proc.stdout.strip().splitlines()[-1])
        result = {"status": "done", "loss": train_info["loss"], **metrics}
    except Exception as e:  # noqa: BLE001 - record any failure for the poller
        result = {"status": "error", "error": str(e)[:2000]}
    result["ended"] = time.time()
    (out / "result.json").write_text(json.dumps(result), encoding="utf-8")
    if ACTIVE.exists():
        ACTIVE.unlink()


def worker_eval(args: argparse.Namespace, extra: list[str]) -> None:
    out = Path(args.out)
    extra = [a for a in extra if a != "--"]
    try:
        cmd = [PYTHON, str(HERE / "eval.py"), *extra]
        print(f"+ {' '.join(cmd)}", flush=True)
        proc = subprocess.run(cmd, check=True, cwd=str(HERE), capture_output=True, text=True)
        print(proc.stderr, flush=True)
        metrics = json.loads(proc.stdout.strip().splitlines()[-1])
        result = {"status": "done", **metrics}
    except Exception as e:  # noqa: BLE001 - record any failure for the poller
        result = {"status": "error", "error": str(e)[:2000]}
    result["ended"] = time.time()
    (out / "result.json").write_text(json.dumps(result), encoding="utf-8")
    if ACTIVE.exists():
        ACTIVE.unlink()


def status(args: argparse.Namespace) -> None:
    out = Path(args.out)
    res = out / "result.json"
    print((res.read_text(encoding="utf-8") if res.exists() else '{"status": "not-found"}'))
    log = out / "log.txt"
    if log.exists():
        tail = log.read_text(encoding="utf-8", errors="replace").splitlines()[-5:]
        print("--- log tail ---")
        print("\n".join(tail))


def active() -> None:
    if not ACTIVE.exists():
        print(json.dumps({"active": None}))
        return
    info = json.loads(ACTIVE.read_text(encoding="utf-8"))
    info["alive"] = pid_alive(info["pid"])
    print(json.dumps(info))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["start", "eval", "status", "active", "_worker", "_worker_eval"])
    p.add_argument("--out")
    known, rest = p.parse_known_args()
    if known.cmd in ("start", "eval"):
        start(known, rest)
    elif known.cmd == "_worker":
        worker(known, rest)
    elif known.cmd == "_worker_eval":
        worker_eval(known, rest)
    elif known.cmd == "status":
        status(known)
    else:
        active()
