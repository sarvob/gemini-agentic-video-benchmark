# Annotation and Review Guide v0.1

This guide defines the minimum path for adding a synthetic fixture without inflating the benchmark's maturity claims. It applies to new fixture proposals after v0.4; it does not retroactively certify the six existing fixtures.

## Case states

1. **Proposed** — a public issue describes the coverage gap, deterministic generator, rights basis, and review plan. No media is uploaded.
2. **Generated** — a pull request adds the generator, duration, source hash process, and a locally reproducible fixture record.
3. **Annotated** — the author adds ground truth, evidence rules, and a perfect candidate that passes the deterministic scorer.
4. **Review 1 passed** — a reviewer other than the fixture author checks the generated timeline against the annotations and records discrepancies.
5. **Review 2 passed** — a second reviewer repeats the check without copying the first review. At least one reviewer must disclose that they are unaffiliated with PaperEdits.
6. **Frozen** — all accepted changes are committed, the source hash is final, the clean-clone verifier passes, and the fixture enters a versioned release.

Only a **Frozen** case counts toward the human-validated case KPI. Proposed, generated, annotated, or single-reviewed cases must be reported separately.

## Annotation minimums

Each fixture should add a distinct format, modality, or failure mode and include:

- a 10-minute synthetic source with deterministic generation instructions and a SHA-256 hash;
- a clear editing brief with target duration, required order, must-keep events, and must-cut ranges;
- timestamped transcript, audio, visual, and cross-modal evidence questions where applicable;
- gold moments, edit decisions, and the expected first-cut duration;
- fixture-specific evidence rules that use frozen concepts and temporal overlap; and
- a perfect candidate used to prove that the scorer can award the expected result.

Do not tune annotations to improve a model's observed score. Resolve ambiguous wording before freezing, and record material disagreements in the pull request.

## Reviewer record

Each reviewer posts a pull-request review containing:

- public GitHub username only; no full name or email is required;
- relationship to PaperEdits (`none` if unaffiliated);
- reviewed commit SHA and fixture ID;
- conclusion: `pass`, `pass-with-corrections`, or `needs-changes`;
- discrepancies with timestamps and proposed resolution; and
- confirmation that no personal information, third-party media, or private URLs were added.

The fixture author cannot count as either reviewer. Automated checks support the review but do not replace either human decision.

## Rights, privacy, and cost gate

For the current $0 expansion phase, accept only fixtures generated entirely from repository code using synthetic visuals and system-generated speech or tones. Do not accept customer footage, real-person recordings, scraped media, private URLs, or assets whose reuse terms need interpretation.

Creating, reviewing, and verifying a fixture must not require paid model calls, credits, hosted accelerators, or contributor rewards. A later model evaluation is a separate, explicitly budgeted decision and is not required to propose or validate the fixture itself.
