import type { TrainingRecommendation } from '../../content/schemas';

export type RecurrenceMode = 'learn' | 'practice' | 'exam' | 'review';

export interface RecurrenceProblem {
  id: string;
  title: string;
  recurrence: string;
  baseCase: string;
  domain: string;
  canonical: CanonicalRuntimeProof;
}

export interface MasterTheoremAnalysis {
  a: number;
  b: number;
  f: string;
  criticalExponent: string;
  criticalFunction: string;
  comparison: 'smaller' | 'equal' | 'larger';
  caseId: 'fall1' | 'fall2' | 'fall3' | 'not_applicable';
  result: string;
  regularityWitness: string;
}

export interface RecursionTreeAnalysis {
  height: string;
  nodesAtLevel: string;
  subproblemSizeAtLevel: string;
  costPerNodeAtLevel: string;
  levelCost: string;
  leafCount: string;
  totalCost: string;
  textAlternative: string;
}

export interface RuntimeProofAnswer {
  kind: 'recurrence_runtime_proof';
  trainerKind: 'proof';
  problemId: string;
  preflight: {
    recurrence: string;
    baseCase: string;
    domain: string;
    requestedAsymptotic: string;
    requestedProof: string;
  };
  parameters: {
    a: string;
    b: string;
    f: string;
    criticalExponent: string;
    criticalFunction: string;
    masterCase: string;
    regularityWitness: string;
    asymptoticBound: string;
  };
  recursionTree: RecursionTreeAnalysis;
  proof: {
    claim: string;
    inductionMethod: string;
    baseCase: string;
    hypothesis: string;
    substitution: string;
    algebra: string;
    constantCondition: string;
    conclusion: string;
  };
}

export interface CanonicalRuntimeProof extends RuntimeProofAnswer {
  canonicalProofVersion: string;
  closedForm: string;
  master: MasterTheoremAnalysis;
}

export type RecurrenceErrorCode =
  | 'recurrence_parse_error'
  | 'base_case_error'
  | 'domain_error'
  | 'parameter_error'
  | 'critical_exponent_error'
  | 'growth_comparison_error'
  | 'master_case_error'
  | 'regularity_error'
  | 'asymptotic_bound_error'
  | 'recursion_tree_error'
  | 'induction_claim_error'
  | 'induction_method_error'
  | 'induction_base_error'
  | 'induction_hypothesis_error'
  | 'recurrence_substitution_error'
  | 'algebra_error'
  | 'constant_condition_error'
  | 'conclusion_error'
  | 'incomplete_proof_error';

export interface RecurrenceError {
  errorCode: RecurrenceErrorCode;
  section: keyof RuntimeProofAnswer | 'master';
  step: number | null;
  evidence: string;
  expected: unknown;
  actual: unknown;
  explanation: string;
  severity: 'hinweis' | 'mittel' | 'schwer';
  topicId: string;
  criterionId: string;
  recommendedReview: string;
}

export interface RecurrenceRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface RecurrenceEvaluation {
  points: number;
  maxPoints: number;
  rubricResults: RecurrenceRubricResult[];
  errors: RecurrenceError[];
  recommendation: TrainingRecommendation;
  canonicalProof: CanonicalRuntimeProof;
}

export interface RecurrenceMastery {
  dimensions: Record<string, number>;
  evidenceAttemptIds: string[];
}
