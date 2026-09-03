You are producing a candidate edit plan for a long-form creator video. This is protocol v0.4.

Return only valid JSON in this exact shape:

```json
{
  "summary": "string",
  "evidence_answers": [{ "question_id": "t1", "answer": "string", "start_sec": 0, "end_sec": 1 }],
  "moments": [{ "id": "string", "label": "string", "start_sec": 0, "end_sec": 1 }],
  "events": [{ "id": "string", "label": "string", "modality": "visual|audio|cross-modal", "start_sec": 0, "end_sec": 1 }],
  "decisions": [{ "segment_id": "segment-01", "decision": "keep|cut|compress|visual-support", "keep_start_sec": 0, "keep_end_sec": 1 }],
  "constraints": { "required_order": ["string"], "must_keep_event_ids": ["string"] }
}
```

Return exactly six `moments`. A moment is a highlight-sized excerpt, not a chapter: each must last between 2 and 20 seconds and should be the smallest interval that preserves the useful idea. Do not use full workflow-stage ranges as moments.

Return brief detectable occurrences only in `events`, separate from `moments`. Include audio-only, visual-only, and cross-modal events lasting two seconds or less. Do not invent events you cannot locate.

Omit `keep_start_sec` and `keep_end_sec` only for a `cut` decision. Return every supplied question ID and candidate segment ID exactly once. Every factual answer, moment, and event must cite a time range. Every kept range must remain within its candidate segment. The selected duration will be computed from the kept ranges; do not return a separate duration total.

Keep unscored prose short: `summary` must be at most 30 words, each evidence `answer` at most 20 words, and each moment or event `label` at most 8 words. Return no explanation outside the JSON object.

For the first cut, keep the clearest explanation of the main idea, remove repeated or off-topic material, preserve context needed to understand each kept section, and identify unsafe audio or visual cut boundaries. The target output duration is 90–120 seconds. Use `keep`, `cut`, `compress`, or `visual-support` for each decision.
