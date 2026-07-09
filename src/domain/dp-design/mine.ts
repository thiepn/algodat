import type {
  CanonicalDpDesignSolution,
  DpDesignAnswer,
  DpDesignError,
  DpDesignErrorCode,
  DpDesignEvaluation,
  DpDesignMastery,
  DpDesignMode,
  MineProblemInstance,
} from './types';

const topicId = 'topic-99af8a8bfb20';

export function createMineProblemInstance(): MineProblemInstance {
  return {
    id: 'problem-dp-entwurf-mine-v1',
    matrix: [
      [5, 6, 12, 9, 43],
      [44, 16, 55, 8, 1],
      [101, 12, 106, 18, 2],
      [17, 19, 22, 41, 6],
    ],
    rowCount: 4,
    columnCount: 5,
    sourceRefs: [
      { sourceId: 'src-8f16b2505bbd', page: 10, label: 'Probeklausur Aufgabe 8' },
      {
        sourceId: 'src-35405e721f05',
        page: 11,
        label: 'Beispiellösung Aufgabe 8, Rekurrenz',
      },
      {
        sourceId: 'src-35405e721f05',
        page: 12,
        label: 'Beispiellösung Aufgabe 8, Beweis und Algorithmus',
      },
    ],
  };
}

export function solveMineDp(matrix: number[][]): {
  table: number[][];
  optimalValue: number;
  path: Array<{ row: number; column: number; value: number }>;
} {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  const table = matrix.map((row) => row.map(() => 0));
  if (rows === 0 || columns === 0) return { table, optimalValue: 0, path: [] };
  for (let j = 0; j < columns; j += 1) table[0]![j] = matrix[0]?.[j] ?? 0;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 0; j < columns; j += 1) {
      const predecessors = [table[i - 1]?.[j], table[i - 1]?.[j - 1], table[i - 1]?.[j + 1]].filter(
        (value): value is number => typeof value === 'number',
      );
      table[i]![j] = (matrix[i]?.[j] ?? 0) + Math.max(...predecessors);
    }
  }
  const lastRow = table.at(-1) ?? [];
  const optimalValue = Math.max(...lastRow);
  let column = lastRow.indexOf(optimalValue);
  const path: Array<{ row: number; column: number; value: number }> = [];
  for (let i = rows - 1; i >= 0; i -= 1) {
    path.unshift({ row: i + 1, column: column + 1, value: matrix[i]?.[column] ?? 0 });
    if (i === 0) break;
    const options = [column, column - 1, column + 1]
      .filter((candidate) => candidate >= 0 && candidate < columns)
      .map((candidate) => ({ column: candidate, value: table[i - 1]?.[candidate] ?? -Infinity }))
      .sort((left, right) => right.value - left.value || left.column - right.column);
    column = options[0]?.column ?? column;
  }
  return { table, optimalValue, path };
}

export function bruteForceMine(matrix: number[][]): number {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  const search = (row: number, column: number): number => {
    const value = matrix[row]?.[column] ?? -Infinity;
    if (row === rows - 1) return value;
    const next = [column - 1, column, column + 1].filter(
      (candidate) => candidate >= 0 && candidate < columns,
    );
    return value + Math.max(...next.map((candidate) => search(row + 1, candidate)));
  };
  return Math.max(...Array.from({ length: columns }, (_, column) => search(0, column)));
}

export function canonicalMineDesignAnswer(): CanonicalDpDesignSolution {
  const problem = createMineProblemInstance();
  const solved = solveMineDp(problem.matrix);
  return {
    kind: 'dp_design_mine',
    trainerKind: 'design',
    problemId: problem.id,
    canonicalSolutionVersion: 'canonical-dp-mine-v1',
    optimalValue: solved.optimalValue,
    optimalPath: solved.path,
    dpTable: solved.table,
    interpretation: {
      inputObjects: 'Matrix A mit k Zeilen und l Spalten natürlicher Erzwerte',
      objective: 'maximiere die Summe des gesammelten Erzes auf einem gültigen Weg',
      constraints:
        'Start in Zeile 1; pro Schritt eine Zeile tiefer; Spalte bleibt gleich oder ändert sich um 1; keine Seitenüberschreitung',
      output: 'maximal erreichbare Erzmenge in der unteren Zeile',
    },
    state: {
      tableName: 'G',
      dimensions: 'zwei Dimensionen i und j',
      rowRange: '1<=i<=k',
      columnRange: '1<=j<=l',
      entryMeaning:
        'G(i,j) ist die maximale Erzmenge auf einem gültigen Weg, der in der ersten Reihe beginnt und in a_ij endet',
      optimizationDirection: 'Maximum',
    },
    recurrence: {
      baseCase: 'G(1,j)=a_1j für 1<=j<=l',
      leftBoundary: 'G(i,1)=a_i1+max{G(i-1,1),G(i-1,2)} für i>1',
      rightBoundary: 'G(i,l)=a_il+max{G(i-1,l),G(i-1,l-1)} für i>1',
      innerCase: 'G(i,j)=a_ij+max{G(i-1,j),G(i-1,j-1),G(i-1,j+1)} für i>1 und 1<j<l',
      invalidStates: 'Zustände mit j<1 oder j>l sind unzulässig und werden nicht gelesen',
    },
    evaluation: {
      dependencyDirection: 'jeder Zustand hängt nur von der vorherigen Zeile i-1 ab',
      order: 'zeilenweise von i=1 bis k, innerhalb einer Zeile von j=1 bis l',
      outputCell: 'max_{1<=j<=l} G(k,j)',
    },
    algorithm: {
      allocation: 'G = neues Array[k][l]',
      initialization: 'für j=1 bis l: G[1][j]=A[1][j]',
      loops: 'für i=2 bis k: berechne linken Rand, innere Spalten und rechten Rand aus Zeile i-1',
      returnStatement: 'return max_{1<=j<=l} G[k][j]',
    },
    proof: {
      claim:
        'Für alle i,j enthält G(i,j) die maximale Erzmenge eines gültigen Weges von Zeile 1 nach a_ij',
      baseCase: 'Für i=1 besteht der Weg nur aus a_1j, daher gilt G(1,j)=a_1j',
      inductionHypothesis: 'Für Zeile i sind alle Werte G(i,j) korrekt',
      inductionStep:
        'Für Position (i+1,j) sind genau die zulässigen Vorgänger (i,j), (i,j-1), (i,j+1) möglich; das Maximum wählt den besten korrekten Vorgänger',
      conclusion: 'Damit ist die Rekurrenz korrekt; die beste Endposition ist max_j G(k,j)',
    },
    complexity: {
      states: 'k*l Zustände',
      transitionCost: 'O(1) pro Zustand',
      runtime: 'O(k*l)',
      memory: 'O(k*l)',
    },
  };
}

export function emptyMineDesignAnswer(): DpDesignAnswer {
  const canonical = canonicalMineDesignAnswer();
  return {
    ...canonical,
    interpretation: Object.fromEntries(
      Object.keys(canonical.interpretation).map((key) => [key, '']),
    ) as DpDesignAnswer['interpretation'],
    state: Object.fromEntries(
      Object.keys(canonical.state).map((key) => [key, '']),
    ) as DpDesignAnswer['state'],
    recurrence: Object.fromEntries(
      Object.keys(canonical.recurrence).map((key) => [key, '']),
    ) as DpDesignAnswer['recurrence'],
    evaluation: Object.fromEntries(
      Object.keys(canonical.evaluation).map((key) => [key, '']),
    ) as DpDesignAnswer['evaluation'],
    algorithm: Object.fromEntries(
      Object.keys(canonical.algorithm).map((key) => [key, '']),
    ) as DpDesignAnswer['algorithm'],
    proof: Object.fromEntries(
      Object.keys(canonical.proof).map((key) => [key, '']),
    ) as DpDesignAnswer['proof'],
    complexity: Object.fromEntries(
      Object.keys(canonical.complexity).map((key) => [key, '']),
    ) as DpDesignAnswer['complexity'],
  };
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('de')
    .replaceAll(/\s+/gu, '')
    .replaceAll('ℓ', 'l')
    .replaceAll('<=', '≤')
    .replaceAll(' ', '');
}

function dpError(
  errorCode: DpDesignErrorCode,
  section: keyof DpDesignAnswer,
  criterionId: string,
  actual: unknown,
  expected: unknown,
  explanation: string,
): DpDesignError {
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
    recommendedReview: 'DP-Zustand, Rekurrenz und Bottom-up-Ordnung gezielt wiederholen.',
    step: null,
  };
}

function check(
  errors: DpDesignError[],
  section: keyof DpDesignAnswer,
  criterionId: string,
  code: DpDesignErrorCode,
  actual: string,
  expected: string,
) {
  if (normalize(actual) === normalize(expected)) return;
  errors.push(
    dpError(
      code,
      section,
      criterionId,
      actual,
      expected,
      'Die strukturierte Eingabe weicht vom belegten kanonischen Baustein ab.',
    ),
  );
}

export function evaluateMineDesign(
  answer: DpDesignAnswer,
  options: { mode: DpDesignMode; hintsUsed: string[]; solutionRevealed: boolean },
): DpDesignEvaluation {
  const canonical = canonicalMineDesignAnswer();
  const errors: DpDesignError[] = [];
  for (const [field, expected] of Object.entries(canonical.interpretation))
    check(
      errors,
      'interpretation',
      'interpretation',
      'dp_interpretation_error',
      answer.interpretation[field as keyof DpDesignAnswer['interpretation']],
      expected,
    );
  check(
    errors,
    'state',
    'state_dimensions',
    'dp_state_dimension_error',
    answer.state.dimensions,
    canonical.state.dimensions,
  );
  check(
    errors,
    'state',
    'state_ranges',
    'dp_state_dimension_error',
    answer.state.rowRange,
    canonical.state.rowRange,
  );
  check(
    errors,
    'state',
    'state_ranges',
    'dp_state_dimension_error',
    answer.state.columnRange,
    canonical.state.columnRange,
  );
  check(
    errors,
    'state',
    'state_meaning',
    'dp_state_meaning_error',
    answer.state.entryMeaning,
    canonical.state.entryMeaning,
  );
  check(
    errors,
    'recurrence',
    'base_cases',
    'dp_base_case_error',
    answer.recurrence.baseCase,
    canonical.recurrence.baseCase,
  );
  check(
    errors,
    'recurrence',
    'boundary_cases',
    'dp_transition_boundary_error',
    answer.recurrence.leftBoundary,
    canonical.recurrence.leftBoundary,
  );
  check(
    errors,
    'recurrence',
    'boundary_cases',
    'dp_transition_boundary_error',
    answer.recurrence.rightBoundary,
    canonical.recurrence.rightBoundary,
  );
  check(
    errors,
    'recurrence',
    'inner_case',
    'dp_transition_inner_error',
    answer.recurrence.innerCase,
    canonical.recurrence.innerCase,
  );
  check(
    errors,
    'recurrence',
    'invalid_states',
    'dp_invalid_state_error',
    answer.recurrence.invalidStates,
    canonical.recurrence.invalidStates,
  );
  check(
    errors,
    'evaluation',
    'dependencies',
    'dp_order_error',
    answer.evaluation.dependencyDirection,
    canonical.evaluation.dependencyDirection,
  );
  check(
    errors,
    'evaluation',
    'order',
    'dp_order_error',
    answer.evaluation.order,
    canonical.evaluation.order,
  );
  check(
    errors,
    'evaluation',
    'output',
    'dp_output_cell_error',
    answer.evaluation.outputCell,
    canonical.evaluation.outputCell,
  );
  for (const [field, expected] of Object.entries(canonical.algorithm))
    check(
      errors,
      'algorithm',
      'algorithm',
      'dp_algorithm_error',
      answer.algorithm[field as keyof DpDesignAnswer['algorithm']],
      expected,
    );
  for (const [field, expected] of Object.entries(canonical.proof))
    check(
      errors,
      'proof',
      'proof',
      'dp_proof_error',
      answer.proof[field as keyof DpDesignAnswer['proof']],
      expected,
    );
  check(
    errors,
    'complexity',
    'runtime',
    'dp_runtime_error',
    answer.complexity.runtime,
    canonical.complexity.runtime,
  );
  check(
    errors,
    'complexity',
    'memory',
    'dp_memory_error',
    answer.complexity.memory,
    canonical.complexity.memory,
  );
  const rubric = scoreRubric(errors);
  let points = rubric.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  if (options.solutionRevealed) points = Math.min(points, 16);
  if (options.hintsUsed.length > 0) points = Math.min(points, 28);
  return {
    points,
    maxPoints,
    examPoints: Math.round((points / maxPoints) * 8 * 10) / 10,
    rubricResults: rubric,
    errors,
    recommendation: recommendMineReview(points, maxPoints, errors),
    canonicalSolution: canonical,
  };
}

function scoreRubric(errors: DpDesignError[]) {
  const has = (criterionId: string) => errors.some((error) => error.criterionId === criterionId);
  return [
    {
      criterionId: 'interpretation',
      label: 'Problem und Ziel verstanden',
      points: has('interpretation') ? 1 : 4,
      maxPoints: 4,
    },
    {
      criterionId: 'state_dimensions',
      label: 'Zustandsdimensionen',
      points: has('state_dimensions') ? 1 : 4,
      maxPoints: 4,
    },
    {
      criterionId: 'state_meaning',
      label: 'Zustandsbedeutung',
      points: has('state_meaning') ? 1 : 5,
      maxPoints: 5,
    },
    {
      criterionId: 'base_cases',
      label: 'Basisfälle',
      points: has('base_cases') ? 0 : 4,
      maxPoints: 4,
    },
    {
      criterionId: 'boundary_cases',
      label: 'Randfälle',
      points: has('boundary_cases') ? 1 : 5,
      maxPoints: 5,
    },
    {
      criterionId: 'inner_case',
      label: 'Innerer Rekurrenzfall',
      points: has('inner_case') ? 1 : 5,
      maxPoints: 5,
    },
    {
      criterionId: 'invalid_states',
      label: 'Unzulässige Zustände',
      points: has('invalid_states') ? 0 : 2,
      maxPoints: 2,
    },
    {
      criterionId: 'order',
      label: 'Bottom-up-Reihenfolge',
      points: has('order') ? 1 : 4,
      maxPoints: 4,
    },
    { criterionId: 'output', label: 'Ausgabezelle', points: has('output') ? 0 : 3, maxPoints: 3 },
    {
      criterionId: 'algorithm',
      label: 'Iterativer Algorithmus',
      points: has('algorithm') ? 2 : 6,
      maxPoints: 6,
    },
    {
      criterionId: 'proof',
      label: 'Korrektheitsbeweis',
      points: has('proof') ? 2 : 6,
      maxPoints: 6,
    },
    { criterionId: 'runtime', label: 'Laufzeit', points: has('runtime') ? 0 : 3, maxPoints: 3 },
    { criterionId: 'memory', label: 'Speicherbedarf', points: has('memory') ? 0 : 3, maxPoints: 3 },
  ];
}

export function recommendMineReview(points: number, maxPoints: number, errors: DpDesignError[]) {
  const first = errors[0]?.errorCode;
  if (!first && points === maxPoints)
    return {
      code: 'learning_path_complete' as const,
      label: 'DP-Entwurf im Prüfungsmodus wiederholen',
      reason: 'Zustand, Rekurrenz, Algorithmus und Beweis sind vollständig korrekt.',
    };
  if (first?.includes('state'))
    return {
      code: 'repeat_dp_state_definition' as const,
      label: 'Zustandsdefinition wiederholen',
      reason: 'Der erste zentrale Fehler liegt beim DP-Zustand.',
    };
  if (first?.includes('transition') || first === 'dp_base_case_error')
    return {
      code: 'repeat_dp_recurrence' as const,
      label: 'Rekurrenzfälle wiederholen',
      reason: 'Basis- oder Übergangsfälle müssen gezielt nachgearbeitet werden.',
    };
  return {
    code: 'repeat_dp_design_full' as const,
    label: 'vollständigen DP-Entwurf wiederholen',
    reason: 'Mehrere Entwurfsbausteine sind noch nicht stabil.',
  };
}

export function deriveDpDesignMastery(
  attempts: Array<{
    id: string;
    mode: DpDesignMode;
    score: number;
    maxScore: number;
    errorCodes: string[];
    hintsUsed: string[];
    solutionRevealed: boolean;
  }>,
): DpDesignMastery {
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
      problem_interpretation: clamp(base * (has('dp_interpretation_error') ? 0.5 : 1)),
      state_definition: clamp(base * (has('dp_state_dimension_error') ? 0.5 : 1)),
      recurrence_design: clamp(base * (has('dp_transition_inner_error') ? 0.5 : 1)),
      evaluation_order: clamp(base * (has('dp_order_error') ? 0.6 : 1)),
      algorithm_construction: clamp(base * (has('dp_algorithm_error') ? 0.55 : 1)),
      correctness_proof: clamp(base * (has('dp_proof_error') ? 0.5 : 1)),
      complexity_analysis: clamp(base * (has('dp_runtime_error') ? 0.6 : 1)),
    },
  };
}

export function canonicalMineDesignText(): string[] {
  const c = canonicalMineDesignAnswer();
  return [
    `Zustand: ${c.state.entryMeaning}.`,
    `Basis: ${c.recurrence.baseCase}.`,
    `Rand links: ${c.recurrence.leftBoundary}.`,
    `Rand rechts: ${c.recurrence.rightBoundary}.`,
    `Innen: ${c.recurrence.innerCase}.`,
    `Auswertung: ${c.evaluation.order}; Ausgabe ${c.evaluation.outputCell}.`,
    `Laufzeit ${c.complexity.runtime}, Speicher ${c.complexity.memory}.`,
  ];
}
