import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export function validateResultCard(schema: object, card: any): string[] {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const errors: string[] = [];

  if (!validate(card)) {
    errors.push(...(validate.errors ?? []).map(formatAjvError));
  }

  if (card?.coverage?.validPairedFixtures > card?.coverage?.attemptedFixtures) {
    errors.push('/coverage/validPairedFixtures cannot exceed attemptedFixtures');
  }
  if (
    card?.results?.briefPasses?.denominator !== card?.coverage?.validPairedFixtures ||
    card?.results?.briefPasses?.agentic > card?.results?.briefPasses?.denominator ||
    card?.results?.briefPasses?.static > card?.results?.briefPasses?.denominator
  ) {
    errors.push('/results/briefPasses must reconcile to validPairedFixtures');
  }

  for (const [name, url] of Object.entries(card?.evidence ?? {})) {
    if (name === 'verificationCommand' || typeof url !== 'string') continue;
    if (/github\.com\/[^/]+\/[^/]+\/(blob|tree)\/(main|master)\//.test(url)) {
      errors.push(`/evidence/${name} must use an immutable commit or tag, not a mutable branch`);
    }
  }

  return [...new Set(errors)];
}

function formatAjvError(error: ErrorObject): string {
  const location = error.instancePath || '/';
  return `${location} ${error.message ?? 'is invalid'}`;
}
