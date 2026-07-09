import type { TrainingRecommendation } from '../../content/schemas';

export type DpDesignMode = 'learn' | 'practice' | 'exam' | 'review';

export interface MineProblemInstance {
  id: string;
  matrix: number[][];
  rowCount: number;
  columnCount: number;
  sourceRefs: Array<{ sourceId: string; page: number; label?: string }>;
}

export interface DpDesignAnswer {
  kind: 'dp_design_mine';
  trainerKind: 'design';
  problemId: string;
  interpretation: {
    inputObjects: string;
    objective: string;
    constraints: string;
    output: string;
  };
  state: {
    tableName: string;
    dimensions: string;
    rowRange: string;
    columnRange: string;
    entryMeaning: string;
    optimizationDirection: string;
  };
  recurrence: {
    baseCase: string;
    leftBoundary: string;
    rightBoundary: string;
    innerCase: string;
    invalidStates: string;
  };
  evaluation: {
    dependencyDirection: string;
    order: string;
    outputCell: string;
  };
  algorithm: {
    allocation: string;
    initialization: string;
    loops: string;
    returnStatement: string;
  };
  proof: {
    claim: string;
    baseCase: string;
    inductionHypothesis: string;
    inductionStep: string;
    conclusion: string;
  };
  complexity: {
    states: string;
    transitionCost: string;
    runtime: string;
    memory: string;
  };
}

export interface CanonicalDpDesignSolution extends DpDesignAnswer {
  canonicalSolutionVersion: string;
  optimalValue: number;
  optimalPath: Array<{ row: number; column: number; value: number }>;
  dpTable: number[][];
}

export type DpDesignErrorCode =
  | 'dp_interpretation_error'
  | 'dp_state_dimension_error'
  | 'dp_state_meaning_error'
  | 'dp_base_case_error'
  | 'dp_transition_boundary_error'
  | 'dp_transition_inner_error'
  | 'dp_invalid_state_error'
  | 'dp_order_error'
  | 'dp_output_cell_error'
  | 'dp_algorithm_error'
  | 'dp_proof_error'
  | 'dp_runtime_error'
  | 'dp_memory_error';

export interface DpDesignError {
  errorCode: DpDesignErrorCode;
  section: keyof DpDesignAnswer;
  criterionId: string;
  evidence: string;
  expected: unknown;
  actual: unknown;
  explanation: string;
  severity: 'hinweis' | 'mittel' | 'schwer';
  topicId: string;
  recommendedReview: string;
  step: number | null;
}

export interface DpDesignRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface DpDesignEvaluation {
  points: number;
  maxPoints: number;
  examPoints: number;
  rubricResults: DpDesignRubricResult[];
  errors: DpDesignError[];
  recommendation: TrainingRecommendation;
  canonicalSolution: CanonicalDpDesignSolution;
}

export interface DpDesignMastery {
  evidenceAttemptIds: string[];
  dimensions: Record<string, number>;
}
