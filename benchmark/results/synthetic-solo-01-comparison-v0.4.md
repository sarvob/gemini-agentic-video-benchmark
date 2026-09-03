# Synthetic solo 01 paired comparison — protocol v0.4

**Fixture:** synthetic 10-minute solo-creator video
**Model:** Gemini 3.7 Flash
**Protocol:** v0.4
**Pair status:** both structurally valid

Positive deltas below mean agentic was higher; negative deltas mean agentic was lower.

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.1667 | 0.1667 | 0.0000 |
| Short-event recall | 1.0000 | 1.0000 | 0.0000 |
| Rule-based evidence accuracy | 0.9167 | 1.0000 | −0.0833 |
| Edit-decision macro F1 | 0.7407 | 0.4074 | +0.3333 |
| Boundary error, median | 0 s | 0 s | 0 s |
| Boundary error, p90 | 2 s | 2 s | 0 s |
| All automated brief constraints | pass | pass | tie |
| Selected duration | 112 s | 116 s | −4 s |
| Input + tool-use tokens | 59,034 | 55,570 | +6.23% |
| Total accounted tokens | 66,509 | 57,565 | +15.54% |
| Paid-equivalent cost | $0.072307 | $0.049159 | +47.09% |
| Latency | 48.165 s | 23.481 s | +105.12% |

## What this one pair says

Both modes found all four short events and tied on moment retrieval and boundary error. Static answered all twelve frozen evidence checks versus eleven for agentic. Agentic scored 0.3333 higher on edit-decision macro F1, driven by identifying all three visual-support decisions while static identified none.

Agentic used 15.54% more total accounted tokens, cost 47.09% more, and took just over twice as long. This third pair adds another mixed result rather than supporting a broad winner claim.

## Limits

- This is one synthetic fixture and the third valid pair; it is not a benchmark conclusion by itself.
- Story retention/coherence and cut-seam defects were not human-reviewed.
- Evidence accuracy is a frozen rule-based check, not a human semantic judgment.
- Scores from earlier protocol versions are excluded.
- The six-fixture pilot remains exploratory and does not satisfy the parent protocol's twelve-video publication threshold.

Inputs: `synthetic-solo-01-agentic-v0.4.json` and `synthetic-solo-01-static-v0.4.json`. Deltas are reproducible with `tools/compare-gemini-video-results.ts`.
