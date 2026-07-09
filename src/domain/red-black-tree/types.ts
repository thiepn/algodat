export type RbColor = 'R' | 'B';

export interface RbNode {
  key: number;
  color: RbColor;
  left: RbNode | null;
  right: RbNode | null;
  parent: RbNode | null;
}

export interface RbTree {
  root: RbNode | null;
}

export type RbFixupCase = 'root-black' | 'case-1-recolor' | 'case-2-rotate' | 'case-3-rotate';

export interface RbTraceStep {
  action: string;
  insertedKey: number;
  caseLabel: RbFixupCase;
  reason: string;
  tree: string;
}

export interface RbInsertionResult {
  keys: number[];
  finalTree: RbTree;
  finalTreeCompact: string;
  trace: RbTraceStep[];
  blackHeight: number;
}

export interface RbInvariantReport {
  valid: boolean;
  errors: string[];
  blackHeight: number | null;
}

export interface RbInsertionAnswer {
  nilConvention: string;
  insertedKeys: string;
  fixupCases: string;
  finalTree: string;
  blackHeight: string;
  runtime: string;
  explanation: string;
}

export type RbInsertionErrorCode =
  | 'rb_nil_missing'
  | 'rb_sequence_wrong'
  | 'rb_case_missing'
  | 'rb_final_tree_wrong'
  | 'rb_black_height_wrong'
  | 'rb_runtime_wrong'
  | 'rb_explanation_missing';

export interface RbInsertionError {
  errorCode: RbInsertionErrorCode;
  section: keyof RbInsertionAnswer;
  evidence: string;
  expected: string;
  actual: string;
  step: number | null;
  severity: 'hinweis' | 'mittel' | 'schwer';
  topicId: string;
  explanation: string;
  recommendedReview: string;
}

export interface RbRubricResult {
  criterionId: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface RbInsertionEvaluation {
  points: number;
  maxPoints: number;
  rubricResults: RbRubricResult[];
  errors: RbInsertionError[];
  canonicalSolution: RbInsertionAnswer;
  recommendation: string;
}

export interface RbInsertionMastery {
  modelVersion: 'mastery-v8';
  dimensions: Record<string, number>;
  recommendation: string;
}
