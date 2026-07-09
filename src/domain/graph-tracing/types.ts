import type { GraphDistance, GraphTracingProblem } from '../../content/schemas';

export type FloydWarshallMatrix = GraphDistance[][];

export interface FloydWarshallAnswer {
  vertexOrder: string;
  d0: string;
  d1: string;
  d2: string;
  d3: string;
  d4: string;
  recurrence: string;
  runtime: string;
  explanation: string;
}

export type FloydWarshallAnswerField = keyof FloydWarshallAnswer;

export interface DijkstraAnswer {
  startVertex: string;
  markedOrder: string;
  distanceTable: string;
  predecessorTable: string;
  relaxationLog: string;
  runtime: string;
  explanation: string;
}

export type DijkstraAnswerField = keyof DijkstraAnswer;

export interface PrimAnswer {
  startVertex: string;
  selectedVertices: string;
  selectedEdges: string;
  keyTable: string;
  parentTable: string;
  totalWeight: string;
  safeEdgeExplanation: string;
  runtime: string;
}

export type PrimAnswerField = keyof PrimAnswer;

export type GraphTracingAnswer = FloydWarshallAnswer | DijkstraAnswer | PrimAnswer;
export type GraphTracingAnswerField =
  FloydWarshallAnswerField | DijkstraAnswerField | PrimAnswerField;

export type GraphTracingErrorCode =
  | 'fw_vertex_order_wrong'
  | 'fw_matrix_parse_error'
  | 'fw_initial_matrix_wrong'
  | 'fw_iteration_matrix_wrong'
  | 'fw_recurrence_missing'
  | 'fw_runtime_wrong'
  | 'fw_explanation_missing'
  | 'dijkstra_start_wrong'
  | 'dijkstra_marked_order_wrong'
  | 'dijkstra_distance_table_wrong'
  | 'dijkstra_predecessor_table_wrong'
  | 'dijkstra_relaxation_log_incomplete'
  | 'dijkstra_runtime_wrong'
  | 'dijkstra_explanation_missing'
  | 'prim_start_wrong'
  | 'prim_vertex_order_wrong'
  | 'prim_edge_order_wrong'
  | 'prim_key_table_wrong'
  | 'prim_parent_table_wrong'
  | 'prim_total_weight_wrong'
  | 'prim_safe_edge_explanation_missing'
  | 'prim_runtime_wrong'
  | 'prim_not_a_spanning_tree'
  | 'prim_not_minimum_weight';

export interface GraphTracingError {
  errorCode: GraphTracingErrorCode;
  section: GraphTracingAnswerField;
  evidence: string;
  expected: unknown;
  actual: unknown;
  step: number | null;
  severity: 'hinweis' | 'mittel' | 'schwer';
  topicId: string;
  explanation: string;
  recommendedReview: string;
}

export interface GraphRubricResult {
  criterionId: string;
  label: string;
  maxPoints: number;
  points: number;
}

export interface GraphTracingEvaluation {
  points: number;
  maxPoints: number;
  rubricResults: GraphRubricResult[];
  errors: GraphTracingError[];
  canonicalSolution: GraphTracingAnswer;
  recommendation: string;
}

export interface GraphTracingMastery {
  modelVersion: 'mastery-v9' | 'mastery-v10' | 'mastery-v11';
  dimensions: Record<string, number>;
  recommendation: string;
}

export type FloydWarshallProblem = GraphTracingProblem & { algorithm: 'floyd_warshall' };
export type DijkstraProblem = GraphTracingProblem & { algorithm: 'dijkstra' };
export type PrimProblem = GraphTracingProblem & { algorithm: 'prim' };
