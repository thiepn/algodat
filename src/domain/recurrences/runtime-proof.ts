import type {
  CanonicalRuntimeProof,
  RecurrenceError,
  RecurrenceEvaluation,
  RecurrenceMastery,
  RecurrenceMode,
  RecurrenceProblem,
  RuntimeProofAnswer,
} from './types';
import { equivalentRuntimeText, parseSupportedRecurrence } from './parser';
import { analyzeMasterTheorem } from './master-theorem';
import { buildRecursionTreeAnalysis } from './recursion-tree';

const topicId = 'topic-e48203925235';

function recurrenceError(
  errorCode: RecurrenceError['errorCode'],
  section: RecurrenceError['section'],
  actual: unknown,
  expected: unknown,
  explanation: string,
  criterionId: string,
  severity: RecurrenceError['severity'] = 'mittel',
): RecurrenceError {
  return {
    errorCode,
    section,
    step: null,
    evidence: `Abschnitt ${section}: ${String(actual)}`,
    expected,
    actual,
    explanation,
    severity,
    topicId,
    criterionId,
    recommendedReview:
      'Rekurrenzparameter, Master-Fall und starken Induktionsschritt gezielt wiederholen.',
  };
}

export function createCanonicalRecurrenceProof(): CanonicalRuntimeProof {
  const master = analyzeMasterTheorem('T(n)=8T(n/2)+n^3; T(1)=1');
  return {
    kind: 'recurrence_runtime_proof',
    trainerKind: 'proof',
    problemId: 'problem-rekurrenz-acht-halb-kubisch-v1',
    canonicalProofVersion: 'canonical-runtime-proof-8-half-cubic-v1',
    closedForm: '(log_2(n)+1)*n^3',
    master,
    preflight: {
      recurrence: 'T(n)=8T(n/2)+n^3',
      baseCase: 'T(1)=1',
      domain: 'n ist Zweierpotenz',
      requestedAsymptotic: 'O(n^3 log n)',
      requestedProof: 'geschlossene Form per Induktion zeigen',
    },
    parameters: {
      a: '8',
      b: '2',
      f: 'n^3',
      criticalExponent: '3',
      criticalFunction: 'n^3',
      masterCase: 'fall1',
      regularityWitness: '8*(n/2)^3=n^3',
      asymptoticBound: 'O(n^3 log n)',
    },
    recursionTree: buildRecursionTreeAnalysis(),
    proof: {
      claim: 'T(n)=(log_2(n)+1)*n^3 für alle Zweierpotenzen n>=1',
      inductionMethod: 'vollständige Induktion über Zweierpotenzen',
      baseCase: 'T(1)=1=(log_2(1)+1)*1^3',
      hypothesis: 'T(n/2)=(log_2(n/2)+1)*(n/2)^3',
      substitution: 'T(n)=8*T(n/2)+n^3',
      algebra: '8*(log_2(n/2)+1)*(n/2)^3+n^3=log_2(n)*n^3+n^3=(log_2(n)+1)*n^3',
      constantCondition:
        'Aus der geschlossenen Form folgt T(n)<=c*n^3*log_2(n) für geeignetes c und n>=2.',
      conclusion: 'Damit gilt T(n) in O(n^3 log n).',
    },
  };
}

export function createRecurrenceProblem(): RecurrenceProblem {
  return {
    id: 'problem-rekurrenz-acht-halb-kubisch-v1',
    title: 'Rekurrenzanalyse im Gleichgewichtsfall',
    recurrence: 'T(n)=8T(n/2)+n^3',
    baseCase: 'T(1)=1',
    domain: 'n ist Zweierpotenz',
    canonical: createCanonicalRecurrenceProof(),
  };
}

export function canonicalRecurrenceAttempt(): RuntimeProofAnswer {
  const proof = createCanonicalRecurrenceProof();
  return {
    kind: proof.kind,
    trainerKind: proof.trainerKind,
    problemId: proof.problemId,
    preflight: proof.preflight,
    parameters: proof.parameters,
    recursionTree: proof.recursionTree,
    proof: proof.proof,
  };
}

export function emptyRecurrenceAttempt(): RuntimeProofAnswer {
  const canonical = createCanonicalRecurrenceProof();
  return {
    ...canonicalRecurrenceAttempt(),
    preflight: {
      recurrence: '',
      baseCase: '',
      domain: '',
      requestedAsymptotic: '',
      requestedProof: '',
    },
    parameters: Object.fromEntries(
      Object.keys(canonical.parameters).map((key) => [key, '']),
    ) as RuntimeProofAnswer['parameters'],
    recursionTree: Object.fromEntries(
      Object.keys(canonical.recursionTree).map((key) => [key, '']),
    ) as unknown as RuntimeProofAnswer['recursionTree'],
    proof: Object.fromEntries(
      Object.keys(canonical.proof).map((key) => [key, '']),
    ) as RuntimeProofAnswer['proof'],
  };
}

function checkText(
  errors: RecurrenceError[],
  actual: string,
  expected: string,
  section: RecurrenceError['section'],
  criterionId: string,
  code: RecurrenceError['errorCode'],
) {
  if (equivalentRuntimeText(actual, expected)) return;
  errors.push(
    recurrenceError(
      code,
      section,
      actual,
      expected,
      'Die Eingabe weicht von der kanonisch belegten Form ab.',
      criterionId,
    ),
  );
}

export function evaluateRecurrenceProof(
  problem: RecurrenceProblem,
  answer: RuntimeProofAnswer,
  options: { mode: RecurrenceMode; hintsUsed: string[]; solutionRevealed: boolean },
): RecurrenceEvaluation {
  if (problem.id !== 'problem-rekurrenz-acht-halb-kubisch-v1')
    throw new Error('Nur der Phase-5-Rekurrenztrainer ist produktiv freigegeben.');
  const canonical = problem.canonical;
  const errors: RecurrenceError[] = [];

  try {
    parseSupportedRecurrence(`${answer.preflight.recurrence}; ${answer.preflight.baseCase}`);
  } catch (error) {
    errors.push(
      recurrenceError(
        'recurrence_parse_error',
        'preflight',
        answer.preflight.recurrence,
        canonical.preflight.recurrence,
        error instanceof Error ? error.message : 'Rekurrenz konnte nicht geparst werden.',
        'preflight',
        'schwer',
      ),
    );
  }
  checkText(
    errors,
    answer.preflight.baseCase,
    canonical.preflight.baseCase,
    'preflight',
    'preflight',
    'base_case_error',
  );
  checkText(
    errors,
    answer.preflight.domain,
    canonical.preflight.domain,
    'preflight',
    'preflight',
    'domain_error',
  );
  checkText(
    errors,
    answer.parameters.a,
    canonical.parameters.a,
    'parameters',
    'parameters',
    'parameter_error',
  );
  checkText(
    errors,
    answer.parameters.b,
    canonical.parameters.b,
    'parameters',
    'parameters',
    'parameter_error',
  );
  checkText(
    errors,
    answer.parameters.f,
    canonical.parameters.f,
    'parameters',
    'parameters',
    'parameter_error',
  );
  checkText(
    errors,
    answer.parameters.criticalExponent,
    canonical.parameters.criticalExponent,
    'parameters',
    'master',
    'critical_exponent_error',
  );
  checkText(
    errors,
    answer.parameters.masterCase,
    canonical.parameters.masterCase,
    'parameters',
    'master',
    'master_case_error',
  );
  checkText(
    errors,
    answer.parameters.asymptoticBound,
    canonical.parameters.asymptoticBound,
    'parameters',
    'master',
    'asymptotic_bound_error',
  );
  checkText(
    errors,
    answer.recursionTree.height,
    canonical.recursionTree.height,
    'recursionTree',
    'tree',
    'recursion_tree_error',
  );
  checkText(
    errors,
    answer.recursionTree.levelCost,
    canonical.recursionTree.levelCost,
    'recursionTree',
    'tree',
    'recursion_tree_error',
  );
  checkText(
    errors,
    answer.recursionTree.totalCost,
    canonical.recursionTree.totalCost,
    'recursionTree',
    'tree',
    'recursion_tree_error',
  );
  checkText(
    errors,
    answer.proof.claim,
    canonical.proof.claim,
    'proof',
    'claim',
    'induction_claim_error',
  );
  checkText(
    errors,
    answer.proof.inductionMethod,
    canonical.proof.inductionMethod,
    'proof',
    'induction',
    'induction_method_error',
  );
  checkText(
    errors,
    answer.proof.baseCase,
    canonical.proof.baseCase,
    'proof',
    'base_case',
    'induction_base_error',
  );
  checkText(
    errors,
    answer.proof.hypothesis,
    canonical.proof.hypothesis,
    'proof',
    'hypothesis',
    'induction_hypothesis_error',
  );
  checkText(
    errors,
    answer.proof.substitution,
    canonical.proof.substitution,
    'proof',
    'substitution',
    'recurrence_substitution_error',
  );
  checkText(
    errors,
    answer.proof.algebra,
    canonical.proof.algebra,
    'proof',
    'algebra',
    'algebra_error',
  );
  checkText(
    errors,
    answer.proof.conclusion,
    canonical.proof.conclusion,
    'proof',
    'conclusion',
    'conclusion_error',
  );

  const rubric = scoreRubric(errors);
  let points = rubric.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  if (options.solutionRevealed) points = Math.min(points, 10);
  if (options.hintsUsed.length > 0) points = Math.min(points, 14);
  return {
    points,
    maxPoints,
    rubricResults: rubric,
    errors,
    recommendation: recommendNextRecurrenceActivity(points, maxPoints, errors),
    canonicalProof: canonical,
  };
}

function scoreRubric(errors: RecurrenceError[]) {
  const has = (criterionId: string) => errors.some((error) => error.criterionId === criterionId);
  return [
    {
      criterionId: 'preflight',
      label: 'Rekurrenz und Domäne verstanden',
      points: has('preflight') ? 1 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'parameters',
      label: 'a, b und f(n) bestimmt',
      points: has('parameters') ? 1 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'master',
      label: 'Master-Theorem-Fall und Schranke',
      points: has('master') ? 2 : 4,
      maxPoints: 4,
    },
    {
      criterionId: 'tree',
      label: 'Rekursionsbaum erklärt',
      points: has('tree') ? 1 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'claim',
      label: 'Induktionsbehauptung',
      points: has('claim') ? 0 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'base_case',
      label: 'Induktionsanfang',
      points: has('base_case') ? 0.5 : 1,
      maxPoints: 1,
    },
    {
      criterionId: 'hypothesis',
      label: 'Starke Induktionsvoraussetzung',
      points: has('hypothesis') ? 0.5 : 1,
      maxPoints: 1,
    },
    {
      criterionId: 'substitution',
      label: 'Rekurrenzeinsatz',
      points: has('substitution') ? 0.5 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'algebra',
      label: 'Algebraischer Schluss',
      points: has('algebra') ? 0.5 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'conclusion',
      label: 'O-Schlussfolgerung',
      points: has('conclusion') ? 0.5 : 1,
      maxPoints: 1,
    },
  ];
}

export function recommendNextRecurrenceActivity(
  points: number,
  maxPoints: number,
  errors: RecurrenceError[],
) {
  const code = errors[0]?.errorCode;
  if (!code && points === maxPoints)
    return {
      code: 'learning_path_complete' as const,
      label: 'Rekurrenz später im Prüfungsmodus wiederholen',
      reason: 'Master-Fall, Rekursionsbaum und Induktionsbeweis sind vollständig korrekt.',
    };
  if (code === 'master_case_error' || code === 'critical_exponent_error')
    return {
      code: 'repeat_recurrence_master_case' as const,
      label: 'Master-Fall gezielt üben',
      reason: 'Der wichtigste Fehler liegt bei kritischem Exponenten oder Fallauswahl.',
    };
  if (code === 'algebra_error' || code === 'recurrence_substitution_error')
    return {
      code: 'repeat_recurrence_induction_step' as const,
      label: 'Induktionsschritt wiederholen',
      reason: 'Der Rekurrenzeinsatz oder die Umformung muss aktiv nachgearbeitet werden.',
    };
  return {
    code: 'repeat_recurrence_parameters' as const,
    label: 'Rekurrenzparameter wiederholen',
    reason: 'Beginne erneut mit a, b, f(n), Domäne und Zielschranke.',
  };
}

export function deriveRecurrenceMastery(
  attempts: Array<{
    id: string;
    mode: RecurrenceMode;
    score: number;
    maxScore: number;
    errorCodes: string[];
    hintsUsed: string[];
    solutionRevealed: boolean;
  }>,
): RecurrenceMastery {
  const completed = attempts.filter((attempt) => attempt.maxScore > 0);
  const evidenceAttemptIds = completed.map((attempt) => attempt.id);
  const base =
    completed.reduce((sum, attempt) => {
      const modeBoost = attempt.mode === 'exam' ? 1.15 : attempt.mode === 'learn' ? 0.65 : 1;
      const hintPenalty = Math.max(0.35, 1 - attempt.hintsUsed.length * 0.12);
      const revealPenalty = attempt.solutionRevealed ? 0.35 : 1;
      return sum + (attempt.score / attempt.maxScore) * modeBoost * hintPenalty * revealPenalty;
    }, 0) / Math.max(2, completed.length);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const has = (code: string) => completed.some((attempt) => attempt.errorCodes.includes(code));
  return {
    evidenceAttemptIds,
    dimensions: {
      recurrence_interpretation: clamp(base * (has('recurrence_parse_error') ? 0.5 : 1)),
      parameter_identification: clamp(base * (has('parameter_error') ? 0.55 : 1)),
      master_theorem_application: clamp(base * (has('master_case_error') ? 0.5 : 1)),
      recursion_tree_reasoning: clamp(base * (has('recursion_tree_error') ? 0.6 : 1)),
      induction_structure: clamp(base * (has('induction_method_error') ? 0.6 : 1)),
      algebraic_transformation: clamp(base * (has('algebra_error') ? 0.5 : 1)),
      asymptotic_conclusion: clamp(base * (has('asymptotic_bound_error') ? 0.6 : 1)),
    },
  };
}

export function canonicalRecurrenceProofText(): string[] {
  const proof = createCanonicalRecurrenceProof();
  return [
    `Rekurrenz: ${proof.preflight.recurrence}, Basisfall ${proof.preflight.baseCase}, Domäne: ${proof.preflight.domain}.`,
    `Parameter: a=${proof.parameters.a}, b=${proof.parameters.b}, f(n)=${proof.parameters.f}.`,
    `Kritischer Term: n^${proof.parameters.criticalExponent}; damit ${proof.parameters.masterCase} und ${proof.parameters.asymptoticBound}.`,
    `Rekursionsbaum: ${proof.recursionTree.textAlternative}`,
    `Behauptung: ${proof.proof.claim}.`,
    `IA: ${proof.proof.baseCase}.`,
    `IV: ${proof.proof.hypothesis}.`,
    `IS: ${proof.proof.substitution}; ${proof.proof.algebra}.`,
    `Schluss: ${proof.proof.conclusion}`,
  ];
}
