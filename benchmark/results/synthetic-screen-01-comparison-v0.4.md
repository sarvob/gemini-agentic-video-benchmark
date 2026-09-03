# Synthetic screen 01 paired comparison — protocol v0.4

**Fixture:** one synthetic 10-minute video
**Model:** Gemini 3.7 Flash
**Protocol:** v0.4
**Pair status:** both structurally valid

Positive deltas below mean agentic was higher; negative deltas mean agentic was lower.

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.1667 | 0.1667 | 0.0000 |
| Short-event recall | 1.0000 | 0.7500 | +0.2500 |
| Rule-based evidence accuracy | 0.8333 | 0.8333 | 0.0000 |
| Edit-decision macro F1 | 0.6741 | 0.3333 | +0.3407 |
| Boundary error, median | 2 s | 5 s | −3 s |
| Boundary error, p90 | 5 s | 5 s | 0 s |
| All automated brief constraints | pass | pass | tie |
| Selected duration | 109 s | 106 s | +3 s |
| Input + tool-use tokens | 49,510 | 53,847 | −8.05% |
| Total accounted tokens | 58,921 | 58,312 | +1.04% |
| Paid-equivalent cost | $0.070088 | $0.057129 | +22.68% |
| Latency | 45.016 s | 33.286 s | +35.24% |

## What this one pair says

Agentic mode found all four brief events while static found three, doubled edit-decision macro F1 relative to static, and reduced median matched-boundary error by three seconds. It did not improve moment F1 or overall rule-based evidence accuracy.

Agentic used 8.05% fewer input-plus-tool tokens, but its additional output and thinking tokens made total accounted tokens 1.04% higher. It was also 22.68% more expensive and 35.24% slower on this run.

## Limits

- This is one synthetic fixture, so none of these differences is a benchmark conclusion.
- Story retention/coherence and cut-seam defects were not human-reviewed.
- Evidence accuracy is a frozen rule-based check, not a human semantic judgment.
- Scores from earlier protocol versions are excluded.
- The six-fixture pilot remains exploratory and does not satisfy the parent protocol's twelve-video publication threshold.

Inputs: `synthetic-screen-01-agentic-v0.4.json` and `synthetic-screen-01-static-v0.4.json`. Deltas are reproducible with `tools/compare-gemini-video-results.ts`.
