import { readJson } from './content-utils';
import { validateCanonicalQuestionCorpus } from '../src/domain/canonical-questions/validation';

const corpus = await readJson<unknown>('data/canonical-questions.json');
const validated = validateCanonicalQuestionCorpus(corpus);
console.log(
  `Kanonischer Fragenkorpus gültig: ${validated.questions.length} veröffentlichungsfähige Fragen.`,
);
