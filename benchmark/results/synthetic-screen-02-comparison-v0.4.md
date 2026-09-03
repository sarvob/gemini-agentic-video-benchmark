# Synthetic screen 02 paired comparison — protocol v0.4

**Fixture:** second synthetic 10-minute video
**Model:** Gemini 3.7 Flash
**Protocol:** v0.4
**Pair status:** both structurally valid

Positive deltas below mean agentic was higher; negative deltas mean agentic was lower.

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.1667 | 0.3333 | −0.1667 |
| Short-event recall | 1.0000 | 0.7500 | +0.2500 |
| Rule-based evidence accuracy | 0.8333 | 0.9167 | −0.0833 |
| Edit-decision macro F1 | 0.2222 | 0.3333 | −0.1111 |
| Boundary error, median | 0 s | 0 s | 0 s |
| Boundary error, p90 | 4 s | 2 s | +2 s |
| All automated brief constraints | pass | pass | tie |
| Selected duration | 112 s | 109 s | +3 s |
| Input + tool-use tokens | 61,282 | 54,119 | +13.24% |
| Total accounted tokens | 70,204 | 55,715 | +26.01% |
| Paid-equivalent cost | $0.072176 | $0.046574 | +54.97% |
| Latency | 51.779 s | 26.724 s | +93.75% |

## What this one pair says

Agentic again found all four short events while static found three. Unlike screen-01, static scored higher on moment retrieval, rule-based evidence accuracy, edit-decision macro F1, and p90 boundary error.

Agentic also used more tokens in every aggregate shown here, cost 54.97% more, and took almost twice as long. The result reverses several screen-01 quality and efficiency differences, which is evidence that a one-fixture claim would have been unstable.

## Limits

- This is one synthetic fixture and the second valid pair; it is not a benchmark conclusion by itself.
- Story retention/coherence and cut-seam defects were not human-reviewed.
- Evidence accuracy is a frozen rule-based check, not a human semantic judgment.
- Scores from earlier protocol versions are excluded.
- The six-fixture pilot remains exploratory and does not satisfy the parent protocol's twelve-video publication threshold.

Inputs: `synthetic-screen-02-agentic-v0.4.json` and `synthetic-screen-02-static-v0.4.json`. Deltas are reproducible with `tools/compare-gemini-video-results.ts`.
