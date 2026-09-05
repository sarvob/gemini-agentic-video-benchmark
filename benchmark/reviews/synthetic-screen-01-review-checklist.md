# Re-audit checklist: synthetic-screen-01

This is a $0 independent re-audit of a **frozen fixture**. Running the helper is maintainer-side review readiness, not external adoption. The validated-case or external-review counts change only after an eligible unaffiliated review is accepted under the governance rules.

## Review target

- Fixture: `synthetic-screen-01`
- Annotation commit: `6b53bd4f8757aa262b8240341fedbe18d2a35de0`
- Expected source duration: 600 seconds
- Annotated source SHA-256: `1ed2ef8c8910f188ea6de2714704808dae1bf88d4d6e28237b0855901ff0a54f`
- Ground truth: `benchmark/ground-truth/synthetic-screen-01.json`
- Evidence rules: `benchmark/evidence-rules-synthetic-screen-01.json`

## Privacy, rights, and cost

Use a public GitHub username only; do not post a full name, email address, private path, credential, or generated media. The generator creates repository-drawn slides, macOS Samantha system speech, and generated tones. No API key, model call, hosted accelerator, paid service, credit, or reward is required.

## Prepare the local review packet

On macOS with Python, Pillow, ffmpeg, Node.js, and npm available, run:

```bash
./scripts/prepare-screen-01-review.sh
```

The helper validates locked annotation inputs, generates the ignored 10-minute video, checks its duration, extracts six checkpoint frames, verifies 960×540 dimensions and decoded RGB hashes, scores the reference candidate, and runs the offline verifier. It writes media only under ignored `tmp/gemini-benchmark/` paths and uploads nothing.

The frozen annotation records the exact source-video hash used for the evaluation. Locally generated whole-file hashes can differ because macOS system-speech audio and encoded container bytes vary across runs. The helper reports both hashes but does not claim byte-for-byte video reproduction. The six decoded visual checkpoints are the deterministic review anchors. Report an RGB mismatch, duration mismatch, unexpected voice/tone behavior, or timing discrepancy.

## Inspect independently

Check these windows before reading another human review:

| Window | Expected observation |
| --- | --- |
| 00:47–00:48 | Visual-only `EXPORT COMPLETE` confirmation |
| 02:13–02:13.35 | One 880 Hz tone while `TRANSCRIPT CLEANUP` remains visible |
| Around 02:41 | Spoken narration ends; later slides are silent except for marked tones |
| 04:47–04:48 | Visual-only `CURSOR MISCLICK` warning |
| 07:01–07:03 | `BUILD PASSED` appears with two different tones |
| 07:03–08:30 | `QUALITY CHECK` hold, marked as the required cut |
| 08:30 | `FINAL EXPORT` begins |

Then audit all 12 evidence questions, six v0.2 gold moments, 12 edit decisions, 101-second selected duration, required order, must-keep events, and must-cut range against the media and editing brief.

## Submit the review

Use the [Fixture review form](https://github.com/sarvob/gemini-agentic-video-benchmark/issues/new?template=fixture-review.yml). State `none` if unaffiliated with PaperEdits. Choose `pass`, `pass-with-corrections`, or `needs-changes`; include timestamps and proposed resolutions for every discrepancy. A maintainer rerun or issue without an eligible independent reviewer does not count as external adoption.
