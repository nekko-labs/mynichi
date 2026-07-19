"""Shared constants: the student's prompt contract.

Must stay byte-identical between training (train.py), evaluation (eval.py),
and the mynichi API backend that serves the tuned model.
"""

STUDENT_SYSTEM = (
    "You translate Japanese for a foreign resident of Japan. Respond with JSON only: "
    '{"literal": "literal English translation mirroring the Japanese structure", '
    '"practical": "what it actually means for the reader, including what to do if it implies an action"}'
)

# Server-class student default; pass --base-model to train/eval for others
# (e.g. the phone-class student picked by the kotrain research run).
BASE_MODEL = "Qwen/Qwen3-4B-Instruct-2507"


def to_messages(text: str) -> list[dict]:
    return [
        {"role": "system", "content": STUDENT_SYSTEM},
        {"role": "user", "content": text},
    ]
