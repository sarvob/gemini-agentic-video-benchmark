# Gemini video benchmark protocol v0.2

**Frozen:** 2026-09-02, before any v0.2 API call

Version 0.2 corrects measurement ambiguity found by the v0.1 smoke pair. Scores from the versions must remain separate.

## Changes from v0.1

- Require exactly six highlight-sized moments, each 2–20 seconds. Broad chapters are invalid.
- Keep brief audio, visual, and cross-modal events in a separate collection.
- Require every evidence-question ID and candidate segment ID exactly once.
- Require kept ranges to stay inside their candidate segments.
- Require declared target duration to equal the exact sum of returned kept ranges.
- Score evidence with frozen keyword-conjunction rules plus temporal overlap. These rules test expected factual concepts without penalizing harmless paraphrase.

## Evidence scoring

Each question has a predeclared list of lowercase concepts. An answer passes only when its normalized text contains every concept and its cited interval overlaps the gold interval. No model judges model answers. Rules are frozen in `evidence-rules-v0.2.json` before either v0.2 arm runs.

This keyword method can still miss valid synonyms or accept negation mistakes. Publish per-question outputs and rules, and report the result as **rule-based evidence accuracy**, not human semantic accuracy.

## Retry policy

One request per arm per fixture. Invalid JSON, missing IDs, duplicate IDs, invalid ranges, or absent agentic `processing_call` steps count as invalid runs. There is no repair call. Provider/network failure before usage is reported may be retried once for both arms under the same rule and cost ledger.
