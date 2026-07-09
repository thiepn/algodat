import {
  KnapsackTracingProblemSchema,
  type KnapsackTracingProblem,
  type TrainingRecommendation,
} from '../../content/schemas';
import type {
  CanonicalTraceStep,
  MasteryEvidenceAttempt,
  PreflightAnswers,
  RubricResult,
  TraceError,
  TraceScore,
  TraceSubmission,
  UserTraceRow,
} from './types';

const TOPIC_ID = 'topic-f5b57f47447c';
const MAX_POINTS = 12;

export function validateKnapsackProblem(input: unknown): KnapsackTracingProblem {
  const problem = KnapsackTracingProblemSchema.parse(input);
  const itemIds = new Set(problem.items.map((item) => item.id));
  if (itemIds.size !== problem.items.length) throw new Error('Objekt-IDs müssen eindeutig sein.');
  return problem;
}

export function computeKnapsackTrace(input: unknown): CanonicalTraceStep[] {
  const problem = validateKnapsackProblem(input);
  const initial: CanonicalTraceStep = {
    index: 0,
    itemId: null,
    values: Array.from({ length: problem.capacity + 1 }, () => 0),
    ties: [],
    decisions: Array.from({ length: problem.capacity + 1 }, (_, capacity) => ({
      capacity,
      excludeValue: 0,
      includeValue: null,
      value: 0,
      decision: 'exclude' as const,
      tie: false,
    })),
  };
  const trace = [initial];
  for (const [itemOffset, item] of problem.items.entries()) {
    const previous = trace[itemOffset];
    if (!previous) throw new Error('Kanonischer Vorgängerzustand fehlt.');
    const decisions = Array.from({ length: problem.capacity + 1 }, (_, capacity) => {
      const excludeValue = previous.values[capacity] ?? 0;
      const includeValue =
        item.weight <= capacity
          ? (previous.values[capacity - item.weight] ?? 0) + item.value
          : null;
      const tie = includeValue !== null && includeValue === excludeValue;
      const include = includeValue !== null && includeValue > excludeValue;
      return {
        capacity,
        excludeValue,
        includeValue,
        value: include ? includeValue : excludeValue,
        decision: include ? ('include' as const) : ('exclude' as const),
        tie,
      };
    });
    trace.push({
      index: itemOffset + 1,
      itemId: item.id,
      values: decisions.map((decision) => decision.value),
      ties: decisions.filter((decision) => decision.tie).map((decision) => decision.capacity),
      decisions,
    });
  }
  return trace;
}

function expectedFromUserPrevious(
  problem: KnapsackTracingProblem,
  previous: UserTraceRow,
  rowIndex: number,
  capacity: number,
): number | null {
  const item = problem.items[rowIndex - 1];
  const exclude = previous.values[capacity];
  if (!item || exclude === null || exclude === undefined) return null;
  if (item.weight > capacity) return exclude;
  const base = previous.values[capacity - item.weight];
  if (base === null || base === undefined) return null;
  return Math.max(exclude, base + item.value);
}

function ratio(points: number, total: number, maximum: number): number {
  return total === 0 ? 0 : (points / total) * maximum;
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function preflightScore(preflight: PreflightAnswers): number {
  const checks = [
    preflight.algorithm === 'knapsack_01',
    !preflight.negativeWeights,
    preflight.indexingStartsAtZero,
    preflight.usesPreviousRow,
    preflight.eachItemAtMostOnce,
    preflight.output === 'complete_table_and_optimum',
    preflight.runtime === 'O(n · W)',
  ];
  return ratio(checks.filter(Boolean).length, checks.length, 1);
}

function recommendationFor(errors: TraceError[], scoreRatio: number): TrainingRecommendation {
  if (errors.some((error) => error.errorCode === 'invalid_algorithm_choice'))
    return {
      code: 'read_foundations',
      label: 'Algorithmusgrundlagen lesen',
      reason: 'Der Aufgabentyp wurde nicht sicher erkannt.',
    };
  if (errors.some((error) => error.errorCode === 'runtime_error'))
    return {
      code: 'repeat_runtime',
      label: 'Laufzeit wiederholen',
      reason: 'Die pseudopolynomielle Laufzeit wurde verwechselt.',
    };
  if (errors.some((error) => error.errorCode === 'tie_breaker_error'))
    return {
      code: 'repeat_tie_breaker',
      label: 'Gleichstände wiederholen',
      reason: 'Die explizite Gleichstandsregel wurde nicht konsistent angewendet.',
    };
  if (errors.some((error) => error.errorCode === 'tracing_error'))
    return {
      code: 'repeat_recurrence',
      label: 'Rekurrenz wiederholen',
      reason: 'Mindestens ein Tabellenübergang war nicht konsistent.',
    };
  if (scoreRatio >= 0.9)
    return {
      code: 'learning_path_complete',
      label: 'Lernpfad abgeschlossen',
      reason: 'Trace und Verfahrensschritte sind belastbar.',
    };
  return {
    code: 'repeat_full_task',
    label: 'Aufgabe erneut vollständig bearbeiten',
    reason: 'Mehrere Teilkompetenzen benötigen weitere Evidenz.',
  };
}

export function scoreKnapsackTrace(problemInput: unknown, submission: TraceSubmission): TraceScore {
  const problem = validateKnapsackProblem(problemInput);
  const canonicalTrace = computeKnapsackTrace(problem);
  const rows = new Map(submission.rows.map((row) => [row.index, row]));
  const errors: TraceError[] = [];
  const addError = (error: TraceError) => errors.push(error);

  const preflightPoints = preflightScore(submission.preflight);
  if (submission.preflight.algorithm !== 'knapsack_01')
    addError({
      errorCode: 'invalid_algorithm_choice',
      step: null,
      evidence: 'Preflight: Algorithmus',
      expected: '0/1-Rucksack-DP',
      actual: submission.preflight.algorithm,
      explanation: 'Die Instanz verlangt 0/1-Rucksack-DP, nicht ein Greedy-Verfahren.',
      severity: 'schwer',
      topicId: TOPIC_ID,
      recommendedReview: 'Problemklasse und 0/1-Bedingung lesen.',
    });
  if (submission.preflight.runtime !== 'O(n · W)')
    addError({
      errorCode: 'runtime_error',
      step: null,
      evidence: 'Preflight: Laufzeit',
      expected: 'O(n · W)',
      actual: submission.preflight.runtime,
      explanation: 'Es werden n Zeilen mit W+1 Kapazitäten berechnet.',
      severity: 'mittel',
      topicId: TOPIC_ID,
      recommendedReview: 'Tabellendimensionen zählen.',
    });

  const initial = rows.get(0);
  const canonicalInitial = canonicalTrace[0];
  const initialCorrect = Boolean(
    initial &&
    canonicalInitial &&
    initial.values.length === canonicalInitial.values.length &&
    initial.values.every((value, index) => value === canonicalInitial.values[index]),
  );
  if (!initialCorrect)
    addError({
      errorCode: 'initialization_error',
      step: 0,
      evidence: 'Opt[0,w]',
      expected: canonicalInitial?.values ?? [],
      actual: initial?.values ?? null,
      explanation: 'Ohne Objekte ist für jede Kapazität nur Wert 0 erreichbar.',
      severity: 'schwer',
      topicId: TOPIC_ID,
      recommendedReview: 'Basisfall Opt[0,w] = 0 wiederholen.',
    });

  let canonicalCells = 0;
  let canonicalCorrect = 0;
  let methodCells = 0;
  let methodCorrect = 0;
  let tieCells = 0;
  let tieCorrect = 0;
  for (let rowIndex = 1; rowIndex < canonicalTrace.length; rowIndex += 1) {
    const expectedRow = canonicalTrace[rowIndex];
    const userRow = rows.get(rowIndex);
    const userPrevious = rows.get(rowIndex - 1);
    if (!expectedRow || !userRow) {
      addError({
        errorCode: 'incomplete_answer',
        step: rowIndex,
        evidence: `Opt[${rowIndex},*]`,
        expected: expectedRow?.values ?? [],
        actual: null,
        explanation: 'Eine vollständige Tabellenzeile fehlt.',
        severity: 'schwer',
        topicId: TOPIC_ID,
        recommendedReview: 'Fehlende Zeile vollständig nachtragen.',
      });
      canonicalCells += problem.capacity + 1;
      continue;
    }
    for (let capacity = 0; capacity <= problem.capacity; capacity += 1) {
      canonicalCells += 1;
      const actual = userRow.values[capacity];
      const expected = expectedRow.values[capacity];
      if (actual === expected) canonicalCorrect += 1;
      else if (actual !== null && actual !== undefined)
        addError({
          errorCode: 'tracing_error',
          step: rowIndex,
          evidence: `Opt[${rowIndex},${capacity}]`,
          expected,
          actual,
          explanation: 'Der Tabellenwert weicht vom kanonischen Trace ab.',
          severity: 'mittel',
          topicId: TOPIC_ID,
          recommendedReview: 'Exclude- und Include-Wert aus der vorherigen Zeile vergleichen.',
        });
      if (userPrevious) {
        const relativeExpected = expectedFromUserPrevious(
          problem,
          userPrevious,
          rowIndex,
          capacity,
        );
        if (relativeExpected !== null) {
          methodCells += 1;
          if (actual === relativeExpected) methodCorrect += 1;
        }
      }
    }
    for (const capacity of expectedRow.ties) {
      tieCells += 1;
      const key = `${rowIndex}:${capacity}`;
      if (userRow.tieChoices[key] === 'exclude') tieCorrect += 1;
      else
        addError({
          errorCode: 'tie_breaker_error',
          step: rowIndex,
          evidence: `Gleichstand bei Opt[${rowIndex},${capacity}]`,
          expected: 'exclude',
          actual: userRow.tieChoices[key] ?? null,
          explanation: 'Bei gleichem Wert wird das neue Objekt nicht aufgenommen.',
          severity: 'mittel',
          topicId: TOPIC_ID,
          recommendedReview: 'Gleichstandsregel der Instanz wiederholen.',
        });
    }
  }

  const finalExpected = canonicalTrace.at(-1)?.values[problem.capacity] ?? 0;
  const finalCorrect = submission.finalValue === finalExpected;
  if (!finalCorrect)
    addError({
      errorCode: submission.finalValue === null ? 'incomplete_answer' : 'tracing_error',
      step: canonicalTrace.length - 1,
      evidence: `Opt[n,${problem.capacity}]`,
      expected: finalExpected,
      actual: submission.finalValue,
      explanation: 'Der Endwert wird rechts unten aus der vollständigen Tabelle gelesen.',
      severity: 'schwer',
      topicId: TOPIC_ID,
      recommendedReview: 'Endzelle der Tabelle prüfen.',
    });

  const rubricResults: RubricResult[] = [
    {
      criterionId: 'preflight',
      label: 'Aufgabentyp und Voraussetzungen erkannt',
      points: rounded(preflightPoints),
      maxPoints: 1,
    },
    {
      criterionId: 'initialization',
      label: 'Nullzeile korrekt initialisiert',
      points: initialCorrect ? 1 : 0,
      maxPoints: 1,
    },
    {
      criterionId: 'canonical_rows',
      label: 'Kanonische Tabellenwerte',
      points: rounded(ratio(canonicalCorrect, canonicalCells, 6)),
      maxPoints: 6,
    },
    {
      criterionId: 'method_consistency',
      label: 'Verfahren relativ zum eigenen Zustand',
      points: rounded(ratio(methodCorrect, methodCells, 2)),
      maxPoints: 2,
    },
    {
      criterionId: 'tie_breaker',
      label: 'Gleichstandsregel',
      points: rounded(ratio(tieCorrect, tieCells, 1)),
      maxPoints: 1,
    },
    {
      criterionId: 'final_output',
      label: 'Endausgabe',
      points: finalCorrect ? 1 : 0,
      maxPoints: 1,
    },
  ];
  const rawPoints = rounded(rubricResults.reduce((sum, result) => sum + result.points, 0));
  const completenessCap = errors.some((error) => error.errorCode === 'incomplete_answer')
    ? MAX_POINTS * 0.8
    : MAX_POINTS;
  const revealCap = submission.solutionRevealed ? MAX_POINTS * 0.7 : MAX_POINTS;
  const points = rounded(Math.min(rawPoints, completenessCap, revealCap));
  return {
    points,
    maxPoints: MAX_POINTS,
    rawPoints,
    rubricResults,
    errors,
    recommendation: recommendationFor(errors, points / MAX_POINTS),
    canonicalTrace,
  };
}

export function serializeTrace(trace: CanonicalTraceStep[]): string {
  return JSON.stringify(trace);
}

export function parseRowInput(value: string, expectedLength: number): Array<number | null> {
  const cells = value.split(/[;,\s]+/u).filter(Boolean);
  return Array.from({ length: expectedLength }, (_, index) => {
    const cell = cells[index];
    if (cell === undefined || !/^\d+$/u.test(cell)) return null;
    return Number(cell);
  });
}

export function canonicalRowsAsInput(problem: KnapsackTracingProblem): UserTraceRow[] {
  return computeKnapsackTrace(problem).map((step) => ({
    index: step.index,
    values: [...step.values],
    tieChoices: Object.fromEntries(
      step.ties.map((capacity) => [`${step.index}:${capacity}`, 'exclude' as const]),
    ),
  }));
}

export function deriveMastery(attempts: MasteryEvidenceAttempt[]) {
  const relevant = attempts.filter((attempt) => attempt.maxScore > 0);
  const criterion = (attempt: MasteryEvidenceAttempt, id: string) => {
    const result = attempt.rubricResults.find((entry) => entry.criterionId === id);
    return result && result.maxPoints > 0 ? result.points / result.maxPoints : 0;
  };
  const modeWeight = { practice: 0.7, exam: 1, review: 0.8 } as const;
  const weighted = (selector: (attempt: MasteryEvidenceAttempt) => number) => {
    let numerator = 0;
    let denominator = 0;
    for (const attempt of relevant) {
      const disclosure = attempt.solutionRevealed
        ? 0.55
        : Math.max(0.75, 1 - attempt.hintsUsed.length * 0.08);
      const weight = modeWeight[attempt.mode] * disclosure;
      numerator += selector(attempt) * weight;
      denominator += weight;
    }
    const evidenceLimit = Math.min(0.9, 0.4 + relevant.length * 0.15);
    return rounded((denominator ? numerator / denominator : 0) * evidenceLimit);
  };
  const dimensions = {
    recognition: weighted((attempt) => criterion(attempt, 'preflight')),
    tracing: weighted((attempt) => attempt.score / attempt.maxScore),
    tie_breaking: weighted((attempt) => criterion(attempt, 'tie_breaker')),
    correctness_understanding: weighted((attempt) => criterion(attempt, 'method_consistency')),
    runtime_knowledge: weighted((attempt) => criterion(attempt, 'preflight')),
    timed_performance: weighted((attempt) =>
      attempt.mode === 'exam'
        ? Math.min(
            1,
            (attempt.score / attempt.maxScore) * (attempt.durationMs <= 12 * 60_000 ? 1 : 0.8),
          )
        : 0,
    ),
  };
  const allErrors = relevant.flatMap((attempt) =>
    attempt.errorCodes.map((errorCode) => ({ errorCode })),
  ) as Array<{ errorCode: TraceError['errorCode'] }>;
  const syntheticErrors: TraceError[] = allErrors.map(({ errorCode }) => ({
    errorCode,
    step: null,
    evidence: 'gespeicherter Versuch',
    expected: null,
    actual: null,
    explanation: 'Aus Versuch übernommen.',
    severity: 'mittel',
    topicId: TOPIC_ID,
    recommendedReview: 'Gezielt wiederholen.',
  }));
  return {
    dimensions,
    evidenceAttemptIds: relevant.map((attempt) => attempt.id),
    contentVersions: [...new Set(relevant.map((attempt) => attempt.contentVersion))],
    recommendation: recommendationFor(syntheticErrors, dimensions.tracing),
  };
}
