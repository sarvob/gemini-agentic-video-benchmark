# Governance

PaperEdits currently maintains this exploratory benchmark. Governance decisions are recorded in public issues, pull requests, commits, and releases so readers can distinguish maintainer work from independent evidence.

## Roles

- **Maintainers** merge changes, publish releases, and enforce the documented evidence, privacy, rights, and cost gates.
- **Contributors** propose code, documentation, fixtures, audits, reproductions, or result cards. A public GitHub username is sufficient; a full name or email address is not required.
- **Reviewers** assess a specific fixture, result card, or protocol change. Reviewers disclose their relationship to PaperEdits and any material conflict relevant to that review.

A person may hold more than one role, but cannot provide an independent review of their own fixture or result card.

## Decision records

Material changes use a public issue or pull request and must include the tested commit, evidence, limitations, and relationship disclosure. The clean-clone verifier must pass before merge.

Maintainers document the reason for accepting, requesting changes to, or rejecting a contribution. Acceptance confirms that the contribution meets the published contract; it does not endorse a model, vendor, submitter, or conclusion.

## Result cards

A community result card is eligible for the public table only when it:

1. passes the versioned schema and built-in semantic checks;
2. includes a passing submission preflight record;
3. links public, immutable evidence;
4. reports attempted and excluded runs, quality, efficiency, cost, and limitations; and
5. discloses the submitter's relationship to PaperEdits.

Maintainer baselines remain labeled `maintainer-baseline` with `countsAsExternalAdoption: false`. Stars, visits, downloads, unverifiable claims, and paid placements do not count as external adoption.

## Fixture changes

New fixtures follow the staged [annotation and review guide](benchmark/annotation-review-guide-v0.1.md). A fixture author cannot count as either human reviewer. Freezing requires two recorded reviews, including at least one unaffiliated reviewer, resolution of material discrepancies, a passing clean-clone verification, and inclusion in a versioned release.

Protocol changes apply prospectively under a new version. Existing result files are not silently rewritten to match a later protocol.

## External reviewer path

Anyone may submit a scoped evidence-backed review. After two accepted reviews or comparable merged contributions, a maintainer may publicly recognize that contributor as a recurring reviewer for a stated scope. Recognition does not grant merge access, payment, or authority to review the contributor's own work.

Shared maintenance or merge access requires a separate public proposal that defines scope, responsibilities, conflicts, and revocation conditions. Until such a proposal is accepted, PaperEdits remains the final repository maintainer.

## Privacy, rights, and cost

Do not publish credentials, email addresses, full names, private URLs, customer footage, personal information, or media without documented compatible rights. The current contribution and review path must remain usable without paid model calls, services, credits, or rewards.

If evidence cannot be reviewed publicly without violating these gates, maintainers record the blocker and do not accept the contribution as external adoption.
