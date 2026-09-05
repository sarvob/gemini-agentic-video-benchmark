#!/usr/bin/env python3
"""Read the committed flat benchmark summary with Python's standard library."""

import csv
import json
import sys
from pathlib import Path


def load_summary(path: Path) -> dict[str, object]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = {(row["section"], row["metric"]): row for row in csv.DictReader(handle)}

    recall = rows[("quality", "shortEventRecall")]
    latency = rows[("efficiency", "latencyMs")]
    return {
        "source": path.as_posix(),
        "shortEventRecall": {
            "agentic": float(recall["agentic"]),
            "static": float(recall["static"]),
            "agenticMinusStatic": float(recall["agentic_minus_static"]),
        },
        "latency": {
            "agenticMs": int(latency["agentic"]),
            "staticMs": int(latency["static"]),
            "agenticVsStaticPercent": float(latency["agentic_vs_static_percent"]),
        },
    }


csv_path = Path(sys.argv[1] if len(sys.argv) > 1 else "benchmark/final-results.csv")
print(json.dumps(load_summary(csv_path), indent=2))
