"""Build the offline replay using the existing Honeybot evidence extractor."""

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))

from honeybot.clue_evaluation import structured_clues


def build():
    sessions = json.loads((ROOT / "scenarios.json").read_text(encoding="utf-8"))
    for session in sessions:
        for turn, message in enumerate(session["messages"], 1):
            message_id = f'{session["id"]}-{turn}'
            message["id"] = message_id
            message["clues"] = []
            if message["role"] != "peer":
                continue
            message["clues"] = structured_clues(message["text"], message_id, turn)
            for match in re.finditer(r"收款代碼：(DEMO-[A-Z]+-\d+)", message["text"]):
                message["clues"].append({
                    "kind": "account", "value": match[1], "evidence": match[0],
                    "start": match.start(), "end": match.end(),
                    "source_message_id": message_id, "turn": turn,
                    "method": "demo_account_pattern",
                    "verification": "unverified_suspicion_not_confirmed_fraud",
                })
    return "window.replayData = " + json.dumps(sessions, ensure_ascii=False, indent=2) + ";\n"


if __name__ == "__main__":
    output = ROOT / "demo" / "replay-data.js"
    generated = build()
    if sys.argv[1:] == ["--check"]:
        if output.read_text(encoding="utf-8") != generated:
            raise SystemExit("Replay data is stale. Run python hackathon/build_replay.py")
        print("Replay data matches the Honeybot extractor and synthetic scenarios.")
    else:
        output.write_text(generated, encoding="utf-8")
