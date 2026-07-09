import type {
  CanonicalProof,
  ProofError,
  ProofEvaluation,
  ProofMastery,
  ProofMode,
  ProofProblem,
  StructuredProof,
} from './types';
import { compareExpressions } from './expressions';

const topicId = 'topic-e05ae3743b24';

function proofError(
  errorCode: ProofError['errorCode'],
  section: ProofError['section'],
  actual: unknown,
  expected: unknown,
  explanation: string,
  criterionId: string,
  severity: ProofError['severity'] = 'mittel',
): ProofError {
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
    recommendedReview: 'Schleifeninvarianten-Beweisschema erneut aktiv durchgehen.',
  };
}

export function createCanonicalSumProof(): CanonicalProof {
  return {
    trainerKind: 'proof',
    problemId: 'problem-schleifeninvariante-gewichtete-summe-v1',
    canonicalProofVersion: 'canonical-proof-loop-sum-v1',
    formulaLabels: {
      claim: 'sum(j,1,n,j*A[j])',
      invariant: 'sum(j,1,i-1,j*A[j])',
      preservationTarget: 'sum(j,1,i,j*A[j])',
    },
    preflight: {
      accumulator: 's',
      iterationEffect: 's wird um i*A[i] erhöht',
      iterationCount: 'n',
      valueAfterZero: '0',
      valueAfterOne: '1*A[1]',
      valueAfterTwo: '1*A[1]+2*A[2]',
      expectedReturn: 'sum(j,1,n,j*A[j])',
    },
    claim: {
      inputRange: 'A=[a_1,...,a_n], n>=1, a_i in N',
      returnVariable: 's',
      expression: 'sum(j,1,n,j*A[j])',
      quantifier: 'für jede zulässige Eingabe',
      edgeCases: 'n>=1; leere Arrays werden in dieser Aufgabe nicht betrachtet',
    },
    invariant: {
      variable: 's',
      index: 'i',
      range: '1<=i<=n+1',
      timing: 'before_iteration_i',
      expression: 'sum(j,1,i-1,j*A[j])',
    },
    initialization: {
      startIndex: '1',
      stateBeforeFirstIteration: 'vor Iteration 1',
      initializedValue: 's=0',
      substitutedExpression: 'sum(j,1,0,j*A[j])',
      conclusion: 'Die leere Summe ist 0, also gilt S(1).',
    },
    hypothesis: {
      index: 'i',
      range: '1<=i<n+1',
      equation: 's=sum(j,1,i-1,j*A[j])',
      timing: 'zu Beginn von Iteration i',
    },
    preservation: {
      before: 's=sum(j,1,i-1,j*A[j])',
      bodySubstitution: 's_neu=s+i*A[i]',
      algebra: 'sum(j,1,i-1,j*A[j])+i*A[i]=sum(j,1,i,j*A[j])',
      target: 's=sum(j,1,i,j*A[j])',
    },
    termination: {
      loopEndsWhen: 'nach i=n',
      nextIndex: 'n+1',
      invariantInstance: 's=sum(j,1,n,j*A[j])',
      returnValue: 'sum(j,1,n,j*A[j])',
    },
    conclusion: {
      invariantToReturn: 'Nach Terminierung gilt die Invariante für i=n+1.',
      returnLine: 'Zeile 4 gibt s zurück.',
      claimRestated: 'Der Algorithmus gibt sum(j,1,n,j*A[j]) zurück.',
    },
  };
}

export function createSumProofProblem(): ProofProblem {
  return {
    id: 'problem-schleifeninvariante-gewichtete-summe-v1',
    title: 'Schleifeninvariante für gewichtete Array-Summe',
    allowedSymbols: ['s', 'i', 'n', 'j', 'A'],
    program: {
      name: 'BerechneWert',
      input: 'Array A=[a_1,...,a_n] der Länge n mit a_i in N',
      output: 'gewichtete Summe der Arraywerte',
      pseudocode: ['s = 0', 'for i = 1 to n do', '  s = s + i * A[i]', 'return s'],
      accumulator: 's',
      loopIndex: 'i',
      loopStart: 1,
      loopEnd: 'n',
      loopBody: 's = s + i * A[i]',
      returnVariable: 's',
    },
    canonical: createCanonicalSumProof(),
  };
}

export function validateProofProblem(input: ProofProblem): ProofProblem {
  if (input.id !== createSumProofProblem().id)
    throw new Error('Nur der Phase-4-Summenbeweis ist produktiv freigegeben.');
  return input;
}

function includesValue(actual: string, expectedPart: string): boolean {
  return actual.toLocaleLowerCase('de').includes(expectedPart.toLocaleLowerCase('de'));
}

function addExpressionCheck(
  errors: ProofError[],
  actual: string,
  expected: string,
  section: ProofError['section'],
  criterionId: string,
  code: ProofError['errorCode'],
) {
  const comparison = compareExpressions(actual, expected);
  if (comparison.equivalent) return;
  errors.push(
    proofError(
      comparison.unsupported ? 'expression_parse_error' : code,
      section,
      actual,
      expected,
      comparison.unsupported
        ? `Der Ausdruck konnte nicht sicher geparst werden: ${comparison.reason}`
        : comparison.reason,
      criterionId,
      comparison.unsupported ? 'hinweis' : 'mittel',
    ),
  );
  if (!comparison.unsupported)
    errors.push(
      proofError(
        'manual_review_recommended',
        section,
        actual,
        expected,
        'Die Engine bewertet nur sichere Normalformen; alternative korrekte Schreibweisen können manuelle Sichtprüfung brauchen.',
        criterionId,
        'hinweis',
      ),
    );
}

export function evaluateStructuredProof(
  problem: ProofProblem,
  proof: StructuredProof,
  options: { mode: ProofMode; hintsUsed: string[]; solutionRevealed: boolean },
): ProofEvaluation {
  validateProofProblem(problem);
  const canonical = problem.canonical;
  const errors: ProofError[] = [];

  if (proof.preflight.accumulator !== canonical.preflight.accumulator)
    errors.push(
      proofError(
        'program_interpretation_error',
        'preflight',
        proof.preflight.accumulator,
        canonical.preflight.accumulator,
        'Die Akkumulatorvariable ist die Variable, die in jeder Iteration aktualisiert wird.',
        'program_analysis',
      ),
    );
  for (const [key, expected] of Object.entries(canonical.preflight)) {
    const actual = proof.preflight[key as keyof StructuredProof['preflight']];
    if (!String(actual).trim())
      errors.push(
        proofError(
          'incomplete_proof_error',
          'preflight',
          actual,
          expected,
          'Die Programmanalyse ist unvollständig.',
          'program_analysis',
          'hinweis',
        ),
      );
  }

  addExpressionCheck(
    errors,
    proof.claim.expression,
    canonical.claim.expression,
    'claim',
    'claim',
    'wrong_output_expression',
  );
  if (proof.claim.returnVariable !== canonical.claim.returnVariable)
    errors.push(
      proofError(
        'claim_error',
        'claim',
        proof.claim.returnVariable,
        canonical.claim.returnVariable,
        'Die Behauptung muss die tatsächlich zurückgegebene Variable benennen.',
        'claim',
      ),
    );

  if (proof.invariant.timing !== canonical.invariant.timing)
    errors.push(
      proofError(
        'invariant_timing_error',
        'invariant',
        proof.invariant.timing,
        canonical.invariant.timing,
        'Die Invariante gilt zu Beginn der i-ten Iteration, also nach i-1 ausgeführten Iterationen.',
        'invariant',
        'schwer',
      ),
    );
  if (proof.invariant.range !== canonical.invariant.range)
    errors.push(
      proofError(
        'index_range_error',
        'invariant',
        proof.invariant.range,
        canonical.invariant.range,
        'Der Bereich muss auch den hypothetischen Index n+1 nach Schleifenende enthalten.',
        'invariant',
      ),
    );
  addExpressionCheck(
    errors,
    proof.invariant.expression,
    canonical.invariant.expression,
    'invariant',
    'invariant',
    proof.invariant.expression.includes('i,j') ? 'off_by_one_error' : 'invariant_error',
  );

  if (
    proof.initialization.startIndex !== canonical.initialization.startIndex ||
    !includesValue(proof.initialization.initializedValue, '0')
  )
    errors.push(
      proofError(
        'initialization_error',
        'initialization',
        proof.initialization,
        canonical.initialization,
        'Der Induktionsanfang muss i=1 und den initialen Wert s=0 einsetzen.',
        'initialization',
      ),
    );
  if (!includesValue(proof.initialization.conclusion, 'S(1)'))
    errors.push(
      proofError(
        'proof_structure_error',
        'initialization',
        proof.initialization.conclusion,
        'S(1)',
        'Der Induktionsanfang braucht eine explizite Schlussfolgerung.',
        'initialization',
        'hinweis',
      ),
    );

  if (
    proof.hypothesis.index !== canonical.hypothesis.index ||
    proof.hypothesis.range !== canonical.hypothesis.range
  )
    errors.push(
      proofError(
        'induction_hypothesis_error',
        'hypothesis',
        proof.hypothesis,
        canonical.hypothesis,
        'Die Induktionsvoraussetzung muss für 1<=i<n+1 zu Beginn der Iteration gelten.',
        'hypothesis',
      ),
    );
  addExpressionCheck(
    errors,
    proof.hypothesis.equation.replace(/^s=/u, ''),
    canonical.invariant.expression,
    'hypothesis',
    'hypothesis',
    'induction_hypothesis_error',
  );

  if (!includesValue(proof.preservation.bodySubstitution, 'i*A[i]'))
    errors.push(
      proofError(
        'loop_body_substitution_error',
        'preservation',
        proof.preservation.bodySubstitution,
        canonical.preservation.bodySubstitution,
        'Der Schleifenrumpf muss s um i*A[i] erhöhen.',
        'preservation',
      ),
    );
  if (!includesValue(proof.preservation.algebra, 'sum(j,1,i,j*A[j])'))
    errors.push(
      proofError(
        'algebra_error',
        'preservation',
        proof.preservation.algebra,
        canonical.preservation.algebra,
        'Der algebraische Schritt muss die Summe bis i ergeben.',
        'preservation',
      ),
    );
  if (!includesValue(proof.preservation.target, 'i,j*A[j]'))
    errors.push(
      proofError(
        'induction_target_error',
        'preservation',
        proof.preservation.target,
        canonical.preservation.target,
        'Ziel des Schritts ist die Invariante für i+1, also Summe bis i.',
        'preservation',
      ),
    );
  addExpressionCheck(
    errors,
    proof.preservation.target.replace(/^s=/u, ''),
    canonical.preservation.target.replace(/^s=/u, ''),
    'preservation',
    'preservation',
    'induction_target_error',
  );

  if (proof.termination.nextIndex !== canonical.termination.nextIndex)
    errors.push(
      proofError(
        'off_by_one_error',
        'termination',
        proof.termination.nextIndex,
        canonical.termination.nextIndex,
        'Nach n Iterationen ist der nächste hypothetische Index n+1.',
        'termination',
        'schwer',
      ),
    );
  addExpressionCheck(
    errors,
    proof.termination.returnValue,
    canonical.termination.returnValue,
    'termination',
    'termination',
    'termination_error',
  );

  if (
    !includesValue(proof.conclusion.returnLine, 'return') &&
    !includesValue(proof.conclusion.returnLine, 'Zeile 4')
  )
    errors.push(
      proofError(
        'return_value_connection_error',
        'conclusion',
        proof.conclusion.returnLine,
        canonical.conclusion.returnLine,
        'Die Schlussfolgerung muss die Rückgabezeile mit der Invariante verbinden.',
        'conclusion',
      ),
    );
  if (!includesValue(proof.conclusion.claimRestated, 'sum(j,1,n,j*A[j])'))
    errors.push(
      proofError(
        'conclusion_error',
        'conclusion',
        proof.conclusion.claimRestated,
        canonical.conclusion.claimRestated,
        'Am Ende muss die ursprüngliche Behauptung wieder erreicht werden.',
        'conclusion',
      ),
    );

  const rubric = scoreRubric(errors);
  let points = rubric.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  if (options.solutionRevealed) points = Math.min(points, 8);
  if (options.hintsUsed.length > 0) points = Math.min(points, 10.5);
  if (options.mode === 'exam' && errors.length === 0) points = maxPoints;
  return {
    points,
    maxPoints,
    rubricResults: rubric.map((item) =>
      item.criterionId === 'caps' ? { ...item, points: Math.max(0, points - 10.5) } : item,
    ),
    errors,
    recommendation: recommendNextProofActivity(points, maxPoints, errors),
    canonicalProof: canonical,
  };
}

function scoreRubric(errors: ProofError[]) {
  const has = (criterionId: string) => errors.some((error) => error.criterionId === criterionId);
  const severe = (criterionId: string) =>
    errors.some((error) => error.criterionId === criterionId && error.severity === 'schwer');
  return [
    {
      criterionId: 'program_analysis',
      label: 'Programm verstanden',
      points: has('program_analysis') ? 1 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'claim',
      label: 'Behauptung formuliert',
      points: has('claim') ? 1 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'invariant',
      label: 'Zeitpunkt, Bereich und Invariante',
      points: severe('invariant') ? 1 : has('invariant') ? 2 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'initialization',
      label: 'Induktionsanfang',
      points: has('initialization') ? 1 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'hypothesis',
      label: 'Induktionsvoraussetzung',
      points: has('hypothesis') ? 0.5 : 1,
      maxPoints: 1,
    },
    {
      criterionId: 'preservation',
      label: 'Induktionsschritt und Erhaltung',
      points: has('preservation') ? 1.5 : 3,
      maxPoints: 3,
    },
    {
      criterionId: 'termination',
      label: 'Terminierung',
      points: severe('termination') ? 0.5 : has('termination') ? 1 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'conclusion',
      label: 'Schlussfolgerung',
      points: has('conclusion') ? 0.5 : 1,
      maxPoints: 1,
    },
  ];
}

export function scoreProofAttempt(
  problem: ProofProblem,
  proof: StructuredProof,
  options: { mode: ProofMode; hintsUsed: string[]; solutionRevealed: boolean },
) {
  return evaluateStructuredProof(problem, proof, options);
}

export function generateCanonicalProofText(proof = createCanonicalSumProof()): string[] {
  return [
    `Behauptung: ${proof.claim.quantifier} gibt der Algorithmus ${proof.claim.expression} zurück.`,
    `Invariante: Zu Beginn der i-ten Iteration gilt ${proof.invariant.variable}=${proof.invariant.expression} für ${proof.invariant.range}.`,
    `IA: Für i=${proof.initialization.startIndex} ist ${proof.initialization.initializedValue}; die leere Summe ist 0.`,
    `IV: Angenommen ${proof.hypothesis.equation} gilt ${proof.hypothesis.timing}.`,
    `IS: ${proof.preservation.bodySubstitution}; mit IV folgt ${proof.preservation.algebra}.`,
    `Terminierung: Nach der Schleife gilt i=${proof.termination.nextIndex} und damit ${proof.termination.invariantInstance}.`,
    `Schluss: ${proof.conclusion.returnLine} Also ${proof.conclusion.claimRestated}`,
  ];
}

export function recommendNextProofActivity(
  points: number,
  maxPoints: number,
  errors: ProofError[],
) {
  const code = errors[0]?.errorCode;
  if (!code && points === maxPoints)
    return {
      code: 'learning_path_complete' as const,
      label: 'Beweis später im Prüfungsmodus wiederholen',
      reason: 'Der strukturierte Schleifeninvariantenbeweis ist vollständig korrekt.',
    };
  if (code === 'invariant_timing_error' || code === 'off_by_one_error')
    return {
      code: 'repeat_invariant_timing' as const,
      label: 'Schleifenzeitpunkt üben',
      reason:
        'Der wichtigste Fehler liegt beim Zusammenhang zwischen i und bereits ausgeführten Iterationen.',
    };
  if (code === 'expression_parse_error')
    return {
      code: 'repeat_formula_notation' as const,
      label: 'Formelschreibweise üben',
      reason: 'Die Engine konnte mindestens eine Formel nicht sicher parsen.',
    };
  return {
    code: 'repeat_proof_structure' as const,
    label: 'Beweisschema gezielt wiederholen',
    reason:
      'Bearbeite Behauptung, Invariante, IA, IV, IS, Terminierung und Schluss noch einmal strukturiert.',
  };
}

export function canonicalProofAttempt(): StructuredProof {
  const proof = createCanonicalSumProof();
  return {
    trainerKind: proof.trainerKind,
    problemId: proof.problemId,
    preflight: proof.preflight,
    claim: proof.claim,
    invariant: proof.invariant,
    initialization: proof.initialization,
    hypothesis: proof.hypothesis,
    preservation: proof.preservation,
    termination: proof.termination,
    conclusion: proof.conclusion,
  };
}

export function deriveProofMastery(
  attempts: Array<{
    id: string;
    mode: ProofMode;
    score: number;
    maxScore: number;
    errorCodes: string[];
    hintsUsed: string[];
    solutionRevealed: boolean;
  }>,
): ProofMastery {
  const completed = attempts.filter((attempt) => attempt.maxScore > 0);
  const evidenceAttemptIds = completed.map((attempt) => attempt.id);
  const base =
    completed.reduce((sum, attempt) => {
      const modeBoost = attempt.mode === 'exam' ? 1.15 : attempt.mode === 'review' ? 0.75 : 1;
      const hintPenalty = Math.max(0.35, 1 - attempt.hintsUsed.length * 0.12);
      const revealPenalty = attempt.solutionRevealed ? 0.35 : 1;
      return sum + (attempt.score / attempt.maxScore) * modeBoost * hintPenalty * revealPenalty;
    }, 0) / Math.max(2, completed.length);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const has = (code: string) => completed.some((attempt) => attempt.errorCodes.includes(code));
  return {
    evidenceAttemptIds,
    dimensions: {
      program_comprehension: clamp(base * (has('program_interpretation_error') ? 0.65 : 1)),
      mathematical_formulation: clamp(base * (has('wrong_output_expression') ? 0.55 : 1)),
      proof_structure: clamp(base * (has('proof_structure_error') ? 0.7 : 1)),
      formal_reasoning: clamp(
        base * (has('preservation_error') || has('algebra_error') ? 0.55 : 1),
      ),
      notation_accuracy: clamp(base * (has('expression_parse_error') ? 0.45 : 1)),
      claim_formulation: clamp(base * (has('claim_error') ? 0.55 : 1)),
      invariant_formulation: clamp(base * (has('invariant_error') ? 0.5 : 1)),
      loop_timing: clamp(
        base * (has('invariant_timing_error') || has('off_by_one_error') ? 0.45 : 1),
      ),
      initialization_proof: clamp(base * (has('initialization_error') ? 0.55 : 1)),
      induction_hypothesis: clamp(base * (has('induction_hypothesis_error') ? 0.55 : 1)),
      preservation_proof: clamp(
        base * (has('loop_body_substitution_error') || has('algebra_error') ? 0.5 : 1),
      ),
      termination_reasoning: clamp(base * (has('termination_error') ? 0.55 : 1)),
      correctness_conclusion: clamp(base * (has('conclusion_error') ? 0.6 : 1)),
    },
  };
}
