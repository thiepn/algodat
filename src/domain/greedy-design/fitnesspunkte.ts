import type {
  CanonicalGreedyDesignSolution,
  GreedyDesignAnswer,
  GreedyDesignError,
  GreedyDesignErrorCode,
  GreedyDesignEvaluation,
  GreedyDesignMastery,
  GreedyDesignMode,
} from './types';

const topicId = 'topic-3e0e72f97f6e';

export function solveFitnesspunkteGreedy(difficulties: number[]) {
  const sortedOrder = [...difficulties].sort((left, right) => right - left);
  const n = sortedOrder.length;
  const optimalValue = sortedOrder.reduce((sum, value, index) => sum + value * (n - index), 0);
  return { sortedOrder, optimalValue };
}

function permute(values: number[]): number[][] {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) =>
    permute(values.filter((_, candidateIndex) => candidateIndex !== index)).map((tail) => [
      value,
      ...tail,
    ]),
  );
}

export function bruteForceFitnesspunkte(difficulties: number[]): number {
  const n = difficulties.length;
  return Math.max(
    ...permute(difficulties).map((order) =>
      order.reduce((sum, value, index) => sum + value * (n - index), 0),
    ),
  );
}

export function validateGreedyOracle(difficulties: number[]): boolean {
  if (difficulties.length > 8) throw new Error('Oracle prüft nur kleine Instanzen bis n=8.');
  return (
    solveFitnesspunkteGreedy(difficulties).optimalValue === bruteForceFitnesspunkte(difficulties)
  );
}

export function canonicalFitnesspunkteAnswer(): CanonicalGreedyDesignSolution {
  const sampleInput = [4, 9, 2, 7];
  const solved = solveFitnesspunkteGreedy(sampleInput);
  return {
    kind: 'greedy_design_fitnesspunkte',
    trainerKind: 'design',
    problemId: 'problem-greedy-fitnesspunkte-v1',
    canonicalSolutionVersion: 'canonical-greedy-fitnesspunkte-v1',
    sampleInput,
    sortedOrder: solved.sortedOrder,
    optimalValue: solved.optimalValue,
    interpretation: {
      inputObjects: 'Array S[1..n] mit n Schwierigkeitsgraden',
      objective: 'maximiere die Summe S[i] * (n - i + 1) über eine Permutation von S',
      constraints: 'genau eine Übung pro Tag; jede Übung wird genau einmal verwendet',
      output: 'maximal erreichbare Anzahl an Fitnesspunkten',
    },
    greedyRule: {
      sortingOrder: 'S wird absteigend sortiert',
      tieBreaker: 'gleiche Schwierigkeitsgrade dürfen in beliebiger Reihenfolge stehen',
      decision: 'größere Schwierigkeitsgrade werden früher angesetzt',
      objectiveReason: 'frühere Tage haben den größeren Faktor n - i + 1',
    },
    algorithm: {
      preprocessing: 'Mergesort(S) in absteigender Reihenfolge',
      accumulator: 'sum = 0',
      loop: 'für i = 1 bis n: sum = sum + S[i] * (n - i + 1)',
      returnStatement: 'return sum',
    },
    proof: {
      claim: 'Der Wert ist maximal, wenn S absteigend sortiert ist',
      contradictionAssumption: 'Angenommen, keine optimale Lösung ist absteigend sortiert',
      exchangeStep:
        'Dann gibt es in einer optimalen Lösung Opt ein i mit Opt[i] < Opt[i+1]; tausche diese beiden Werte',
      difference: 'Wert(Opt) - Wert(Getauscht) = Opt[i] - Opt[i+1] < 0',
      conclusion: 'Die getauschte Lösung ist besser; Widerspruch zur Optimalität von Opt',
    },
    complexity: {
      sorting: 'Mergesort benötigt O(n log n)',
      loop: 'die Schleife benötigt O(n)',
      total: 'insgesamt O(n log n)',
      memory: 'zusätzlicher Speicher hängt von der Sortierimplementierung ab',
    },
  };
}

export function emptyFitnesspunkteAnswer(): GreedyDesignAnswer {
  const canonical = canonicalFitnesspunkteAnswer();
  return {
    ...canonical,
    interpretation: Object.fromEntries(
      Object.keys(canonical.interpretation).map((key) => [key, '']),
    ) as GreedyDesignAnswer['interpretation'],
    greedyRule: Object.fromEntries(
      Object.keys(canonical.greedyRule).map((key) => [key, '']),
    ) as GreedyDesignAnswer['greedyRule'],
    algorithm: Object.fromEntries(
      Object.keys(canonical.algorithm).map((key) => [key, '']),
    ) as GreedyDesignAnswer['algorithm'],
    proof: Object.fromEntries(
      Object.keys(canonical.proof).map((key) => [key, '']),
    ) as GreedyDesignAnswer['proof'],
    complexity: Object.fromEntries(
      Object.keys(canonical.complexity).map((key) => [key, '']),
    ) as GreedyDesignAnswer['complexity'],
  };
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('de')
    .replaceAll(/\s+/gu, '')
    .replaceAll('·', '*')
    .replaceAll('<=', '≤');
}

function greedyError(
  errorCode: GreedyDesignErrorCode,
  section: keyof GreedyDesignAnswer,
  criterionId: string,
  actual: unknown,
  expected: unknown,
  explanation: string,
): GreedyDesignError {
  return {
    errorCode,
    section,
    criterionId,
    evidence: `Abschnitt ${section}: ${String(actual)}`,
    expected,
    actual,
    explanation,
    severity: 'mittel',
    topicId,
    recommendedReview: 'Greedy-Regel, Austauschbeweis und Laufzeit gezielt wiederholen.',
    step: null,
  };
}

function check(
  errors: GreedyDesignError[],
  section: keyof GreedyDesignAnswer,
  criterionId: string,
  code: GreedyDesignErrorCode,
  actual: string,
  expected: string,
) {
  if (normalize(actual) === normalize(expected)) return;
  errors.push(
    greedyError(
      code,
      section,
      criterionId,
      actual,
      expected,
      'Die strukturierte Eingabe weicht vom belegten kanonischen Baustein ab.',
    ),
  );
}

function scoreRubric(errors: GreedyDesignError[]) {
  const has = (criterionId: string) => errors.some((error) => error.criterionId === criterionId);
  return [
    {
      criterionId: 'interpretation',
      label: 'Problem und Ziel korrekt gedeutet',
      points: has('interpretation') ? 1 : 5,
      maxPoints: 5,
    },
    {
      criterionId: 'greedy_rule',
      label: 'Greedy-Regel und Priorität',
      points: has('greedy_rule') ? 2 : 8,
      maxPoints: 8,
    },
    {
      criterionId: 'algorithm',
      label: 'Pseudocode mit Akkumulator',
      points: has('algorithm') ? 2 : 8,
      maxPoints: 8,
    },
    {
      criterionId: 'proof',
      label: 'Austausch-/Widerspruchsbeweis',
      points: has('proof') ? 2 : 12,
      maxPoints: 12,
    },
    {
      criterionId: 'runtime',
      label: 'Laufzeitanalyse',
      points: has('runtime') ? 1 : 5,
      maxPoints: 5,
    },
    {
      criterionId: 'memory',
      label: 'Speicherhinweis',
      points: has('memory') ? 0 : 2,
      maxPoints: 2,
    },
  ];
}

export function evaluateFitnesspunkteDesign(
  answer: GreedyDesignAnswer,
  options: { mode: GreedyDesignMode; hintsUsed: string[]; solutionRevealed: boolean },
): GreedyDesignEvaluation {
  const canonical = canonicalFitnesspunkteAnswer();
  const errors: GreedyDesignError[] = [];
  for (const [field, expected] of Object.entries(canonical.interpretation))
    check(
      errors,
      'interpretation',
      'interpretation',
      'greedy_interpretation_error',
      answer.interpretation[field as keyof GreedyDesignAnswer['interpretation']],
      expected,
    );
  for (const [field, expected] of Object.entries(canonical.greedyRule))
    check(
      errors,
      'greedyRule',
      'greedy_rule',
      'greedy_rule_error',
      answer.greedyRule[field as keyof GreedyDesignAnswer['greedyRule']],
      expected,
    );
  for (const [field, expected] of Object.entries(canonical.algorithm))
    check(
      errors,
      'algorithm',
      'algorithm',
      'greedy_algorithm_error',
      answer.algorithm[field as keyof GreedyDesignAnswer['algorithm']],
      expected,
    );
  for (const [field, expected] of Object.entries(canonical.proof))
    check(
      errors,
      'proof',
      'proof',
      'greedy_proof_error',
      answer.proof[field as keyof GreedyDesignAnswer['proof']],
      expected,
    );
  check(
    errors,
    'complexity',
    'runtime',
    'greedy_runtime_error',
    answer.complexity.sorting,
    canonical.complexity.sorting,
  );
  check(
    errors,
    'complexity',
    'runtime',
    'greedy_runtime_error',
    answer.complexity.loop,
    canonical.complexity.loop,
  );
  check(
    errors,
    'complexity',
    'runtime',
    'greedy_runtime_error',
    answer.complexity.total,
    canonical.complexity.total,
  );
  check(
    errors,
    'complexity',
    'memory',
    'greedy_memory_error',
    answer.complexity.memory,
    canonical.complexity.memory,
  );
  const rubric = scoreRubric(errors);
  let points = rubric.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  if (options.solutionRevealed) points = Math.min(points, 12);
  if (options.hintsUsed.length > 0) points = Math.min(points, 26);
  return {
    points,
    maxPoints,
    examPoints: Math.round((points / maxPoints) * 8 * 10) / 10,
    rubricResults: rubric,
    errors,
    recommendation: recommendGreedyReview(points, maxPoints, errors),
    canonicalSolution: canonical,
  };
}

export function recommendGreedyReview(
  points: number,
  maxPoints: number,
  errors: GreedyDesignError[],
) {
  const first = errors[0]?.errorCode;
  if (!first && points === maxPoints)
    return {
      code: 'learning_path_complete' as const,
      label: 'Greedy-Entwurf im Prüfungsmodus wiederholen',
      reason: 'Regel, Algorithmus, Beweis und Laufzeit sind vollständig korrekt.',
    };
  if (first === 'greedy_rule_error')
    return {
      code: 'repeat_greedy_rule' as const,
      label: 'Greedy-Regel wiederholen',
      reason: 'Die Priorität der absteigenden Sortierung ist noch nicht stabil.',
    };
  if (first === 'greedy_proof_error')
    return {
      code: 'repeat_greedy_exchange_proof' as const,
      label: 'Austauschbeweis wiederholen',
      reason: 'Der erste zentrale Fehler liegt im Widerspruchs-/Tauschargument.',
    };
  if (first === 'greedy_runtime_error')
    return {
      code: 'repeat_greedy_runtime' as const,
      label: 'Laufzeit wiederholen',
      reason: 'Sortier- und Schleifenkosten müssen getrennt angegeben werden.',
    };
  return {
    code: 'repeat_greedy_rule' as const,
    label: 'vollständigen Greedy-Entwurf wiederholen',
    reason: 'Mehrere Greedy-Bausteine sind noch nicht stabil.',
  };
}

export function deriveGreedyDesignMastery(
  attempts: Array<{
    id: string;
    mode: GreedyDesignMode;
    score: number;
    maxScore: number;
    errorCodes: string[];
    hintsUsed: string[];
    solutionRevealed: boolean;
  }>,
): GreedyDesignMastery {
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
      problem_interpretation: clamp(base * (has('greedy_interpretation_error') ? 0.5 : 1)),
      greedy_rule: clamp(base * (has('greedy_rule_error') ? 0.45 : 1)),
      algorithm_construction: clamp(base * (has('greedy_algorithm_error') ? 0.55 : 1)),
      exchange_proof: clamp(base * (has('greedy_proof_error') ? 0.45 : 1)),
      complexity_analysis: clamp(base * (has('greedy_runtime_error') ? 0.6 : 1)),
    },
  };
}

export function canonicalFitnesspunkteText(): string[] {
  const c = canonicalFitnesspunkteAnswer();
  return [
    `Regel: ${c.greedyRule.sortingOrder}; ${c.greedyRule.decision}.`,
    `Algorithmus: ${c.algorithm.preprocessing}; ${c.algorithm.loop}; ${c.algorithm.returnStatement}.`,
    `Beweisidee: ${c.proof.exchangeStep}; ${c.proof.difference}.`,
    `Laufzeit: ${c.complexity.total}.`,
  ];
}
