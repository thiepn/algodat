import type { GraphTracingProblem } from '../../content/schemas';
import {
  dijkstraDistanceTableToInput,
  dijkstraMarkedOrder,
  dijkstraPredecessorTableToInput,
  dijkstraRelaxationLog,
} from './dijkstra';
import {
  cellCount,
  countMatchingCells,
  matricesEqual,
  matrixToInput,
  solveFloydWarshall,
} from './floyd-warshall';
import {
  enumerateMsts,
  parseUndirectedEdgeList,
  primKeyTableToInput,
  primParentTableToInput,
  primSelectedEdges,
  primSelectedVertices,
  primTotalWeight,
  validateSpanningTree,
} from './mst';
import { normalizeVertexOrder, parseMatrixInput, textContainsAll } from './parser';
import type {
  DijkstraAnswer,
  FloydWarshallAnswer,
  FloydWarshallAnswerField,
  GraphRubricResult,
  GraphTracingError,
  GraphTracingEvaluation,
  GraphTracingMastery,
  PrimAnswer,
} from './types';

const topicId = 'topic-1fa208a0ed89';

const matrixFields: Array<{
  field: FloydWarshallAnswerField;
  criterionId: string;
  label: string;
  maxPoints: number;
  step: number;
}> = [
  {
    field: 'd0',
    criterionId: 'initial-matrix',
    label: 'Initialmatrix D(0)',
    maxPoints: 6,
    step: 0,
  },
  { field: 'd1', criterionId: 'iteration-d1', label: 'Iteration D(1)', maxPoints: 5, step: 1 },
  { field: 'd2', criterionId: 'iteration-d2', label: 'Iteration D(2)', maxPoints: 5, step: 2 },
  { field: 'd3', criterionId: 'iteration-d3', label: 'Iteration D(3)', maxPoints: 5, step: 3 },
  { field: 'd4', criterionId: 'iteration-d4', label: 'Iteration D(4)', maxPoints: 5, step: 4 },
];

function rubric(
  criterionId: string,
  label: string,
  maxPoints: number,
  points: number,
): GraphRubricResult {
  return { criterionId, label, maxPoints, points };
}

function error(
  errorCode: GraphTracingError['errorCode'],
  section: FloydWarshallAnswerField,
  evidence: string,
  explanation: string,
  expected: unknown,
  actual: unknown,
  step: number | null = null,
): GraphTracingError {
  return {
    errorCode,
    section,
    evidence,
    expected,
    actual,
    step,
    severity: errorCode === 'fw_matrix_parse_error' ? 'schwer' : 'mittel',
    topicId,
    explanation,
    recommendedReview:
      'Floyd-Warshall-Matrixfolge mit Initialisierung, Zwischenknotenreihenfolge und Rekurrenz erneut aktiv bearbeiten.',
  };
}

export function emptyFloydWarshallAnswer(): FloydWarshallAnswer {
  return {
    vertexOrder: '',
    d0: '',
    d1: '',
    d2: '',
    d3: '',
    d4: '',
    recurrence: '',
    runtime: '',
    explanation: '',
  };
}

export function emptyDijkstraAnswer(): DijkstraAnswer {
  return {
    startVertex: '',
    markedOrder: '',
    distanceTable: '',
    predecessorTable: '',
    relaxationLog: '',
    runtime: '',
    explanation: '',
  };
}

export function emptyPrimAnswer(): PrimAnswer {
  return {
    startVertex: '',
    selectedVertices: '',
    selectedEdges: '',
    keyTable: '',
    parentTable: '',
    totalWeight: '',
    safeEdgeExplanation: '',
    runtime: '',
  };
}

export function emptyGraphTracingAnswer(problem?: GraphTracingProblem) {
  if (problem?.algorithm === 'dijkstra') return emptyDijkstraAnswer();
  if (problem?.algorithm === 'prim') return emptyPrimAnswer();
  return emptyFloydWarshallAnswer();
}

export function canonicalFloydWarshallAnswer(problem: GraphTracingProblem): FloydWarshallAnswer {
  if (problem.algorithm !== 'floyd_warshall') throw new Error('Floyd-Warshall-Problem erwartet.');
  return { ...problem.canonicalSolution.structuredAnswer };
}

export function canonicalDijkstraAnswer(problem: GraphTracingProblem): DijkstraAnswer {
  if (problem.algorithm !== 'dijkstra') throw new Error('Dijkstra-Problem erwartet.');
  return { ...problem.canonicalSolution.structuredAnswer };
}

export function canonicalPrimAnswer(problem: GraphTracingProblem): PrimAnswer {
  if (problem.algorithm !== 'prim') throw new Error('Prim-Problem erwartet.');
  return { ...problem.canonicalSolution.structuredAnswer };
}

export function canonicalGraphTracingAnswer(problem: GraphTracingProblem) {
  if (problem.algorithm === 'dijkstra') return canonicalDijkstraAnswer(problem);
  if (problem.algorithm === 'prim') return canonicalPrimAnswer(problem);
  return canonicalFloydWarshallAnswer(problem);
}

export function evaluateFloydWarshallAnswer(
  problem: GraphTracingProblem,
  answer: FloydWarshallAnswer,
): GraphTracingEvaluation {
  if (problem.algorithm !== 'floyd_warshall') throw new Error('Floyd-Warshall-Problem erwartet.');
  const canonical = canonicalFloydWarshallAnswer(problem);
  const oracle = solveFloydWarshall(problem);
  const errors: GraphTracingError[] = [];
  const rubricResults: GraphRubricResult[] = [];

  const order = normalizeVertexOrder(answer.vertexOrder);
  const orderOk =
    order.length === problem.vertexOrder.length &&
    order.every((vertex, index) => vertex === problem.vertexOrder[index]);
  rubricResults.push(rubric('vertex-order', 'Knotenreihenfolge', 4, orderOk ? 4 : 0));
  if (!orderOk)
    errors.push(
      error(
        'fw_vertex_order_wrong',
        'vertexOrder',
        answer.vertexOrder,
        'Die Zwischenknotenreihenfolge muss exakt A, B, C, D sein.',
        problem.vertexOrder,
        order,
      ),
    );

  for (const entry of matrixFields) {
    const expected = oracle[entry.step]?.matrix ?? [];
    let points = 0;
    try {
      const actual = parseMatrixInput(String(answer[entry.field]), problem.vertexOrder.length);
      const total = cellCount(expected);
      const matches = countMatchingCells(actual, expected);
      points = matricesEqual(actual, expected)
        ? entry.maxPoints
        : Math.floor((matches / total) * entry.maxPoints);
      if (points !== entry.maxPoints)
        errors.push(
          error(
            entry.step === 0 ? 'fw_initial_matrix_wrong' : 'fw_iteration_matrix_wrong',
            entry.field,
            String(answer[entry.field]),
            `${entry.label} weicht von der Oracle-Matrix ab.`,
            expected,
            actual,
            entry.step,
          ),
        );
    } catch (cause) {
      errors.push(
        error(
          'fw_matrix_parse_error',
          entry.field,
          String(answer[entry.field]),
          cause instanceof Error ? cause.message : 'Die Matrix konnte nicht gelesen werden.',
          matrixToInput(expected),
          answer[entry.field],
          entry.step,
        ),
      );
    }
    rubricResults.push(rubric(entry.criterionId, entry.label, entry.maxPoints, points));
  }

  const recurrenceOk = textContainsAll(answer.recurrence, ['min', 'd', 'k']);
  rubricResults.push(rubric('recurrence', 'Rekurrenznotation', 5, recurrenceOk ? 5 : 0));
  if (!recurrenceOk)
    errors.push(
      error(
        'fw_recurrence_missing',
        'recurrence',
        answer.recurrence,
        'Die Floyd-Warshall-Rekurrenz muss min und den Zwischenknoten k enthalten.',
        problem.recurrence,
        answer.recurrence,
      ),
    );

  const runtimeOk =
    textContainsAll(answer.runtime, ['o(n^3)']) || textContainsAll(answer.runtime, ['o(n³)']);
  const explanationOk = textContainsAll(answer.explanation, ['zwischenknoten']);
  const runtimePoints = (runtimeOk ? 3 : 0) + (explanationOk ? 2 : 0);
  rubricResults.push(rubric('runtime', 'Laufzeit und Begründung', 5, runtimePoints));
  if (!runtimeOk)
    errors.push(
      error(
        'fw_runtime_wrong',
        'runtime',
        answer.runtime,
        'Die Laufzeit muss O(n^3) sein.',
        problem.runtime,
        answer.runtime,
      ),
    );
  if (!explanationOk)
    errors.push(
      error(
        'fw_explanation_missing',
        'explanation',
        answer.explanation,
        'Die Begründung muss die erlaubten Zwischenknoten pro Iteration erklären.',
        canonical.explanation,
        answer.explanation,
      ),
    );

  const points = rubricResults.reduce((sum, item) => sum + item.points, 0);
  return {
    points,
    maxPoints: 40,
    rubricResults,
    errors,
    canonicalSolution: canonical,
    recommendation:
      points >= 34
        ? 'Floyd-Warshall-Matrixtracing ist stabil genug für den Simulator.'
        : 'Wiederhole Initialmatrix, Iterationsreihenfolge und ∞-Einträge im Übungsmodus.',
  };
}

function normalize(input: string): string {
  return input
    .toLocaleLowerCase('de')
    .replace(/∞/gu, 'inf')
    .replace(/âˆž/gu, 'inf')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeList(input: string): string[] {
  return input
    .split(/[,\s;>→-]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function containsRelaxationEvidence(input: string, expected: string): boolean {
  const normalizedInput = normalize(input);
  return expected
    .split('\n')
    .flatMap((line) => line.split(';'))
    .map((entry) => normalize(entry))
    .filter((entry) => /->/u.test(entry) && !entry.includes('keine'))
    .every((entry) => normalizedInput.includes(entry.split(':')[0]!.trim()));
}

export function evaluateDijkstraAnswer(
  problem: GraphTracingProblem,
  answer: DijkstraAnswer,
): GraphTracingEvaluation {
  if (problem.algorithm !== 'dijkstra') throw new Error('Dijkstra-Problem erwartet.');
  const canonical = canonicalDijkstraAnswer(problem);
  const errors: GraphTracingError[] = [];
  const rubricResults: GraphRubricResult[] = [];
  const addError = (
    errorCode: GraphTracingError['errorCode'],
    section: keyof DijkstraAnswer,
    evidence: string,
    explanation: string,
    expected: unknown,
    actual: unknown,
  ) =>
    errors.push({
      errorCode,
      section,
      evidence,
      expected,
      actual,
      step: null,
      severity: 'mittel',
      topicId,
      explanation,
      recommendedReview:
        'Dijkstra-Tracing mit ExtractMin, Relaxation, Vorgängern und Laufzeit erneut aktiv bearbeiten.',
    });

  const startOk = answer.startVertex.trim() === problem.startVertex;
  rubricResults.push(rubric('start-vertex', 'Startknoten', 4, startOk ? 4 : 0));
  if (!startOk)
    addError(
      'dijkstra_start_wrong',
      'startVertex',
      answer.startVertex,
      'Der Startknoten muss exakt aus der Aufgabe übernommen werden.',
      problem.startVertex,
      answer.startVertex,
    );

  const marked = normalizeList(answer.markedOrder);
  const expectedMarked = normalizeList(canonical.markedOrder);
  const markedMatches = marked.filter((vertex, index) => vertex === expectedMarked[index]).length;
  const markedPoints =
    markedMatches === expectedMarked.length ? 8 : Math.floor(markedMatches * 1.5);
  rubricResults.push(rubric('marked-order', 'Markierungsreihenfolge', 8, markedPoints));
  if (markedPoints < 8)
    addError(
      'dijkstra_marked_order_wrong',
      'markedOrder',
      answer.markedOrder,
      'ExtractMin muss die Knoten in der kanonischen Reihenfolge markieren.',
      canonical.markedOrder,
      answer.markedOrder,
    );

  const distanceOk = normalize(answer.distanceTable) === normalize(canonical.distanceTable);
  rubricResults.push(rubric('distance-table', 'Distanztabelle', 10, distanceOk ? 10 : 0));
  if (!distanceOk)
    addError(
      'dijkstra_distance_table_wrong',
      'distanceTable',
      answer.distanceTable,
      'Die Distanzzeilen müssen nach jedem Durchlauf mit dem Oracle übereinstimmen.',
      canonical.distanceTable,
      answer.distanceTable,
    );

  const predecessorOk =
    normalize(answer.predecessorTable) === normalize(canonical.predecessorTable);
  rubricResults.push(rubric('predecessor-table', 'Vorgängertabelle', 8, predecessorOk ? 8 : 0));
  if (!predecessorOk)
    addError(
      'dijkstra_predecessor_table_wrong',
      'predecessorTable',
      answer.predecessorTable,
      'Die Vorgänger p[v] müssen bei jeder strikten Verbesserung aktualisiert werden.',
      canonical.predecessorTable,
      answer.predecessorTable,
    );

  const relaxationOk = containsRelaxationEvidence(answer.relaxationLog, canonical.relaxationLog);
  rubricResults.push(rubric('relaxations', 'Relaxationslog', 5, relaxationOk ? 5 : 0));
  if (!relaxationOk)
    addError(
      'dijkstra_relaxation_log_incomplete',
      'relaxationLog',
      answer.relaxationLog,
      'Das Relaxationslog muss die verbesserten Kanten nennen.',
      canonical.relaxationLog,
      answer.relaxationLog,
    );

  const runtimeOk =
    textContainsAll(answer.runtime, ['o((|v|+|e|)', 'log']) ||
    textContainsAll(answer.runtime, ['o((v+e)', 'log']);
  const explanationOk =
    textContainsAll(answer.explanation, ['extractmin']) ||
    textContainsAll(answer.explanation, ['schwarz']);
  rubricResults.push(
    rubric('runtime', 'Laufzeit und Begründung', 5, (runtimeOk ? 3 : 0) + (explanationOk ? 2 : 0)),
  );
  if (!runtimeOk)
    addError(
      'dijkstra_runtime_wrong',
      'runtime',
      answer.runtime,
      'Die Vorlesungslaufzeit mit Prioritätenschlange ist O((|V|+|E|) log |V|).',
      problem.runtime,
      answer.runtime,
    );
  if (!explanationOk)
    addError(
      'dijkstra_explanation_missing',
      'explanation',
      answer.explanation,
      'Die Begründung muss die ExtractMin-/Schwarzfärbe-Semantik erklären.',
      canonical.explanation,
      answer.explanation,
    );

  const points = rubricResults.reduce((sum, item) => sum + item.points, 0);
  return {
    points,
    maxPoints: 40,
    rubricResults,
    errors,
    canonicalSolution: canonical,
    recommendation:
      points >= 34
        ? 'Dijkstra-Tracing ist stabil genug für den Simulator.'
        : 'Wiederhole Startknoten, ExtractMin-Reihenfolge, Relaxationen und Vorgänger im Übungsmodus.',
  };
}

function numericWeight(input: string): number | null {
  const match = input.replace(',', '.').match(/-?\d+(?:\.\d+)?/u);
  return match ? Number(match[0]) : null;
}

export function evaluatePrimAnswer(
  problem: GraphTracingProblem,
  answer: PrimAnswer,
): GraphTracingEvaluation {
  if (problem.algorithm !== 'prim') throw new Error('Prim-Problem erwartet.');
  const canonical = canonicalPrimAnswer(problem);
  const errors: GraphTracingError[] = [];
  const rubricResults: GraphRubricResult[] = [];
  const addError = (
    errorCode: GraphTracingError['errorCode'],
    section: keyof PrimAnswer,
    evidence: string,
    explanation: string,
    expected: unknown,
    actual: unknown,
    step: number | null = null,
  ) =>
    errors.push({
      errorCode,
      section,
      evidence,
      expected,
      actual,
      step,
      severity: errorCode === 'prim_not_a_spanning_tree' ? 'schwer' : 'mittel',
      topicId,
      explanation,
      recommendedReview:
        'Prim-Tracing mit Startknoten, sicherer Schnittkante, key-/parent-Tabelle und Gesamtgewicht erneut aktiv bearbeiten.',
    });

  const startOk = answer.startVertex.trim() === problem.startVertex;
  rubricResults.push(rubric('prim-start', 'Startknoten', 4, startOk ? 4 : 0));
  if (!startOk)
    addError(
      'prim_start_wrong',
      'startVertex',
      answer.startVertex,
      'Der Prim-Startknoten muss exakt aus der Aufgabe übernommen werden.',
      problem.startVertex,
      answer.startVertex,
    );

  const selectedVertices = normalizeList(answer.selectedVertices);
  const expectedVertices = normalizeList(canonical.selectedVertices);
  const vertexMatches = selectedVertices.filter(
    (vertex, index) => vertex === expectedVertices[index],
  ).length;
  const vertexPoints =
    vertexMatches === expectedVertices.length ? 6 : Math.min(5, Math.floor(vertexMatches));
  rubricResults.push(
    rubric('prim-vertex-order', 'Aufnahmereihenfolge der Knoten', 6, vertexPoints),
  );
  if (vertexPoints < 6)
    addError(
      'prim_vertex_order_wrong',
      'selectedVertices',
      answer.selectedVertices,
      'Die Knoten müssen in der durch Prim bestimmten Reihenfolge aufgenommen werden.',
      canonical.selectedVertices,
      answer.selectedVertices,
    );

  const actualEdges = parseUndirectedEdgeList(answer.selectedEdges);
  const expectedEdges = parseUndirectedEdgeList(canonical.selectedEdges);
  const exactEdgeOrder = actualEdges.join('|') === expectedEdges.join('|');
  const validation = validateSpanningTree(problem.vertices, problem.edges, actualEdges);
  const oracle = enumerateMsts(problem.vertices, problem.edges);
  const isMinimum =
    validation.isTree && oracle.status === 'ok' && validation.totalWeight === oracle.minimumWeight;
  const edgePoints = exactEdgeOrder ? 8 : isMinimum ? 6 : validation.isTree ? 4 : 0;
  rubricResults.push(rubric('prim-edge-order', 'Kantenreihenfolge und Endbaum', 8, edgePoints));
  if (!validation.isTree)
    addError(
      'prim_not_a_spanning_tree',
      'selectedEdges',
      answer.selectedEdges,
      'Die angegebenen Kanten bilden keinen gültigen Spannbaum.',
      expectedEdges,
      actualEdges,
    );
  else if (!isMinimum)
    addError(
      'prim_not_minimum_weight',
      'selectedEdges',
      answer.selectedEdges,
      'Der Endbaum ist ein Spannbaum, aber nicht minimal.',
      oracle.minimumWeight,
      validation.totalWeight,
    );
  else if (!exactEdgeOrder)
    addError(
      'prim_edge_order_wrong',
      'selectedEdges',
      answer.selectedEdges,
      'Der Endbaum ist minimal, aber die kanonische Prim-Reihenfolge der strict-Instanz ist anders.',
      canonical.selectedEdges,
      answer.selectedEdges,
    );

  const keyOk = normalize(answer.keyTable) === normalize(canonical.keyTable);
  rubricResults.push(rubric('prim-key-table', 'key-Tabelle', 7, keyOk ? 7 : 0));
  if (!keyOk)
    addError(
      'prim_key_table_wrong',
      'keyTable',
      answer.keyTable,
      'Die key-Werte müssen nach jedem Extract-Min/Update mit dem Oracle übereinstimmen.',
      canonical.keyTable,
      answer.keyTable,
    );

  const parentOk = normalize(answer.parentTable) === normalize(canonical.parentTable);
  rubricResults.push(rubric('prim-parent-table', 'parent-Tabelle', 6, parentOk ? 6 : 0));
  if (!parentOk)
    addError(
      'prim_parent_table_wrong',
      'parentTable',
      answer.parentTable,
      'Die parent-Werte müssen die jeweils beste bekannte Anschlusskante speichern.',
      canonical.parentTable,
      answer.parentTable,
    );

  const actualWeight = numericWeight(answer.totalWeight);
  const weightOk = actualWeight === problem.canonicalSolution.totalWeight;
  rubricResults.push(rubric('prim-total-weight', 'Gesamtgewicht', 4, weightOk ? 4 : 0));
  if (!weightOk)
    addError(
      'prim_total_weight_wrong',
      'totalWeight',
      answer.totalWeight,
      'Das Gesamtgewicht ist die Summe der ausgewählten Baumkanten.',
      problem.canonicalSolution.totalWeight,
      actualWeight,
    );

  const safeOk =
    textContainsAll(answer.safeEdgeExplanation, ['schnitt', 'minimal']) ||
    textContainsAll(answer.safeEdgeExplanation, ['cut', 'minimal']);
  const runtimeOk =
    textContainsAll(answer.runtime, ['o(|e|', 'log', '|v|']) ||
    textContainsAll(answer.runtime, ['o(e', 'log', 'v']);
  rubricResults.push(
    rubric(
      'prim-safe-edge-runtime',
      'Sichere Kante und Laufzeit',
      5,
      (safeOk ? 2 : 0) + (runtimeOk ? 3 : 0),
    ),
  );
  if (!safeOk)
    addError(
      'prim_safe_edge_explanation_missing',
      'safeEdgeExplanation',
      answer.safeEdgeExplanation,
      'Die Begründung muss die minimale Kante über einen Schnitt als sichere Kante erklären.',
      canonical.safeEdgeExplanation,
      answer.safeEdgeExplanation,
    );
  if (!runtimeOk)
    addError(
      'prim_runtime_wrong',
      'runtime',
      answer.runtime,
      'Die belegte Prim-Laufzeit ist O(|E| log |V|).',
      problem.runtime,
      answer.runtime,
    );

  const points = rubricResults.reduce((sum, item) => sum + item.points, 0);
  return {
    points,
    maxPoints: 40,
    rubricResults,
    errors,
    canonicalSolution: canonical,
    recommendation:
      points >= 34
        ? 'Prim-MST-Tracing ist stabil genug für den Simulator.'
        : 'Wiederhole Startknoten, sichere Schnittkante, key-/parent-Updates und Gesamtgewicht im Übungsmodus.',
  };
}

export function evaluateGraphTracingAnswer(
  problem: GraphTracingProblem,
  answer: FloydWarshallAnswer | DijkstraAnswer | PrimAnswer,
): GraphTracingEvaluation {
  if (problem.algorithm === 'dijkstra')
    return evaluateDijkstraAnswer(problem, answer as DijkstraAnswer);
  if (problem.algorithm === 'prim') return evaluatePrimAnswer(problem, answer as PrimAnswer);
  return evaluateFloydWarshallAnswer(problem, answer as FloydWarshallAnswer);
}

export function deriveGraphTracingMastery(evaluation: GraphTracingEvaluation): GraphTracingMastery {
  const byId = new Map(evaluation.rubricResults.map((item) => [item.criterionId, item]));
  const ratio = (id: string) => {
    const item = byId.get(id);
    return item ? item.points / item.maxPoints : 0;
  };
  if (byId.has('marked-order'))
    return {
      modelVersion: 'mastery-v10',
      dimensions: {
        dijkstra_startknoten: ratio('start-vertex'),
        dijkstra_extract_min: ratio('marked-order'),
        dijkstra_distanzen: ratio('distance-table'),
        dijkstra_vorgaenger: ratio('predecessor-table'),
        dijkstra_relaxationen: ratio('relaxations'),
        dijkstra_laufzeit: ratio('runtime'),
      },
      recommendation: evaluation.recommendation,
    };
  if (byId.has('prim-edge-order'))
    return {
      modelVersion: 'mastery-v11',
      dimensions: {
        prim_startknoten: ratio('prim-start'),
        prim_sichere_kante: ratio('prim-edge-order'),
        prim_key_updates: ratio('prim-key-table'),
        prim_parent_updates: ratio('prim-parent-table'),
        prim_gesamtgewicht: ratio('prim-total-weight'),
        prim_laufzeit: ratio('prim-safe-edge-runtime'),
      },
      recommendation: evaluation.recommendation,
    };
  return {
    modelVersion: 'mastery-v9',
    dimensions: {
      fw_knotenreihenfolge: ratio('vertex-order'),
      fw_initialmatrix: ratio('initial-matrix'),
      fw_iterationen:
        ['iteration-d1', 'iteration-d2', 'iteration-d3', 'iteration-d4'].reduce(
          (sum, id) => sum + ratio(id),
          0,
        ) / 4,
      fw_rekurrenz: ratio('recurrence'),
      fw_laufzeit: ratio('runtime'),
    },
    recommendation: evaluation.recommendation,
  };
}

export function canonicalDijkstraStructuredAnswer(problem: GraphTracingProblem): DijkstraAnswer {
  if (problem.algorithm !== 'dijkstra') throw new Error('Dijkstra-Problem erwartet.');
  return {
    startVertex: problem.startVertex,
    markedOrder: dijkstraMarkedOrder(problem),
    distanceTable: dijkstraDistanceTableToInput(problem),
    predecessorTable: dijkstraPredecessorTableToInput(problem),
    relaxationLog: dijkstraRelaxationLog(problem),
    runtime: problem.runtime,
    explanation:
      'In jedem Durchlauf entfernt ExtractMin den weißen Knoten mit kleinster Distanz; danach werden ausgehende Kanten strikt relaxiert und p[v] aktualisiert.',
  };
}

export function canonicalPrimStructuredAnswer(problem: GraphTracingProblem): PrimAnswer {
  if (problem.algorithm !== 'prim') throw new Error('Prim-Problem erwartet.');
  return {
    startVertex: problem.startVertex,
    selectedVertices: primSelectedVertices(problem),
    selectedEdges: primSelectedEdges(problem),
    keyTable: primKeyTableToInput(problem),
    parentTable: primParentTableToInput(problem),
    totalWeight: String(primTotalWeight(problem)),
    safeEdgeExplanation:
      'In jeder Runde wählt Prim eine Kante minimalen Gewichts über den Schnitt zwischen Baum und Restgraph; nach dem Schnittsatz ist diese Kante sicher.',
    runtime: problem.runtime,
  };
}
