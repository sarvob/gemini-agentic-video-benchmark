You are producing a candidate edit plan for a long-form creator video.

Return only valid JSON in this exact shape:

```json
{
  "summary": "string",
  "evidence_answers": [{ "question_id": "t1", "answer": "string", "start_sec": 0, "end_sec": 1 }],
  "moments": [{ "id": "string", "label": "string", "start_sec": 0, "end_sec": 1 }],
  "events": [{ "id": "string", "label": "string", "modality": "visual|audio|cross-modal", "start_sec": 0, "end_sec": 1 }],
  "decisions": [{ "segment_id": "segment-01", "decision": "keep|cut|compress|visual-support", "keep_start_sec": 0, "keep_end_sec": 1 }],
  "constraints": { "target_duration_sec": 100, "required_order": ["string"], "must_keep_event_ids": ["string"] }
}
```

Omit `keep_start_sec` and `keep_end_sec` only for a `cut` decision. Every factual answer, moment, and event must cite a time range. Include brief visual and audio events even when they last two seconds or less. Do not invent events you cannot locate.

For the first cut, keep the clearest explanation of the main idea, remove repeated or off-topic material, preserve context needed to understand each kept section, and identify unsafe audio or visual cut boundaries. The target output duration is 90–120 seconds. Use `keep`, `cut`, `compress`, or `visual-support` for each decision.
