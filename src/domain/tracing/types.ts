import type {
  TrainingRecommendation,
  TracingProblem,
  TracingStep,
  UnionFindTracingProblem,
} from '../../content/schemas';

export type TrainingMode = 'practice' | 'exam' | 'review';
export type TieChoice = 'include' | 'exclude';

export interface TraceCellDecision {
  capacity: number;
  excludeValue: number;
  includeValue: number | null;
  value: number;
  decision: TieChoice;
  tie: boolean;
}

export interface CanonicalTraceStep extends TracingStep {
  decisions: TraceCellDecision[];
}

export interface UserTraceRow {
  index: number;
  values: Array<number | null>;
  tieChoices: Record<string, TieChoice>;
}

export interface PreflightAnswers {
  algorithm: 'knapsack_01' | 'other';
  negativeWeights: boolean;
  indexingStartsAtZero: boolean;
  usesPreviousRow: boolean;
  eachItemAtMostOnce: boolean;
  output: 'complete_table_and_optimum' | 'other';
  runtime: 'O(n · W)' | 'other';
}

export interface UnionFindPreflightAnswers {
  algorithm: 'union_find_linked_lists' | 'other';
  representation: 'linked_lists_with_representative_pointer' | 'other';
  startsEmpty: boolean;
  weightedUnion: boolean;
  tieBreaker: 'lexicographically_smaller_representative_is_smaller_set' | 'other';
  output: 'checkpoint_sets_representatives_next_size' | 'other';
  nextDirection: 'head_to_tail' | 'other';
  runtime: 'O(m + n log n)' | 'other';
}

export interface TraceSubmission {
  rows: UserTraceRow[];
  preflight: PreflightAnswers;
  finalValue: number | null;
  mode: TrainingMode;
  hintsUsed: string[];
  solutionRevealed: boolean;
}

export type TrainingErrorCode =
  | 'concept_error'
  | 'tracing_error'
  | 'tie_breaker_error'
  | 'runtime_error'
  | 'notation_error'
  | 'graph_direction_error'
  | 'invalid_algorithm_choice'
  | 'initialization_error'
  | 'vertex_selection_error'
  | 'relaxation_error'
  | 'distance_update_error'
  | 'predecessor_error'
  | 'premature_finalization_error'
  | 'incomplete_answer'
  | 'wrong_representative'
  | 'wrong_set_membership'
  | 'wrong_size'
  | 'wrong_head_tail'
  | 'next_pointer_error'
  | 'list_order_error'
  | 'weighted_union_error'
  | 'stale_representative_pointer'
  | 'missing_element_error'
  | 'duplicate_element_error'
  | 'cycle_error'
  | 'invalid_operation_error'
  | 'incomplete_state_error';

export interface TraceError {
  errorCode: TrainingErrorCode;
  step: number | null;
  evidence: string;
  expected: unknown;
  actual: unknown;
  explanation: string;
  severity: 'hinweis' | 'mittel' | 'schwer';
  topicId: string;
  recommendedReview: string;
}

export interface RubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface TraceScore {
  points: number;
  maxPoints: number;
  rawPoints: number;
  rubricResults: RubricResult[];
  errors: TraceError[];
  recommendation: TrainingRecommendation;
  canonicalTrace: CanonicalTraceStep[];
}

export interface MasteryEvidenceAttempt {
  id: string;
  mode: TrainingMode;
  score: number;
  maxScore: number;
  rubricResults: RubricResult[];
  errorCodes: TrainingErrorCode[];
  hintsUsed: string[];
  solutionRevealed: boolean;
  durationMs: number;
  contentVersion: string;
}

export interface MasteryDimensions {
  recognition: number;
  tracing: number;
  rule_application?: number;
  representation_accuracy?: number;
  tie_breaking: number;
  consistency?: number;
  correctness_understanding: number;
  runtime_knowledge: number;
  timed_performance: number;
  set_representation?: number;
  weighted_union?: number;
  pointer_updates?: number;
  representative_updates?: number;
}

export interface DerivedMastery {
  dimensions: MasteryDimensions;
  evidenceAttemptIds: string[];
  contentVersions: string[];
  recommendation: TrainingRecommendation;
}

export type { TracingProblem };

export interface UnionFindElementState {
  key: string;
  representative: string;
  next: string | null;
}

export interface UnionFindSetState {
  representative: string;
  head: string;
  tail: string;
  size: number;
  orderedElements: string[];
}

export interface UnionFindState {
  operationIndex: number;
  operationLabel: string;
  sets: UnionFindSetState[];
  elements: UnionFindElementState[];
  representativeByElement: Record<string, string>;
  attachedList: { from: string; to: string; reason: string } | null;
}

export interface UnionFindUserCheckpoint {
  operationIndex: number;
  stateText: string;
  attachedList: string;
}

export interface UnionFindSubmission {
  checkpoints: UnionFindUserCheckpoint[];
  preflight: UnionFindPreflightAnswers;
  mode: TrainingMode;
  hintsUsed: string[];
  solutionRevealed: boolean;
}

export interface UnionFindScore {
  points: number;
  maxPoints: number;
  rawPoints: number;
  rubricResults: RubricResult[];
  errors: TraceError[];
  recommendation: TrainingRecommendation;
  canonicalTrace: UnionFindState[];
}

export type { UnionFindTracingProblem };
