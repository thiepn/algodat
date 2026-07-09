import type { TrainingRecommendation } from '../../content/schemas';

export type GreedyDesignMode = 'learn' | 'practice' | 'exam' | 'review';

export interface GreedyDesignAnswer {
  kind: 'greedy_design_fitnesspunkte';
  trainerKind: 'design';
  problemId: string;
  interpretation: {
    inputObjects: string;
    objective: string;
    constraints: string;
    output: string;
  };
  greedyRule: {
    sortingOrder: string;
    tieBreaker: string;
    decision: string;
    objectiveReason: string;
  };
  algorithm: {
    preprocessing: string;
    accumulator: string;
    loop: string;
    returnStatement: string;
  };
  proof: {
    claim: string;
    contradictionAssumption: string;
    exchangeStep: string;
    difference: string;
    conclusion: string;
  };
  complexity: {
    sorting: string;
    loop: string;
    total: string;
    memory: string;
  };
}

export interface CanonicalGreedyDesignSolution extends GreedyDesignAnswer {
  canonicalSolutionVersion: string;
  sampleInput: number[];
  sortedOrder: number[];
  optimalValue: number;
}

export type GreedyDesignErrorCode =
  | 'greedy_interpretation_error'
  | 'greedy_rule_error'
  | 'greedy_algorithm_error'
  | 'greedy_proof_error'
  | 'greedy_runtime_error'
  | 'greedy_memory_error';

export interface GreedyDesignError {
  errorCode: GreedyDesignErrorCode;
  section: keyof GreedyDesignAnswer;
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

export interface GreedyDesignRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface GreedyDesignEvaluation {
  points: number;
  maxPoints: number;
  examPoints: number;
  rubricResults: GreedyDesignRubricResult[];
  errors: GreedyDesignError[];
  recommendation: TrainingRecommendation;
  canonicalSolution: CanonicalGreedyDesignSolution;
}

export interface GreedyDesignMastery {
  evidenceAttemptIds: string[];
  dimensions: Record<string, number>;
}
