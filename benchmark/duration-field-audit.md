# Duration-field design audit

**Audited:** 2026-09-02
**API calls made:** none

## Finding

`constraints.target_duration_sec` is a redundant self-report. The candidate already supplies every kept range, so selected duration is deterministically computable as:

```text
sum(keep_end_sec - keep_start_sec) for every non-cut decision
```

The benchmark's actual duration metric already uses that computed sum. The declared field does not add evidence about edit quality or brief compliance; it adds a second representation that can disagree with the plan.

That happened in v0.3. The model returned a coherent set of kept ranges totaling 117 seconds, which is inside the 90–120 second brief, but separately declared 107 seconds. The validator correctly rejected the response under the frozen v0.3 rules. The mismatch tests arithmetic consistency, not the parent benchmark's stated target-duration constraint.

## Decision

Remove `constraints.target_duration_sec` in protocol v0.4 and always compute selected duration from the kept ranges.

This keeps the hard metric intact:

- pass when the computed duration is between 90 and 120 seconds;
- fail otherwise;
- publish the computed duration, never a model-declared total.

The `constraints` object will retain `required_order` and `must_keep_event_ids` for the next smoke pair. Auditing whether those echoes should also become derived checks is useful, but it is not required to resolve this specific invalidation.

## Why stronger arithmetic prompting is rejected

Adding another instruction to “double-check the sum” would still duplicate deterministic work and could invalidate a usable plan for an unscored arithmetic error. It would also make the next call less diagnostic because success could depend on prompt wording rather than the video-understanding and edit-selection task.

## Comparability

This is a protocol change, so v0.4 scores must remain separate from v0.1–v0.3. The ground-truth ranges, video, evidence rules, moment rules, event rules, decision classes, duration band, response ceiling, and wording caps remain unchanged.

The v0.3 candidate stays invalid under v0.3. It must not be rescored retroactively under v0.4.
