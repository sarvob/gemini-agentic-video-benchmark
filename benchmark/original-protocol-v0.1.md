# PaperEdits × Gemini agentic video benchmark v0.1

> Historical protocol record. The public repository authorizes only the $0 committed-artifact verification path; it does not authorize new provider calls or spending.

**Status:** protocol frozen for an exploratory six-fixture pilot; no results yet
**Created:** 2026-09-01
**Primary question:** On the same long-form creator footage and editorial brief, which system produces the more useful editable first-cut plan, and at what cost and latency?

## Why this is worth doing

Google announced agentic video understanding for Gemini 3.5 Flash Lite, 3.6 Flash, and 3.7 Flash. Instead of processing video at a fixed one frame per second, agentic mode can navigate the timeline, selectively load transcript, audio, and frames, and adapt frame rate and resolution to the prompt. Google reports up to 88% fewer tokens and roughly 7% higher quality for long-form content.

That overlaps directly with PaperEdits' core problem: understanding long recordings well enough to make grounded editing decisions. A reproducible benchmark can become a useful public resource and an earned-marketing asset. It should test an editing workflow, not turn one vendor's launch claim into a vague “who has better AI?” contest.

The Grok post that prompted this work identifies people associated with the launch; it is not the technical source. The benchmark must cite and configure against Google's current documentation.

## Comparison arms

Use the same source videos, creator brief, segment manifest, output schema, validator, and renderer.

1. **PaperEdits:** pinned public commit and exact production/default model configuration.
2. **Gemini agentic:** pinned Gemini 3.7 Flash version using `processing: "agentic"` through the Interactions API.
3. **Gemini static control:** the same pinned Gemini model using static video processing. This separates the value of agentic navigation from general model quality.

Both Gemini arms receive the same candidate segment IDs and time ranges used by PaperEdits and must return the same structured edit-plan schema. All valid plans are executed through the same PaperEdits validator and renderer. This keeps rendering, codecs, boundary normalization, and output format constant while comparing understanding and planning. Report a second, clearly labeled PaperEdits end-to-end run only if it uses different execution behavior.

## The 10 metrics

| # | Metric | Exact measurement | Why it matters |
|---:|---|---|---|
| 1 | Moment-retrieval F1 | Match predicted and gold intervals at temporal IoU ≥ 0.5; report macro precision, recall, and F1 by video and duration band | Measures whether the system finds the moments that actually support the brief |
| 2 | Short-event recall | Percentage of gold visual or audio events lasting ≤2 seconds found within ±1 second; report separately for visual-only, audio-only, and mixed events | Adaptive sampling can be efficient while missing brief but important events |
| 3 | Timestamp localization error | Median and p90 absolute error in seconds for the start and end of correctly identified events | A right idea at the wrong time still creates a bad cut or unusable suggestion |
| 4 | Multimodal evidence accuracy | Accuracy on adjudicated questions requiring transcript, audio, visual, or cross-modal evidence; every answer must cite a time range, and unsupported answers score zero | Tests grounded understanding rather than fluent summaries |
| 5 | Edit-decision precision and recall | Against the adjudicated candidate-level plan, score `keep`, `cut`, `compress`, and `visual-support` decisions; report per-class and macro F1 | Measures whether understanding becomes correct editing action |
| 6 | Story retention and coherence | Three blinded editors compare randomized first cuts for objective clarity, logical continuity, pacing, and missing context; report pairwise win/tie/loss with confidence intervals | Captures editorial usefulness that interval metrics miss |
| 7 | Brief-constraint pass rate | Percentage of runs satisfying every declared hard constraint: target-duration tolerance, must-keep recall, must-cut compliance, ordering, and required output format | Creators need instructions followed, not merely plausible output |
| 8 | Cut-seam defect rate | Audible clipped words, fused sentences, visual discontinuities, or accidental black/frozen frames per 100 applied cuts; include automatic QA plus blinded review | Measures the real output cost of timestamp and boundary mistakes |
| 9 | Economic efficiency | Total input, output, thought, and tool-use tokens per source-video hour plus actual API USD; report local compute separately and never pretend local compute is free | Tests Google's efficiency claim in PaperEdits' real workload |
| 10 | Latency | Median and p90 time to first valid plan and total planning time, normalized per source-video hour; render time is reported separately because the renderer is shared | Distinguishes faster understanding from faster delivery of an editable result |

Do not collapse the ten metrics into one invented “overall score.” Publish the complete scorecard and state which tradeoff each system wins.

## Mandatory disclosures outside the scorecard

- exact model identifiers, API version, date, region, SDK, processing mode, media resolution, prompts, temperature, retries, and seed where supported;
- PaperEdits commit SHA, backend, tool registry, model configuration, hardware, and dependency versions;
- source duration, resolution, language, speaker count, edit brief, and whether the video was previously public;
- invalid output, timeout, refusal, retry, repair, validator rejection, and no-result counts;
- what media or derived data left the machine for each arm;
- every manual intervention after the run starts;
- all exclusions and the reason for each exclusion;
- Google affiliation disclaimer: this is an independent PaperEdits evaluation, not sponsored or endorsed by Google.

## Dataset design

Pilot with 18 rights-cleared videos:

- six two-person video-podcast or interview recordings;
- six solo talking-head or expert-lesson recordings;
- six screen-demo or tutorial recordings with meaningful on-screen events.

Within each group, use two videos in each band: 8–15 minutes, 30–45 minutes, and 60–120 minutes. Intentionally include overlapping speech, filler words, silence, slides or screen changes, off-topic tangents, rapid visual events, repeated takes, and at least one ambiguous instruction. Publish footage only when its license and participant consent allow it; otherwise publish hashes, annotations, prompts, derived labels, and reproducible access instructions without redistributing media.

## Ground truth and review

1. Two experienced editors independently label relevant intervals, edit decisions, constraints, and unsafe boundaries.
2. An adjudicator resolves disagreements without seeing system output.
3. Freeze the gold labels before running the comparison.
4. Randomize and anonymize rendered outputs for the three-person human panel.
5. Give every arm the same brief and attempt budget. Do not repair one system by hand unless the identical repair rule is available to all arms and logged.
6. Bootstrap confidence intervals by video, not by individual cut, so long videos do not dominate the result.

## Tasks per video

- answer twelve evidence questions: three transcript, three audio, three visual, and three cross-modal;
- find six gold moments, including at least two events lasting no more than two seconds;
- produce one duration-constrained first-cut plan from the same creator brief;
- produce a structured rationale citing segment IDs for every non-trivial keep, cut, compression, or visual-support decision;
- render the validated plan through the shared PaperEdits executor.

## Publication package

Publish only after the full run and quality audit:

1. **Canonical benchmark page on `paperedits.com`:** methodology, scorecard, plain-English findings, limitations, failure gallery, and downloadable data. Target the useful query, not a victory headline: “Gemini agentic video understanding benchmark for long-form editing.”
2. **GitHub artifact:** frozen protocol, scoring code, prompts, schemas, model/run manifests, anonymized raw outputs, aggregate tables, and instructions to reproduce. Link the canonical report.
3. **X thread:** reply to the Google DeepMind announcement with one honest finding, one chart, the test conditions, and the complete report. Thank named contributors only when their involvement is publicly verified. Do not tag unrelated staff or ask for amplification.
4. **Research/community distribution:** submit to relevant developer and video-agent communities only when rules allow evidence-rich self-promotion. Use the methodology or failure finding as the post, not a PaperEdits link drop.
5. **Citable dataset release:** publish labels and permitted footage through GitHub or a dataset host, with a clear license and citation file. This is the strongest route to durable backlinks if other teams can rerun the test.

Recommended headline after results exist:

> We tested agentic video understanding on real editing work—not just video Q&A. Here is where adaptive retrieval helped, what it missed, and what happened to the final cut.

Never prewrite “PaperEdits wins.” A credible loss on some metrics is still valuable if it reveals where a specialized editing system helps and where a frontier multimodal model should be integrated.

## Marketing success criteria

The report succeeds if it earns at least three of the following within 30 days:

- two independent technical citations or backlinks;
- one meaningful response from a model/video-tool team;
- five benchmark reruns, issues, or data downloads from qualified builders;
- ten qualified creator/editor visits reaching the methodology or demo;
- three rights-cleared footage contributions for v0.2;
- one product decision made from a documented failure pattern.

Traffic without methodology engagement, reruns, citations, or footage contributions is not sufficient.

## Stop conditions

Do not publish comparative results if:

- fewer than twelve videos complete all arms;
- the model versions or prompts differ without disclosure;
- human raters can infer system identity from labels or UI;
- one arm receives extra retries or manual cleanup;
- footage rights are unclear;
- the scoring code cannot reproduce the published tables;
- results are selected because they make PaperEdits look better.

## Inputs needed next

- Gemini API access with the target model enabled;
- 18 rights-cleared videos, or a six-video pilot explicitly labeled exploratory;
- two independent editor-labelers plus one adjudicator;
- a frozen PaperEdits commit and execution configuration;
- implementation of the common plan schema adapter and scoring scripts.

## Execution controls

- The public evidence workspace is this `benchmark/` directory; the repository root contains the current verification instructions.
- Gemini spend has a $5.00 absolute ceiling and a $4.50 operational stop, leaving a $0.50 safety margin.
- The pinned promotional rate through 2026-12-31 is $0.75 per million input tokens and $3.75 per million output tokens, including thinking tokens.
- Only explicit synthetic or rights-cleared fixtures may leave the machine. Interactions are submitted with storage disabled.
- The scheduled worker stops when the six-fixture exploratory results package is reproducible, the cost guard stops it, or a required credential/asset remains unavailable.

## Official sources

- [Google AI for Developers: agentic video understanding, supported models, processing modes, limitations, and token accounting](https://ai.google.dev/gemini-api/docs/video-understanding)
- [Google AI for Developers: Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Google DeepMind: Gemini 3.7 Flash model card and long-video benchmark context](https://deepmind.google/models/model-cards/gemini-3-7-flash/)
- [Google DeepMind launch thread](https://x.com/GoogleDeepMind/status/2094840179676660097)
- [Grok response supplied by the user](https://x.com/grok/status/2095027829255618574)
