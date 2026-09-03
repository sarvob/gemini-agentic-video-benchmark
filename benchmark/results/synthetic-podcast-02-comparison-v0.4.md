# Synthetic podcast 02 paired comparison — protocol v0.4

**Fixture:** second synthetic 10-minute two-host podcast
**Model:** Gemini 3.7 Flash
**Protocol:** v0.4
**Pair status:** both structurally valid

Positive deltas below mean agentic was higher; negative deltas mean agentic was lower.

| Measure | Agentic | Static | Agentic − static |
|---|---:|---:|---:|
| Moment-retrieval F1 | 0.3333 | 0.1667 | +0.1667 |
| Short-event recall | 1.0000 | 0.7500 | +0.2500 |
| Rule-based evidence accuracy | 0.8333 | 0.9167 | −0.0833 |
| Edit-decision macro F1 | 0.9333 | 0.6667 | +0.2667 |
| Boundary error, median | 1 s | 0 s | +1 s |
| Boundary error, p90 | 5 s | 2 s | +3 s |
| All automated brief constraints | fail | fail | tie |
| Selected duration | 126 s | 130 s | −4 s |
| Input + tool-use tokens | 146,830 | 56,476 | +159.99% |
| Total accounted tokens | 156,076 | 59,080 | +164.18% |
| Paid-equivalent cost | $0.065780 | $0.052122 | +26.20% |
| Latency | 59.447 s | 24.992 s | +137.86% |

## What this one pair says

Agentic found all four short events versus three for static and scored higher on moment retrieval and edit decisions. Static scored higher on the frozen evidence checks and had lower boundary errors. Both modes exceeded the 120-second duration maximum: agentic by six seconds and static by ten.

Agentic used 164.18% more total accounted tokens, cost 26.20% more, and took 137.86% longer. This is one synthetic podcast pair and does not establish a format-level pattern.

## Limits

- This is one synthetic fixture and the fifth valid pair; it is not a benchmark conclusion by itself.
- Story retention/coherence and cut-seam defects were not human-reviewed.
- Evidence accuracy is a frozen rule-based check, not a human semantic judgment.
- Solo-02 is excluded because its agentic output was unparseable and no static arm ran.
- The six-fixture pilot remains exploratory and does not satisfy the parent protocol's twelve-video publication threshold.

Inputs: `synthetic-podcast-02-agentic-v0.4.json` and `synthetic-podcast-02-static-v0.4.json`. Deltas are reproducible with `tools/compare-gemini-video-results.ts`.
