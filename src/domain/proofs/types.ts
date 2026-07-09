import type { TrainingRecommendation } from '../../content/schemas';

export type ProofMode = 'practice' | 'exam' | 'review';

export type MathExpression =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'binary'; operator: '+' | '-' | '*'; left: MathExpression; right: MathExpression }
  | { type: 'power'; base: MathExpression; exponent: MathExpression }
  | {
      type: 'sum';
      index: string;
      lower: MathExpression;
      upper: MathExpression;
      body: MathExpression;
    }
  | { type: 'array'; array: string; index: MathExpression };

export interface ExpressionComparison {
  equivalent: boolean;
  normalizedActual: string;
  normalizedExpected: string;
  unsupported: boolean;
  reason: string;
}

export interface LoopProgram {
  name: string;
  input: string;
  output: string;
  pseudocode: string[];
  accumulator: string;
  loopIndex: string;
  loopStart: number;
  loopEnd: string;
  loopBody: string;
  returnVariable: string;
}

export interface ProofProblem {
  id: string;
  title: string;
  program: LoopProgram;
  allowedSymbols: string[];
  canonical: CanonicalProof;
}

export type LoopTiming = 'before_iteration_i' | 'after_iteration_i' | 'after_loop';

export interface StructuredProof {
  trainerKind: 'proof';
  problemId: string;
  preflight: {
    accumulator: string;
    iterationEffect: string;
    iterationCount: string;
    valueAfterZero: string;
    valueAfterOne: string;
    valueAfterTwo: string;
    expectedReturn: string;
  };
  claim: {
    inputRange: string;
    returnVariable: string;
    expression: string;
    quantifier: string;
    edgeCases: string;
  };
  invariant: {
    variable: string;
    index: string;
    range: string;
    timing: LoopTiming | string;
    expression: string;
  };
  initialization: {
    startIndex: string;
    stateBeforeFirstIteration: string;
    initializedValue: string;
    substitutedExpression: string;
    conclusion: string;
  };
  hypothesis: {
    index: string;
    range: string;
    equation: string;
    timing: string;
  };
  preservation: {
    before: string;
    bodySubstitution: string;
    algebra: string;
    target: string;
  };
  termination: {
    loopEndsWhen: string;
    nextIndex: string;
    invariantInstance: string;
    returnValue: string;
  };
  conclusion: {
    invariantToReturn: string;
    returnLine: string;
    claimRestated: string;
  };
}

export interface CanonicalProof extends StructuredProof {
  canonicalProofVersion: string;
  formulaLabels: Record<string, string>;
}

export type ProofErrorCode =
  | 'program_interpretation_error'
  | 'claim_error'
  | 'wrong_output_expression'
  | 'invariant_error'
  | 'invariant_timing_error'
  | 'invariant_scope_error'
  | 'index_range_error'
  | 'off_by_one_error'
  | 'initialization_error'
  | 'induction_hypothesis_error'
  | 'preservation_error'
  | 'loop_body_substitution_error'
  | 'algebra_error'
  | 'induction_target_error'
  | 'termination_error'
  | 'return_value_connection_error'
  | 'conclusion_error'
  | 'proof_structure_error'
  | 'undefined_symbol_error'
  | 'expression_parse_error'
  | 'incomplete_proof_error'
  | 'unsupported_equivalence'
  | 'manual_review_recommended';

export interface ProofError {
  errorCode: ProofErrorCode;
  section: keyof StructuredProof | 'expression';
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

export interface ProofRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface ProofEvaluation {
  points: number;
  maxPoints: number;
  rubricResults: ProofRubricResult[];
  errors: ProofError[];
  recommendation: TrainingRecommendation;
  canonicalProof: CanonicalProof;
}

export interface ProofMastery {
  dimensions: Record<string, number>;
  evidenceAttemptIds: string[];
}
