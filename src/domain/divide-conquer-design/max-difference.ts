import type {
  CanonicalDivideConquerDesignSolution,
  DivideConquerDesignAnswer,
  DivideConquerDesignError,
  DivideConquerDesignErrorCode,
  DivideConquerDesignEvaluation,
  DivideConquerDesignMastery,
  DivideConquerDesignMode,
  MaxDifferenceTriple,
  MaxDifferenceWitness,
} from './types';

const topicId = 'topic-00cf6dec50ed';

export function solveMaxDifferenceDivideConquer(values: number[]): MaxDifferenceTriple {
  if (values.length === 0) throw new Error('Mindestens ein Wert erforderlich.');

  function solve(left: number, right: number): MaxDifferenceTriple {
    if (left === right) {
      const value = values[left] ?? 0;
      return { maxDifference: 0, minimum: value, maximum: value };
    }
    const middle = Math.floor((left + right) / 2);
    const leftResult = solve(left, middle);
    const rightResult = solve(middle + 1, right);
    return {
      maxDifference: Math.max(
        leftResult.maxDifference,
        rightResult.maxDifference,
        leftResult.maximum - rightResult.minimum,
      ),
      minimum: Math.min(leftResult.minimum, rightResult.minimum),
      maximum: Math.max(leftResult.maximum, rightResult.maximum),
    };
  }

  return solve(0, values.length - 1);
}

export function bruteForceMaxDifference(values: number[]): MaxDifferenceWitness {
  if (values.length === 0) throw new Error('Mindestens ein Wert erforderlich.');
  let best: MaxDifferenceWitness = { value: 0, leftIndex: 0, rightIndex: 0 };
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left; right < values.length; right += 1) {
      const value = (values[left] ?? 0) - (values[right] ?? 0);
      if (
        value > best.value ||
        (value === best.value &&
          (left < best.leftIndex || (left === best.leftIndex && right < best.rightIndex)))
      ) {
        best = { value, leftIndex: left, rightIndex: right };
      }
    }
  }
  return best;
}

export function validateMaxDifferenceOracle(values: number[]): boolean {
  if (values.length > 10) throw new Error('Oracle prüft nur kleine Instanzen bis n=10.');
  return (
    solveMaxDifferenceDivideConquer(values).maxDifference === bruteForceMaxDifference(values).value
  );
}

export function findMissingCrossCaseCounterexample(limit = 6): number[] | null {
  for (let a = 1; a <= limit; a += 1)
    for (let b = 1; b <= limit; b += 1)
      for (let c = 1; c <= limit; c += 1)
        for (let d = 1; d <= limit; d += 1) {
          const values = [a, b, c, d];
          const left = solveMaxDifferenceDivideConquer(values.slice(0, 2)).maxDifference;
          const right = solveMaxDifferenceDivideConquer(values.slice(2)).maxDifference;
          const withoutCross = Math.max(left, right);
          const oracle = bruteForceMaxDifference(values).value;
          if (oracle > withoutCross) return values;
        }
  return null;
}

export function canonicalMaxDifferenceAnswer(): CanonicalDivideConquerDesignSolution {
  const sampleInput = [7, 2, 9, 1, 5];
  return {
    kind: 'divide_conquer_max_difference',
    trainerKind: 'design',
    problemId: 'problem-dc-maxwertdifferenz-v1',
    canonicalSolutionVersion: 'canonical-dc-maxwertdifferenz-v1',
    sampleInput,
    result: solveMaxDifferenceDivideConquer(sampleInput),
    interpretation: {
      input: 'Feld A[1..n] positiver ganzer Zahlen',
      objective: 'maximiere A[i] - A[j] unter der Bedingung i <= j',
      output: 'maximale gerichtete Wertdifferenz',
    },
    decomposition: {
      subproblem:
        'MaxWertDiff(A,l,r) liefert [maximale Differenz, kleinster Wert, größter Wert] für A[l..r]',
      baseCase: 'wenn l = r: return [0, A[l], A[l]]',
      split: 'm = floor((l+r)/2); löse A[l..m] und A[m+1..r] rekursiv',
    },
    combine: {
      leftCase: 'optimales Paar liegt vollständig in der linken Hälfte: L[1]',
      rightCase: 'optimales Paar liegt vollständig in der rechten Hälfte: R[1]',
      crossCase: 'optimales Paar kreuzt die Mitte: L[3] - R[2]',
      summary: 'return [max(L[1], R[1], L[3] - R[2]), min(L[2], R[2]), max(L[3], R[3])]',
    },
    algorithm: {
      signature: 'MaxWertDiff(A,l,r)',
      recursiveCalls: 'L = MaxWertDiff(A,l,m); R = MaxWertDiff(A,m+1,r)',
      returnValue: '[max(L[1], R[1], L[3] - R[2]), min(L[2], R[2]), max(L[3], R[3])]',
    },
    recurrence: {
      equation: 'T(n) = 2T(n/2) + O(1)',
      combineCost: 'O(1)',
      runtime: 'O(n)',
    },
    proof: {
      claim:
        'MaxWertDiff(A,l,r) berechnet die maximale Differenz A[i] - A[j] mit i <= j und liefert Minimum und Maximum von A[l..r]',
      inductionParameter: 'k = r - l + 1',
      baseCase: 'für k = 1 ist die maximale Differenz 0 und A[l] zugleich Minimum und Maximum',
      inductionStep: 'nach Induktionsvoraussetzung sind L und R für beide Hälften korrekt',
      caseAnalysis:
        'jedes zulässige Paar liegt links, rechts oder kreuzt von links nach rechts über die Mitte',
      conclusion:
        'das Maximum der drei Fälle ist vollständig; Minimum und Maximum werden mit min und max korrekt zusammengeführt',
    },
  };
}

export function emptyMaxDifferenceAnswer(): DivideConquerDesignAnswer {
  const canonical = canonicalMaxDifferenceAnswer();
  return {
    ...canonical,
    interpretation: blank(canonical.interpretation),
    decomposition: blank(canonical.decomposition),
    combine: blank(canonical.combine),
    algorithm: blank(canonical.algorithm),
    recurrence: blank(canonical.recurrence),
    proof: blank(canonical.proof),
  };
}

function blank<T extends Record<string, string>>(value: T): T {
  return Object.fromEntries(Object.keys(value).map((key) => [key, ''])) as T;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('de')
    .replaceAll(/\s+/gu, '')
    .replaceAll('≤', '<=')
    .replaceAll('·', '*')
    .replaceAll('⌊', 'floor(')
    .replaceAll('⌋', ')');
}

function dcError(
  errorCode: DivideConquerDesignErrorCode,
  section: keyof DivideConquerDesignAnswer,
  criterionId: string,
  actual: unknown,
  expected: unknown,
  explanation: string,
): DivideConquerDesignError {
  return {
    errorCode,
    section,
    criterionId,
    evidence: `Abschnitt ${section}: ${String(actual)}`,
    expected,
    actual,
    explanation,
    severity:
      errorCode === 'dc_missing_cross_case' || errorCode === 'dc_summary_values_error'
        ? 'schwer'
        : 'mittel',
    topicId,
    recommendedReview: 'D&C-Zerlegung, Cross-Fall, Rekurrenz und Induktionsbeweis wiederholen.',
    step: null,
  };
}

function check(
  errors: DivideConquerDesignError[],
  section: keyof DivideConquerDesignAnswer,
  criterionId: string,
  code: DivideConquerDesignErrorCode,
  actual: string,
  expected: string,
) {
  if (normalize(actual) === normalize(expected)) return;
  errors.push(
    dcError(
      code,
      section,
      criterionId,
      actual,
      expected,
      'Die strukturierte Eingabe weicht vom belegten kanonischen Baustein ab.',
    ),
  );
}

function scoreRubric(errors: DivideConquerDesignError[]) {
  const has = (criterionId: string) => errors.some((error) => error.criterionId === criterionId);
  return [
    {
      criterionId: 'interpretation',
      label: 'Problem, Richtung und Ausgabe korrekt gedeutet',
      points: has('interpretation') ? 1 : 6,
      maxPoints: 6,
    },
    {
      criterionId: 'decomposition',
      label: 'Teilproblem, Basisfall und Split',
      points: has('decomposition') ? 2 : 9,
      maxPoints: 9,
    },
    {
      criterionId: 'combine',
      label: 'alle drei Fälle und Rückgabetripel',
      points: has('combine') ? 2 : 12,
      maxPoints: 12,
    },
    {
      criterionId: 'algorithm',
      label: 'rekursiver Pseudocode mit Rückgabewert',
      points: has('algorithm') ? 2 : 7,
      maxPoints: 7,
    },
    {
      criterionId: 'recurrence',
      label: 'Rekurrenz und Laufzeit',
      points: has('recurrence') ? 1 : 6,
      maxPoints: 6,
    },
    {
      criterionId: 'proof',
      label: 'Induktiver Korrektheitsbeweis',
      points: has('proof') ? 2 : 8,
      maxPoints: 8,
    },
  ];
}

export function evaluateMaxDifferenceDesign(
  answer: DivideConquerDesignAnswer,
  options: { mode: DivideConquerDesignMode; hintsUsed: string[]; solutionRevealed: boolean },
): DivideConquerDesignEvaluation {
  const canonical = canonicalMaxDifferenceAnswer();
  const errors: DivideConquerDesignError[] = [];
  for (const [field, expected] of Object.entries(canonical.interpretation))
    check(
      errors,
      'interpretation',
      'interpretation',
      'dc_interpretation_error',
      answer.interpretation[field as keyof DivideConquerDesignAnswer['interpretation']],
      expected,
    );
  check(
    errors,
    'decomposition',
    'decomposition',
    'dc_subproblem_error',
    answer.decomposition.subproblem,
    canonical.decomposition.subproblem,
  );
  check(
    errors,
    'decomposition',
    'decomposition',
    'dc_base_case_error',
    answer.decomposition.baseCase,
    canonical.decomposition.baseCase,
  );
  check(
    errors,
    'decomposition',
    'decomposition',
    'dc_split_error',
    answer.decomposition.split,
    canonical.decomposition.split,
  );
  check(
    errors,
    'combine',
    'combine',
    'dc_missing_left_case',
    answer.combine.leftCase,
    canonical.combine.leftCase,
  );
  check(
    errors,
    'combine',
    'combine',
    'dc_missing_right_case',
    answer.combine.rightCase,
    canonical.combine.rightCase,
  );
  check(
    errors,
    'combine',
    'combine',
    'dc_missing_cross_case',
    answer.combine.crossCase,
    canonical.combine.crossCase,
  );
  check(
    errors,
    'combine',
    'combine',
    'dc_summary_values_error',
    answer.combine.summary,
    canonical.combine.summary,
  );
  for (const [field, expected] of Object.entries(canonical.algorithm))
    check(
      errors,
      'algorithm',
      'algorithm',
      'dc_algorithm_error',
      answer.algorithm[field as keyof DivideConquerDesignAnswer['algorithm']],
      expected,
    );
  check(
    errors,
    'recurrence',
    'recurrence',
    'dc_recurrence_error',
    answer.recurrence.equation,
    canonical.recurrence.equation,
  );
  check(
    errors,
    'recurrence',
    'recurrence',
    'dc_runtime_error',
    answer.recurrence.combineCost,
    canonical.recurrence.combineCost,
  );
  check(
    errors,
    'recurrence',
    'recurrence',
    'dc_runtime_error',
    answer.recurrence.runtime,
    canonical.recurrence.runtime,
  );
  for (const [field, expected] of Object.entries(canonical.proof))
    check(
      errors,
      'proof',
      'proof',
      'dc_proof_error',
      answer.proof[field as keyof DivideConquerDesignAnswer['proof']],
      expected,
    );
  const rubric = scoreRubric(errors);
  let points = rubric.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  if (options.solutionRevealed) points = Math.min(points, 14);
  if (options.hintsUsed.length > 0) points = Math.min(points, 31);
  return {
    points,
    maxPoints,
    examPoints: Math.round((points / maxPoints) * 8 * 10) / 10,
    rubricResults: rubric,
    errors,
    recommendation: recommendDivideConquerReview(points, maxPoints, errors),
    canonicalSolution: canonical,
  };
}

export function recommendDivideConquerReview(
  points: number,
  maxPoints: number,
  errors: DivideConquerDesignError[],
) {
  const first = errors[0]?.errorCode;
  if (!first && points === maxPoints)
    return {
      code: 'learning_path_complete' as const,
      label: 'D&C-Entwurf im Prüfungsmodus wiederholen',
      reason: 'Zerlegung, Combine, Rekurrenz und Beweis sind vollständig korrekt.',
    };
  if (first === 'dc_missing_cross_case' || first === 'dc_summary_values_error')
    return {
      code: 'repeat_dp_recurrence' as const,
      label: 'Combine-Schritt wiederholen',
      reason: 'Der Cross-Fall oder das Rückgabetripel ist noch nicht stabil.',
    };
  if (first === 'dc_recurrence_error' || first === 'dc_runtime_error')
    return {
      code: 'repeat_recurrence' as const,
      label: 'Rekurrenz wiederholen',
      reason: 'Aufrufzahl, Teilproblemgröße und Combine-Kosten müssen zusammenpassen.',
    };
  if (first === 'dc_proof_error')
    return {
      code: 'repeat_proof_structure' as const,
      label: 'Induktionsbeweis wiederholen',
      reason: 'Die Fallanalyse links, rechts und cross muss den Beweis tragen.',
    };
  return {
    code: 'repeat_dp_design_full' as const,
    label: 'D&C-Zerlegung wiederholen',
    reason: 'Die zentrale Problemzerlegung ist noch nicht vollständig stabil.',
  };
}

export function deriveDivideConquerDesignMastery(
  attempts: Array<{
    id: string;
    mode: DivideConquerDesignMode;
    score: number;
    maxScore: number;
    errorCodes: string[];
    hintsUsed: string[];
    solutionRevealed: boolean;
  }>,
): DivideConquerDesignMastery {
  const completed = attempts.filter((attempt) => attempt.maxScore > 0);
  const base =
    completed.reduce((sum, attempt) => {
      const modeBoost = attempt.mode === 'exam' ? 1.15 : attempt.mode === 'learn' ? 0.65 : 1;
      const hintPenalty = Math.max(0.35, 1 - attempt.hintsUsed.length * 0.1);
      return (
        sum +
        (attempt.score / attempt.maxScore) *
          modeBoost *
          hintPenalty *
          (attempt.solutionRevealed ? 0.35 : 1)
      );
    }, 0) / Math.max(2, completed.length);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const has = (code: string) => completed.some((attempt) => attempt.errorCodes.includes(code));
  return {
    evidenceAttemptIds: completed.map((attempt) => attempt.id),
    dimensions: {
      problem_interpretation: clamp(base * (has('dc_interpretation_error') ? 0.5 : 1)),
      decomposition: clamp(base * (has('dc_subproblem_error') ? 0.55 : 1)),
      combine_cases: clamp(base * (has('dc_missing_cross_case') ? 0.35 : 1)),
      recurrence_analysis: clamp(base * (has('dc_recurrence_error') ? 0.55 : 1)),
      induction_proof: clamp(base * (has('dc_proof_error') ? 0.45 : 1)),
    },
  };
}

export function canonicalMaxDifferenceText(): string[] {
  const c = canonicalMaxDifferenceAnswer();
  return [
    `Teilproblem: ${c.decomposition.subproblem}.`,
    `Combine: ${c.combine.summary}.`,
    `Rekurrenz: ${c.recurrence.equation}, ${c.recurrence.runtime}.`,
    `Beweis: ${c.proof.caseAnalysis}.`,
  ];
}
