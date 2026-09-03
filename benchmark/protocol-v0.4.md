# Gemini video benchmark protocol v0.4

**Frozen:** 2026-09-02, before any v0.4 API call
**Runtime status:** not active at freeze time

Version 0.4 removes one redundant response field after the only v0.3 agentic candidate returned kept ranges totaling 117 seconds but separately declared 107 seconds. v0.3 remains invalid under its frozen rules. Scores from v0.1–v0.4 must remain separate.

## Change from v0.3

- Remove `constraints.target_duration_sec` from the response schema.
- Compute selected duration deterministically from all non-cut kept ranges.
- Pass the target-duration constraint when that computed sum is between 90 and 120 seconds, inclusive.

The model must not return a separate duration total. All other v0.3 task conditions remain unchanged.

## Retained conditions

- Model: `gemini-3.7-flash`.
- Response ceiling: 8,192 tokens.
- Thinking level: low.
- Exactly six highlight-sized moments, each 2–20 seconds.
- Brief events remain separate from moments.
- Every evidence-question ID and candidate segment ID appears exactly once.
- Kept ranges stay inside their candidate segments; cut decisions omit kept ranges.
- Rule-based evidence scoring uses the frozen concept conjunctions plus temporal overlap.
- Summary, answer, and label caps remain 30, 20, and 8 words.
- `constraints.required_order` and `constraints.must_keep_event_ids` remain required.
- Agentic success requires a `processing_call` step.

The fixture, ground truth, evidence rules, moment rules, event rules, decision classes, and ten parent metrics remain unchanged.

## Rationale

Target-duration compliance is a property of the returned edit ranges, not the model's arithmetic self-report. Computing it locally preserves the intended brief-constraint metric and removes an unnecessary source of invalid responses. See `duration-field-audit.md`.

## Cost guard

The 8,192-token ceiling is unchanged, so the conservative maximum remains $0.188220 per 600-second request. With $0.165360 already accounted, a complete v0.4 pair would project to at most $0.541800 cumulative paid-equivalent, below the $4.50 operational stop.

Every request must still pass the runner's live pre-call guard and append returned usage to the immutable ledger.

## Retry policy

One request per arm per fixture. Invalid JSON, missing IDs, duplicate IDs, invalid ranges, wording-cap violations, a returned duration-total field, or absent agentic `processing_call` steps count as invalid runs. There is no repair call. A provider or network failure before usage is reported may be retried once for both arms under the same rule and cost ledger.
