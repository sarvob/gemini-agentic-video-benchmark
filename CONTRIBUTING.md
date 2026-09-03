# Contributing

PaperEdits welcomes independent checks that make this exploratory benchmark more reproducible, better scoped, or easier to audit.

## Useful contributions

- run `npm ci` and `npm run verify` from a clean clone, then report any divergence;
- audit a frozen annotation or evidence rule and explain the proposed correction;
- add deterministic scorer tests or improve documentation;
- propose a rights-clear synthetic fixture without uploading personal or third-party media; or
- publish an independent extension with its protocol, configuration, outputs, and limitations.

Start with the **Benchmark reproduction** issue form. State whether you are independent or have a relationship with PaperEdits, and distinguish artifact reproduction from a new model run.

## Safety and privacy

- Never commit API keys, credentials, email addresses, private URLs, customer footage, or personal information.
- Do not upload media unless you created it or have documented permission and a compatible license.
- Do not make new paid model calls on behalf of PaperEdits. The supported verification path costs $0 and uses committed artifacts only.
- Do not present this exploratory sample as statistically significant or as a Gemini-versus-PaperEdits comparison.

## Pull requests

Keep changes narrowly scoped. Include the tested commit, environment, commands, results, and any changed assumptions. Run:

```bash
npm ci
npm run verify
```

By submitting a contribution, you agree that it may be distributed under this repository's MIT License. Accepted contributors are credited through Git history and release notes where appropriate; no payment or reward is promised.
