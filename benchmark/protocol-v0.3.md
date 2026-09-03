# Gemini video benchmark protocol v0.3

**Frozen:** 2026-09-02, before any v0.3 API call
**Runtime status:** not active at freeze time

Version 0.3 preserves the v0.2 task and metrics while changing the response envelope after the only v0.2 agentic attempt returned `incomplete`. The exact provider reason was unavailable. Scores from v0.1, v0.2, and v0.3 must remain separate.

## Changes from v0.2

- Raise `generation_config.max_output_tokens` from 4,096 to 8,192.
- Keep `thinking_level: low`.
- Limit the summary to 30 words.
- Limit each evidence answer to 20 words.
- Limit each moment and event label to 8 words.
- Continue to prohibit any explanation outside the JSON object.

The output fields, array cardinalities, fixture, ground truth, evidence rules, metric definitions, and brief remain unchanged. The wording caps apply only to unscored prose and must be validated locally.

## Retained v0.2 invariants

- Exactly six highlight-sized moments, each 2–20 seconds.
- Brief events remain separate from moments.
- Every evidence-question ID and candidate segment ID appears exactly once.
- Kept ranges stay inside their candidate segments.
- Declared target duration equals the exact sum of returned kept ranges.
- Rule-based evidence scoring uses the already frozen concept conjunctions plus temporal overlap.
- Agentic success requires a `processing_call` step.

## Response-envelope rationale

The 8,192 ceiling is the smallest power-of-two ceiling above the failed 4,096 setting. It gives 3.30× headroom over the largest observed successful visible output of 2,479 tokens and stays well below Gemini 3.7 Flash's documented 65,536 output-token limit. The wording caps reduce output that does not affect scoring.

This does not claim that 4,096 caused the v0.2 failure. It creates an explicit diagnostic change while preserving the scored task.

See `response-envelope-v0.3.md` for the size and cost calculation.

## Cost guard

For the 600-second smoke fixture, the conservative maximum is $0.188220 per request and $0.376440 for the pair. With $0.107699 already accounted, the projected cumulative maximum after the pair is $0.484139, below the $4.50 operational stop.

Every request must still pass the runner's live pre-call guard and append actual returned usage to the immutable spend ledger.

## Retry policy

One request per arm per fixture. Invalid JSON, missing IDs, duplicate IDs, invalid ranges, wording-cap violations, or absent agentic `processing_call` steps count as invalid runs. There is no repair call. A provider or network failure before usage is reported may be retried once for both arms under the same rule and cost ledger.
