export type DiagnosticMode = 'learn' | 'practice' | 'diagnosis' | 'exam';

export type DiagnosticItemType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false_reason'
  | 'matching'
  | 'ordering'
  | 'numeric_short_answer'
  | 'symbolic_choice'
  | 'table_completion'
  | 'code_recognition'
  | 'error_diagnosis'
  | 'algorithm_selection'
  | 'complexity_classification';

export type DiagnosticDifficulty = 'leicht' | 'mittel' | 'schwer';

export type DiagnosticErrorCode =
  | 'asymptotic_dominance_error'
  | 'asymptotic_notation_error'
  | 'best_worst_case_confusion'
  | 'recurrence_form_error'
  | 'master_theorem_applicability_error'
  | 'master_theorem_case_error'
  | 'sorting_runtime_error'
  | 'sorting_stability_error'
  | 'sorting_in_place_error'
  | 'search_precondition_error'
  | 'data_structure_operation_error'
  | 'data_structure_runtime_error'
  | 'bst_vs_heap_confusion'
  | 'rb_tree_invariant_confusion'
  | 'union_find_operation_confusion'
  | 'graph_type_error'
  | 'graph_connectivity_error'
  | 'negative_edge_cycle_confusion'
  | 'shortest_path_algorithm_error'
  | 'shortest_path_precondition_error'
  | 'mst_shortest_path_confusion'
  | 'traversal_order_confusion'
  | 'greedy_dp_confusion'
  | 'greedy_dnc_confusion'
  | 'dp_dnc_confusion'
  | 'proof_method_error'
  | 'correctness_runtime_confusion'
  | 'necessary_sufficient_confusion'
  | 'code_recognition_error'
  | 'incomplete_answer'
  | 'over_selection_error'
  | 'under_selection_error'
  | 'manual_review_recommended';

export interface SourceRef {
  sourceId: string;
  page: number;
  label?: string;
}

export interface FoundationCompetency {
  competencyId: string;
  title: string;
  group: string;
  topicIds: string[];
  examTaskNumbers: number[];
  sourceRefs: SourceRef[];
  authorityLevel: number;
  canonicalFacts: string[];
  commonMisconceptions: Array<{
    misconceptionId: string;
    category: string;
    description: string;
    remediationTarget: string;
  }>;
  supportedItemTypes: DiagnosticItemType[];
  relatedTrainerIds: string[];
  verificationStatus: string;
  publicDistributionStatus: string;
}

export interface DiagnosticOption {
  id: string;
  text: string;
  correct?: boolean;
  misconceptionId?: string;
  distractorCategory?: string;
  reasonIncorrect?: string;
  diagnosticValue?: string;
  remediationTarget?: string;
  sourceRefs?: SourceRef[];
}

export interface DiagnosticPrompt {
  stem: string;
  instruction: string;
}

export interface DiagnosticAnswerDefinition {
  correctOptionIds?: string[];
  correctPairs?: Record<string, string>;
  correctOrderIds?: string[];
  numericAnswer?: number;
  tolerance?: number;
  correctAlgorithmId?: string;
  complexityClass?: string;
  correctReasonId?: string;
}

export interface DiagnosticRubric {
  maxPoints: number;
  partialCredit: 'none' | 'per_correct_option' | 'per_pair' | 'adjacent_pairs' | 'per_component';
}

export interface DiagnosticItem {
  id: string;
  schemaVersion: string;
  contentVersion: string;
  competencyIds: string[];
  topicIds: string[];
  examTaskNumbers: number[];
  difficulty: DiagnosticDifficulty;
  itemType: DiagnosticItemType;
  prompt: DiagnosticPrompt;
  options: DiagnosticOption[];
  answerDefinition: DiagnosticAnswerDefinition;
  rubric: DiagnosticRubric;
  feedbackRules: Array<{
    id: string;
    level: number;
    message: string;
    misconceptionId?: string;
  }>;
  misconceptionIds: string[];
  relatedTrainerIds: string[];
  estimatedSeconds: number;
  sourceRefs: SourceRef[];
  verificationStatus: string;
  publicDistributionStatus: string;
  solutionValidationStatus: string;
  engineVersion: string;
  lastReviewed: string;
}

export interface DiagnosticAnswer {
  itemId: string;
  selectedOptionIds?: string[];
  selectedPairs?: Record<string, string>;
  orderedIds?: string[];
  numericValue?: number | string;
  algorithmId?: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  answeredAt: string;
}

export interface DiagnosticError {
  errorCode: DiagnosticErrorCode;
  itemId: string;
  competencyIds: string[];
  selectedAnswer: unknown;
  expectedAnswer: unknown;
  evidence: string;
  misconceptionId: string;
  sourceRefs: SourceRef[];
  severity: 'hinweis' | 'mittel' | 'schwer';
  rootCauseErrorId: string | null;
  masteryDimensions: string[];
  relatedTrainerIds: string[];
  recommendedReviewActivity: string;
}

export interface DiagnosticItemResult {
  itemId: string;
  competencyIds: string[];
  itemType: DiagnosticItemType;
  points: number;
  maxPoints: number;
  correct: boolean;
  completeness: number;
  reasoningSelection: number;
  confidence: number;
  timeEfficiency: number;
  errors: DiagnosticError[];
}

export interface DiagnosticCompetencyResult {
  competencyId: string;
  title: string;
  points: number;
  maxPoints: number;
  scoreRatio: number;
  evidenceCount: number;
  confidence: number;
  misconceptionIds: string[];
  relatedTrainerIds: string[];
}

export interface DiagnosticRecommendation {
  id: string;
  priority: number;
  label: string;
  reason: string;
  targetType: 'trainer' | 'topic' | 'review';
  targetId: string;
}

export interface DiagnosticSessionConfig {
  mode: DiagnosticMode;
  itemCount: number;
  seed: string;
  competencyTargets: string[];
  timeLimitMinutes: number | null;
}

export interface DiagnosticSession {
  id: string;
  schemaVersion: string;
  sessionType: 'foundations_diagnostic';
  configVersion: string;
  itemBankVersion: string;
  masteryModelVersion: 'mastery-v13';
  seed: string;
  mode: DiagnosticMode;
  competencyTargets: string[];
  itemIds: string[];
  currentItemIndex: number;
  responses: Record<string, DiagnosticAnswer>;
  confidenceResponses: Record<string, number>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  durationMs: number;
  itemResults: DiagnosticItemResult[];
  competencyResults: DiagnosticCompetencyResult[];
  errors: DiagnosticError[];
  recommendations: DiagnosticRecommendation[];
  finalScore: { points: number; maxPoints: number };
}

export interface DiagnosticSummary {
  sessionId: string;
  mode: DiagnosticMode;
  itemCount: number;
  answeredCount: number;
  points: number;
  maxPoints: number;
  competencyResults: DiagnosticCompetencyResult[];
  recommendations: DiagnosticRecommendation[];
}

export interface DiagnosticMasteryV13 {
  evidenceSessionIds: string[];
  dimensions: Record<string, number>;
}
