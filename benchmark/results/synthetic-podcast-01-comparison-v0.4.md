# Synthetic podcast 01 paired comparison — protocol v0.4

**Fixture:** synthetic 10-minute two-host podcast
**Model:** Gemini 3.7 Flash
**Protocol:** v0.4
**Pair status:** both structurally valid

Positive deltas below mean agentic was higher; negative deltas mean agentic was lower.

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.5000 | 0.6667 | −0.1667 |
| Short-event recall | 0.5000 | 0.5000 | 0.0000 |
| Rule-based evidence accuracy | 0.7500 | 0.8333 | −0.0833 |
| Edit-decision macro F1 | 0.8333 | 1.0000 | −0.1667 |
| Boundary error, median | 3 s | 0 s | +3 s |
| Boundary error, p90 | 4 s | 3 s | +1 s |
| All automated brief constraints | pass | pass | tie |
| Selected duration | 115 s | 119 s | −4 s |
| Input + tool-use tokens | 34,681 | 56,482 | −38.60% |
| Total accounted tokens | 41,192 | 58,436 | −29.51% |
| Paid-equivalent cost | $0.050427 | $0.049689 | +1.49% |
| Latency | 39.201 s | 25.869 s | +51.54% |

## What this one pair says

Both modes found two of four short events and passed every automated brief constraint. Static scored higher on moment retrieval, rule-based evidence accuracy, edit decisions, and both boundary-error summaries.

Agentic used 29.51% fewer total accounted tokens, but paid-equivalent cost was 1.49% higher and latency was 51.54% longer. This is the first podcast-format pair and does not establish a format-level pattern.

## Limits

- This is one synthetic fixture and the fourth valid pair; it is not a benchmark conclusion by itself.
- Story retention/coherence and cut-seam defects were not human-reviewed.
- Evidence accuracy is a frozen rule-based check, not a human semantic judgment.
- Scores from earlier protocol versions are excluded.
- The six-fixture pilot remains exploratory and does not satisfy the parent protocol's twelve-video publication threshold.

Inputs: `synthetic-podcast-01-agentic-v0.4.json` and `synthetic-podcast-01-static-v0.4.json`. Deltas are reproducible with `tools/compare-gemini-video-results.ts`.
