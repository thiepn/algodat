import type {
  RbInsertionAnswer,
  RbInsertionError,
  RbInsertionErrorCode,
  RbInsertionEvaluation,
  RbInsertionMastery,
  RbRubricResult,
} from './types';
import { solveRbInsertion } from './insertion';

export const canonicalRbKeys = [10, 20, 30, 15];
export const canonicalRbSolution = solveRbInsertion(canonicalRbKeys);

export function canonicalRbInsertionAnswer(): RbInsertionAnswer {
  return {
    nilConvention:
      'NIL-Blätter werden als schwarze Blätter behandelt; in der kompakten Darstellung steht N für NIL.',
    insertedKeys: canonicalRbKeys.join(', '),
    fixupCases:
      '30: Fall 3 gespiegelt mit Linksrotation um 10; 15: Fall 1 mit Umfärbung von 10 und 30.',
    finalTree: canonicalRbSolution.finalTreeCompact,
    blackHeight: String(canonicalRbSolution.blackHeight),
    runtime: 'O(log n) pro Einfügung, weil die Höhe des Rot-Schwarz-Baums O(log n) ist.',
    explanation:
      'Nach jeder BST-Einfügung wird der neue Knoten rot eingefügt. Rot-Rot-Verletzungen werden lokal durch Umfärben oder Rotation repariert; am Ende wird die Wurzel schwarz gesetzt.',
  };
}

function includesAll(text: string, needles: string[]) {
  const normalized = text.toLocaleLowerCase('de').replace(/\s+/g, ' ');
  return needles.every((needle) => normalized.includes(needle.toLocaleLowerCase('de')));
}

function compact(text: string) {
  return text.replace(/\s+/g, '').toUpperCase();
}

function error(
  errorCode: RbInsertionErrorCode,
  section: keyof RbInsertionAnswer,
  evidence: string,
  explanation: string,
  expected = explanation,
): RbInsertionError {
  return {
    errorCode,
    section,
    evidence,
    expected,
    actual: evidence,
    step: null,
    severity: 'mittel',
    topicId: 'topic-7ae0552985f1',
    explanation,
    recommendedReview: 'Rot-Schwarz-Invarianten, Einfügefälle und Endbaum erneut aktiv bearbeiten.',
  };
}

function rubric(
  criterionId: string,
  label: string,
  maxPoints: number,
  ok: boolean,
  partial = 0,
): RbRubricResult {
  return { criterionId, label, maxPoints, points: ok ? maxPoints : partial };
}

export function emptyRbInsertionAnswer(): RbInsertionAnswer {
  return {
    nilConvention: '',
    insertedKeys: '',
    fixupCases: '',
    finalTree: '',
    blackHeight: '',
    runtime: '',
    explanation: '',
  };
}

export function evaluateRbInsertionAnswer(answer: RbInsertionAnswer): RbInsertionEvaluation {
  const canonical = canonicalRbInsertionAnswer();
  const errors: RbInsertionError[] = [];

  const nilOk = includesAll(answer.nilConvention, ['nil', 'schwarz']);
  if (!nilOk)
    errors.push(
      error(
        'rb_nil_missing',
        'nilConvention',
        answer.nilConvention,
        'NIL muss als schwarz behandelt werden.',
      ),
    );

  const sequenceOk =
    answer.insertedKeys.match(/\d+/g)?.map(Number).join(',') === canonicalRbKeys.join(',');
  if (!sequenceOk)
    errors.push(
      error(
        'rb_sequence_wrong',
        'insertedKeys',
        answer.insertedKeys,
        'Die Einfügefolge muss 10, 20, 30, 15 sein.',
      ),
    );

  const casesOk = includesAll(answer.fixupCases, ['fall 3', 'linksrotation', 'fall 1', 'umf']);
  if (!casesOk)
    errors.push(
      error(
        'rb_case_missing',
        'fixupCases',
        answer.fixupCases,
        'Die Reparaturfälle 3 gespiegelt und 1 müssen benannt werden.',
      ),
    );

  const treeOk = compact(answer.finalTree) === compact(canonical.finalTree);
  if (!treeOk)
    errors.push(
      error(
        'rb_final_tree_wrong',
        'finalTree',
        answer.finalTree,
        `Erwartet wird ${canonical.finalTree}.`,
      ),
    );

  const blackHeightOk = answer.blackHeight.trim() === canonical.blackHeight;
  if (!blackHeightOk)
    errors.push(
      error(
        'rb_black_height_wrong',
        'blackHeight',
        answer.blackHeight,
        'Die Schwarzhöhe der Wurzel beträgt 3 inklusive NIL.',
      ),
    );

  const runtimeOk =
    includesAll(answer.runtime, ['o(log n)']) || includesAll(answer.runtime, ['o(logn)']);
  if (!runtimeOk)
    errors.push(
      error('rb_runtime_wrong', 'runtime', answer.runtime, 'Die belegte Einfügezeit ist O(log n).'),
    );

  const explanationOk = includesAll(answer.explanation, ['rot', 'wurzel', 'schwarz']);
  if (!explanationOk)
    errors.push(
      error(
        'rb_explanation_missing',
        'explanation',
        answer.explanation,
        'Die Begründung muss roten neuen Knoten und schwarze Wurzel erklären.',
      ),
    );

  const rubricResults = [
    rubric('nil', 'NIL-Konvention', 4, nilOk),
    rubric('sequence', 'Einfügefolge', 4, sequenceOk),
    rubric('cases', 'Reparaturfälle', 10, casesOk),
    rubric('tree', 'Endbaum', 10, treeOk),
    rubric('black-height', 'Schwarzhöhe', 4, blackHeightOk),
    rubric('runtime', 'Laufzeit', 4, runtimeOk),
    rubric('explanation', 'Invariantenbegründung', 4, explanationOk),
  ];
  const points = rubricResults.reduce((sum, item) => sum + item.points, 0);
  return {
    points,
    maxPoints: 40,
    rubricResults,
    errors,
    canonicalSolution: canonical,
    recommendation:
      points >= 34
        ? 'Rot-Schwarz-Einfügung ist stabil genug für den Simulator.'
        : 'Wiederhole Reparaturfälle und Endbaumdarstellung im Übungsmodus.',
  };
}

export function deriveRbInsertionMastery(evaluation: RbInsertionEvaluation): RbInsertionMastery {
  const byId = new Map(evaluation.rubricResults.map((item) => [item.criterionId, item]));
  const ratio = (id: string) => {
    const item = byId.get(id);
    return item ? item.points / item.maxPoints : 0;
  };
  return {
    modelVersion: 'mastery-v8',
    dimensions: {
      rb_nil_konvention: ratio('nil'),
      rb_einfuegefolge: ratio('sequence'),
      rb_reparaturfaelle: ratio('cases'),
      rb_endbaum: ratio('tree'),
      rb_schwarzhoehe: ratio('black-height'),
      rb_laufzeit: ratio('runtime'),
      rb_invarianten: ratio('explanation'),
    },
    recommendation: evaluation.recommendation,
  };
}
