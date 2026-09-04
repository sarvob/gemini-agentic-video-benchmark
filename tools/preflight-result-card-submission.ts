/** Produce a privacy-safe validation record for a public result-card submission. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateResultCard } from './result-card-validator.ts';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run preflight:result-card -- path/to/result-card.json');
  process.exit(2);
}

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

try {
  const rawCard = readFileSync(resolve(process.cwd(), inputPath), 'utf8');
  const schema = JSON.parse(readFileSync(resolve(repoRoot, 'benchmark', 'result-card-schema-v0.1.json'), 'utf8'));
  const card = JSON.parse(rawCard);
  const errors = validateResultCard(schema, card);
  if (errors.length > 0) {
    console.error('Result-card validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const verification = spawnSync('npm', ['run', 'verify', '--silent'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (verification.status !== 0) {
    const details = `${verification.stderr || verification.stdout}`.split(repoRoot).join('<repo>/').trim();
    console.error('Benchmark verification failed.');
    if (details) console.error(details);
    process.exit(1);
  }

  const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' });
  const commit = revision.stdout.trim();
  if (revision.status !== 0 || !/^[0-9a-f]{40}$/.test(commit)) {
    console.error('Unable to read the tested benchmark commit.');
    process.exit(1);
  }

  const cardHash = createHash('sha256').update(rawCard).digest('hex');
  console.log([
    'Result-card submission preflight',
    `- Benchmark commit: ${commit}`,
    `- Result-card SHA-256: ${cardHash}`,
    '- Benchmark verification: PASS',
    '- Result-card validation: PASS',
    '- Validator: JSON Schema 2020-12 plus provenance, coverage, brief-pass, and immutable-link checks',
    '- Privacy: this record omits the result-card contents and absolute local path',
  ].join('\n'));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to preflight ${basename(inputPath)}: ${message.split(repoRoot).join('<repo>/')}`);
  process.exit(1);
}
