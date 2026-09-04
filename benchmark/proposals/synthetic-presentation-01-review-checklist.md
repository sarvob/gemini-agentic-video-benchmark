# Review checklist: synthetic-presentation-01

This is a $0 human review of an **annotated proposal**, not a model evaluation. The fixture is not frozen and does not count toward the validated-case total.

## Review target

- Fixture: `synthetic-presentation-01`
- Annotation commit: `7edc4b592f8dfce427429349514b86003091db9c`
- Expected source duration: 600 seconds
- Expected source SHA-256: `748649e5b7ca64f3c44f5256b283d613469f9c643ef5a5c97d82647c90603e54`
- Draft ground truth: `benchmark/proposals/synthetic-presentation-01-ground-truth.json`
- Evidence rules: `benchmark/evidence-rules-synthetic-presentation-01.json`

## Privacy, rights, and cost

Use a public GitHub username only; do not post a full name, email address, private path, credential, or generated media. The generator uses repository-drawn slides, the macOS Samantha system voice, and generated tones. Stop if your local toolchain cannot generate the fixture exactly or if you identify a rights concern. No API key, model call, hosted accelerator, paid service, credit, or reward is required.

## Reproduce the candidate and scorer

From the current repository, the one-command helper validates a locked copy of the annotation target, regenerates the exact video, checks hash and duration, scores the perfect candidate, runs the offline verifier, and extracts six local checkpoint frames:

```bash
./scripts/prepare-presentation-01-review.sh
```

The helper writes generated media and frames only under the ignored `tmp/gemini-benchmark/` directory. It does not upload media or call a model API.

On a cold system-voice run, the first generated hash may differ before the expected output stabilizes. The helper reports that discrepancy, retries once, and requires the expected hash on two consecutive runs before proceeding. Report any mismatch that survives the retry or confirmation run.

To reproduce manually at the original annotation commit, run from a clean clone on macOS with Python, Pillow, ffmpeg, Node.js, and npm available:

```bash
git checkout 7edc4b592f8dfce427429349514b86003091db9c
python3 tools/generate-gemini-video-presentation-01.py
shasum -a 256 tmp/gemini-benchmark/synthetic-presentation-01.mp4
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 tmp/gemini-benchmark/synthetic-presentation-01.mp4
npm ci
npm run score -- benchmark/proposals/synthetic-presentation-01-ground-truth.json benchmark/proposals/synthetic-presentation-01-perfect-candidate.json
./scripts/verify-clean-clone.sh
```

Record any environment-dependent output. A hash mismatch is a discrepancy, not a failed reviewer.

## Inspect independently

Check these windows in the generated video before reading any other human review:

| Window | Expected observation |
| --- | --- |
| 00:52–00:54 | Visual-only `Q2 RESULT • 42%` card |
| 01:39–01:40 | Synthesized narration ends at approximately 99.91 seconds |
| 02:56–02:56.3 | One 740 Hz tone while `METHOD` remains visible |
| 04:08–04:10 | Visual-only `LABEL CORRECTED` card |
| 06:40–06:42 | `FINDING VERIFIED` with two different tones |
| 06:42–08:30 | Static `APPENDIX HOLD`, marked as the required cut |

Then audit all 12 evidence questions, six gold moments, 12 edit decisions, the 114-second selected duration, required order, must-keep events, and must-cut range against the media and editing brief.

## Submit the review

Use the [Fixture review form](https://github.com/sarvob/gemini-agentic-video-benchmark/issues/new?template=fixture-review.yml). State `none` if unaffiliated with PaperEdits. Choose `pass`, `pass-with-corrections`, or `needs-changes`; include timestamps and proposed resolutions for every discrepancy. Do not describe the fixture as frozen or validated.
