import type { TrainingRecommendation } from '../../content/schemas';

export type DivideConquerDesignMode = 'learn' | 'practice' | 'exam' | 'review';

export interface MaxDifferenceTriple {
  maxDifference: number;
  minimum: number;
  maximum: number;
}

export interface MaxDifferenceWitness {
  value: number;
  leftIndex: number;
  rightIndex: number;
}

export interface DivideConquerDesignAnswer {
  kind: 'divide_conquer_max_difference';
  trainerKind: 'design';
  problemId: string;
  interpretation: {
    input: string;
    objective: string;
    output: string;
  };
  decomposition: {
    subproblem: string;
    baseCase: string;
    split: string;
  };
  combine: {
    leftCase: string;
    rightCase: string;
    crossCase: string;
    summary: string;
  };
  algorithm: {
    signature: string;
    recursiveCalls: string;
    returnValue: string;
  };
  recurrence: {
    equation: string;
    combineCost: string;
    runtime: string;
  };
  proof: {
    claim: string;
    inductionParameter: string;
    baseCase: string;
    inductionStep: string;
    caseAnalysis: string;
    conclusion: string;
  };
}

export interface CanonicalDivideConquerDesignSolution extends DivideConquerDesignAnswer {
  canonicalSolutionVersion: string;
  sampleInput: number[];
  result: MaxDifferenceTriple;
}

export type DivideConquerDesignErrorCode =
  | 'dc_interpretation_error'
  | 'dc_subproblem_error'
  | 'dc_base_case_error'
  | 'dc_split_error'
  | 'dc_missing_left_case'
  | 'dc_missing_right_case'
  | 'dc_missing_cross_case'
  | 'dc_summary_values_error'
  | 'dc_algorithm_error'
  | 'dc_recurrence_error'
  | 'dc_runtime_error'
  | 'dc_proof_error';

export interface DivideConquerDesignError {
  errorCode: DivideConquerDesignErrorCode;
  section: keyof DivideConquerDesignAnswer;
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

export interface DivideConquerRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface DivideConquerDesignEvaluation {
  points: number;
  maxPoints: number;
  examPoints: number;
  rubricResults: DivideConquerRubricResult[];
  errors: DivideConquerDesignError[];
  recommendation: TrainingRecommendation;
  canonicalSolution: CanonicalDivideConquerDesignSolution;
}

export interface DivideConquerDesignMastery {
  evidenceAttemptIds: string[];
  dimensions: Record<string, number>;
}
