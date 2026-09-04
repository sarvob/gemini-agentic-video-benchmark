/** Validate a result card against the public v0.1 schema and reconciliation rules. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateResultCard } from './result-card-validator.ts';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run validate:result-card -- path/to/result-card.json');
  process.exit(2);
}

try {
  const schema = JSON.parse(readFileSync(resolve('benchmark', 'result-card-schema-v0.1.json'), 'utf8'));
  const card = JSON.parse(readFileSync(resolve(inputPath), 'utf8'));
  const errors = validateResultCard(schema, card);
  if (errors.length > 0) {
    console.error(`INVALID result card: ${inputPath}`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`VALID result card: ${inputPath}`);
} catch (error) {
  console.error(`Unable to validate result card: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
