import { z } from 'zod';
import {
  CanonicalMetaShape,
  EvidenceTypeSchema,
  SourceReferenceSchema,
  VerificationStatusSchema,
} from './common';

const Meta = CanonicalMetaShape;

export const SourceDocumentSchema = z.object({
  ...Meta,
  displayName: z.string().min(1),
  title: z.string().min(1),
  authorityLevel: z.number().int().min(1).max(4),
  category: z.string().min(1),
  evidenceType: EvidenceTypeSchema,
  year: z.number().int().nullable(),
  pageCount: z.number().int().nonnegative().nullable(),
  extractionSucceeded: z.boolean().nullable(),
  visualReviewRequired: z.boolean(),
  canonicalDocumentId: z.string().min(1),
  historicalFrequencyEligible: z.boolean(),
});

export const SourcePageSchema = z.object({
  ...Meta,
  sourceId: z.string().min(1),
  page: z.number().int().positive(),
  textCharacterCount: z.number().int().nonnegative(),
  visualReviewStatus: z.string().nullable(),
});

export const TopicSchema = z.object({
  ...Meta,
  name: z.string().min(1),
  category: z.string().min(1),
  importance: z.enum(['mittel', 'hoch', 'sehr hoch']),
  prerequisites: z.array(z.string()),
  officialSourceCoverage: z.number().int().nonnegative(),
  exerciseCoverage: z.number().int().nonnegative(),
  realExamOccurrences: z.array(z.string()),
  mockExamOccurrences: z.array(z.string()),
  exerciseOccurrences: z.array(z.string()),
  visualReviewStatus: z.enum(['geprüft', 'teilweise', 'offen']),
});

export const AlgorithmSchema = z.object({
  ...Meta,
  topicId: z.string().min(1),
  name: z.string().min(1),
  pseudocode: z.string().nullable(),
  runtime: z.string().nullable(),
  memoryComplexity: z.string().nullable(),
});

export const DataStructureSchema = z.object({
  ...Meta,
  name: z.string().min(1),
  invariants: z.array(z.string()),
  operations: z.array(z.object({ name: z.string(), complexity: z.string().nullable() })),
});

export const DefinitionSchema = z.object({ ...Meta, term: z.string(), statement: z.string() });
export const TheoremSchema = z.object({
  ...Meta,
  name: z.string(),
  statement: z.string(),
  assumptions: z.array(z.string()),
});
export const ProofTemplateSchema = z.object({
  ...Meta,
  proofType: z.string(),
  steps: z.array(z.string()),
  applicability: z.array(z.string()),
});

export const ExerciseSchema = z.object({
  ...Meta,
  title: z.string(),
  topicIds: z.array(z.string()),
  difficulty: z.enum(['leicht', 'mittel', 'schwer', 'unbekannt']),
  evidenceType: z.enum(['exercise', 'tutorial']),
});

export const ExamSchema = z.object({
  ...Meta,
  title: z.string(),
  year: z.number().int().nullable(),
  evidenceType: z.enum(['real_exam', 'mock_exam']),
  examRegime: z.string(),
  examiner: z.string().nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  totalPoints: z.number().positive().nullable(),
  confidence: z.string(),
  taskCount: z.number().int().positive(),
});

export const ExamProfileTaskSchema = z.object({
  taskNumber: z.number().int().min(1).max(9),
  format: z.string(),
  historicalTopics: z.array(z.string()),
  typicalPoints: z.number().nonnegative(),
  answerComponents: z.string(),
  priority: z.string(),
  confidence: z.string(),
});

export const ExamProfileSchema = z.object({
  ...Meta,
  title: z.string(),
  description: z.string(),
  taskCount: z.number().int().positive(),
  totalPoints: z.number().positive(),
  durationMinutes: z.number().int().positive().nullable(),
  durationEvidence: z.string(),
  confidence: z.string(),
  supportingExamIds: z.array(z.string()),
  deviations: z.array(z.string()),
  tasks: z.array(ExamProfileTaskSchema),
});

export const ExamQuestionSchema = z.object({
  ...Meta,
  examId: z.string().min(1),
  taskNumber: z.number().int().positive(),
  subtask: z.string().nullable(),
  points: z.number().nonnegative().nullable(),
  topicIds: z.array(z.string()),
  evidenceType: EvidenceTypeSchema,
});

export const SolutionSchema = z.object({
  ...Meta,
  questionId: z.string().min(1),
  summary: z.string().nullable(),
  official: z.boolean(),
});

export const RubricCriterionSchema = z.object({
  id: z.string(),
  description: z.string(),
  points: z.number().nonnegative(),
});
export const RubricSchema = z
  .object({
    ...Meta,
    questionId: z.string(),
    criteria: z.array(RubricCriterionSchema),
    maxPoints: z.number().nonnegative(),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.points, 0);
    if (Math.abs(sum - rubric.maxPoints) > Number.EPSILON) {
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'maxPoints muss der Summe der Kriterien entsprechen.',
      });
    }
  });

export const CommonMistakeSchema = z.object({
  ...Meta,
  topicIds: z.array(z.string()),
  errorCode: z.string(),
  description: z.string(),
});
export const LearningModuleSchema = z.object({
  ...Meta,
  topicIds: z.array(z.string()),
  learningOutcomes: z.array(z.string()),
  contentRefs: z.array(z.string()),
});

export const PracticeAttemptSchema = z.object({
  ...Meta,
  itemId: z.string(),
  trainerId: z.string(),
  trainerKind: z.enum(['tracing', 'proof', 'design']).optional(),
  itemContentVersion: z.string(),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  status: z.enum(['draft', 'completed']),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
  answers: z.array(z.unknown()),
  score: z.number().nullable(),
  maxScore: z.number().nonnegative(),
  rubricResults: z.array(
    z.object({
      criterionId: z.string(),
      label: z.string(),
      points: z.number().nonnegative(),
      maxPoints: z.number().nonnegative(),
    }),
  ),
  errorCodes: z.array(z.string()),
  hintsUsed: z.array(z.string()),
  solutionRevealed: z.boolean(),
  canonicalTraceVersion: z.string(),
  canonicalProofVersion: z.string().optional(),
  sourceVersion: z.string(),
  engineVersion: z.string().optional(),
  problemVersion: z.string().optional(),
  scoringModelVersion: z.string().optional(),
  masteryModelVersion: z.string().optional(),
  answerPayloadSchemaVersion: z.string().optional(),
  preflightAnswers: z.record(z.string(), z.unknown()),
  attemptedAt: z.string(),
  storedContentVersion: z.string(),
});
export const MasteryRecordSchema = z.object({
  ...Meta,
  topicOrTaskId: z.string(),
  dimensions: z.record(z.string(), z.number().min(0).max(1)),
  evidenceAttemptIds: z.array(z.string()),
  updatedAt: z.string(),
});
export const ErrorRecordSchema = z.object({
  ...Meta,
  attemptId: z.string(),
  category: z.string(),
  evidence: z.string(),
  errorCode: z.string(),
  step: z.number().int().nonnegative().nullable(),
  expected: z.unknown(),
  actual: z.unknown(),
  explanation: z.string(),
  severity: z.enum(['hinweis', 'mittel', 'schwer']),
  topicId: z.string(),
  recommendedReview: z.string(),
  resolvedAt: z.string().nullable(),
});
export const StudySessionSchema = z.object({
  ...Meta,
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  activityIds: z.array(z.string()),
  summary: z.string().nullable(),
});
export const CheatSheetItemSchema = z.object({
  ...Meta,
  sourceContentId: z.string(),
  kind: z.string(),
  priority: z.string(),
  placement: z.string().nullable(),
  mustKnow: z.boolean(),
});

export const SourceConflictSchema = z.object({
  ...Meta,
  topic: z.string(),
  higherAuthorityClaim: z.string(),
  lowerAuthorityClaim: z.string(),
  resolution: z.string(),
});
export const ContentCorrectionSchema = z.object({
  ...Meta,
  recordType: z.string(),
  recordId: z.string(),
  field: z.string(),
  previousValue: z.unknown(),
  correctedValue: z.unknown(),
  reason: z.string().min(1),
});

export const PublicDistributionStatusSchema = z.enum([
  'public_safe',
  'local_only',
  'metadata_only',
  'blocked',
]);
export const SolutionValidationStatusSchema = z.enum([
  'engine_matches_official_method',
  'verified_against_official_solution',
  'deterministic_engine_verified',
  'unverified',
]);
const TrainingContentShape = {
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  topicIds: z.array(z.string().min(1)).min(1),
  taskType: z.enum([
    'dp_table_tracing',
    'union_find_list_tracing',
    'loop_invariant_proof',
    'recurrence_runtime_proof',
    'dp_design',
    'greedy_design',
    'divide_conquer_design',
    'red_black_tree_insertion',
    'graph_algorithm_tracing',
  ]),
  sourceRefs: z
    .array(
      z.object({
        sourceId: z.string().min(1),
        page: z.number().int().positive(),
        label: z.string().optional(),
      }),
    )
    .min(1),
  verificationStatus: VerificationStatusSchema,
  lastReviewed: z.string().min(1),
  publicDistributionStatus: PublicDistributionStatusSchema,
  solutionValidationStatus: SolutionValidationStatusSchema,
};
export const KnapsackItemSchema = z.object({
  id: z.string().min(1),
  weight: z.number().int().positive(),
  value: z.number().int().nonnegative(),
});
export const KnapsackTracingProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('dp_table_tracing'),
  algorithm: z.literal('knapsack_01'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  capacity: z.number().int().nonnegative(),
  items: z.array(KnapsackItemSchema).min(1),
  tieBreaker: z.literal('exclude_on_equal'),
  requiredOutput: z.literal('complete_table_and_optimum'),
  indexing: z.literal('rows_and_capacities_start_at_zero'),
});
export const UnionFindOperationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('make_set'), element: z.string().min(1) }),
  z.object({ type: z.literal('find'), element: z.string().min(1) }),
  z.object({ type: z.literal('union'), left: z.string().min(1), right: z.string().min(1) }),
]);
export const UnionFindTracingProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('union_find_list_tracing'),
  algorithm: z.literal('union_find_linked_lists'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  elements: z.array(z.string().min(1)).min(1),
  operations: z.array(UnionFindOperationSchema).min(1),
  checkpoints: z.array(z.number().int().positive()).min(1),
  representation: z.literal('linked_lists_with_representative_pointer'),
  unionRule: z.literal('append_smaller_list_to_larger_list'),
  tieBreaker: z.literal('lexicographically_smaller_representative_is_smaller_set'),
  requiredOutput: z.literal('checkpoint_sets_representatives_next_size'),
});
export const TracingProblemSchema = z.discriminatedUnion('algorithm', [
  KnapsackTracingProblemSchema,
  UnionFindTracingProblemSchema,
]);
export const TracingStepSchema = z.object({
  index: z.number().int().nonnegative(),
  itemId: z.string().nullable(),
  values: z.array(z.number().int().nonnegative()),
  ties: z.array(z.number().int().nonnegative()),
});
export const TrainingHintSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(1).max(3),
  text: z.string().min(1),
});
export const TracingTrainerSchema = z.object({
  ...TrainingContentShape,
  title: z.string().min(1),
  algorithmName: z.string().min(1),
  problemClass: z.string().min(1),
  typicalExamTask: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  prerequisites: z.array(z.string()),
  runtime: z.string().min(1),
  dataStructures: z.array(z.string()),
  centralInvariant: z.string().min(1),
  commonMistakes: z.array(z.string()),
  historicalRelevance: z.string().min(1),
  intuition: z.string().min(1),
  correctnessIdea: z.string().min(1),
  failureConditions: z.string().min(1),
  steps: z.array(z.string()).min(1),
  problem: TracingProblemSchema,
  hints: z.array(TrainingHintSchema),
});
export const TracingRubricCriterionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  maxPoints: z.number().nonnegative(),
});
export const TracingRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    criteria: z.array(TracingRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumRatio: z.number().min(0).max(1),
      incompleteMaximumRatio: z.number().min(0).max(1),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Rubriksumme ist inkonsistent.',
      });
  });
export const TrainingFeedbackSchema = z.object({
  level: z.enum(['kurz', 'erklaerung', 'musterloesung']),
  step: z.number().int().nonnegative().nullable(),
  correct: z.boolean(),
  points: z.number().nonnegative(),
  message: z.string().min(1),
});
export const TrainingRecommendationSchema = z.object({
  code: z.enum([
    'repeat_full_task',
    'repeat_tie_breaker',
    'repeat_recurrence',
    'repeat_weighted_union',
    'repeat_representatives',
    'repeat_pointers',
    'repeat_proof_structure',
    'repeat_invariant_timing',
    'repeat_formula_notation',
    'read_foundations',
    'repeat_runtime',
    'repeat_recurrence_master_case',
    'repeat_recurrence_induction_step',
    'repeat_recurrence_parameters',
    'repeat_dp_state_definition',
    'repeat_dp_recurrence',
    'repeat_dp_design_full',
    'repeat_greedy_rule',
    'repeat_greedy_exchange_proof',
    'repeat_greedy_runtime',
    'next_level_locked',
    'learning_path_complete',
  ]),
  label: z.string().min(1),
  reason: z.string().min(1),
});
export const TracingTrainersFileSchema = z.array(TracingTrainerSchema);
export const TracingRubricsFileSchema = z.array(TracingRubricSchema);

export const ProofProgramSchema = z.object({
  name: z.string().min(1),
  input: z.string().min(1),
  output: z.string().min(1),
  pseudocode: z.array(z.string().min(1)).min(1),
  accumulator: z.string().min(1),
  loopIndex: z.string().min(1),
  loopStart: z.number().int(),
  loopEnd: z.string().min(1),
  loopBody: z.string().min(1),
  returnVariable: z.string().min(1),
});

export const ProofCanonicalSchema = z.object({
  canonicalProofVersion: z.string().min(1),
  formulaLabels: z.record(z.string(), z.string()),
  claim: z.object({ expression: z.string().min(1), text: z.string().min(1) }),
  invariant: z.object({
    timing: z.literal('before_iteration_i'),
    expression: z.string().min(1),
    range: z.string().min(1),
    text: z.string().min(1),
  }),
  initialization: z.string().min(1),
  hypothesis: z.string().min(1),
  preservation: z.string().min(1),
  termination: z.string().min(1),
  conclusion: z.string().min(1),
});

export const LoopInvariantProofProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('loop_invariant_proof'),
  algorithm: z.literal('loop_invariant_weighted_sum'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  proofType: z.literal('loop_invariant'),
  program: ProofProgramSchema,
  allowedSymbols: z.array(z.string().min(1)).min(1),
  requiredSections: z.array(z.string().min(1)).min(1),
  canonical: ProofCanonicalSchema,
});

export const ProofTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('proof'),
  title: z.string().min(1),
  proofFamily: z.string().min(1),
  problemClass: z.string().min(1),
  typicalExamTask: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  prerequisites: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  centralInvariant: z.string().min(1),
  commonMistakes: z.array(z.string()),
  historicalRelevance: z.string().min(1),
  intuition: z.string().min(1),
  correctnessIdea: z.string().min(1),
  failureConditions: z.string().min(1),
  steps: z.array(z.string()).min(1),
  problem: LoopInvariantProofProblemSchema,
  hints: z.array(TrainingHintSchema),
});

export const ProofRubricCriterionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  maxPoints: z.number().nonnegative(),
});

export const ProofRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('proof'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumRatio: z.number().min(0).max(1),
      incompleteMaximumRatio: z.number().min(0).max(1),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Beweisrubriksumme ist inkonsistent.',
      });
  });

export const ProofTrainersFileSchema = z.array(ProofTrainerSchema);
export const ProofRubricsFileSchema = z.array(ProofRubricSchema);

export const RecurrenceCanonicalSchema = z.object({
  kind: z.literal('recurrence_runtime_proof'),
  trainerKind: z.literal('proof'),
  problemId: z.string().min(1),
  canonicalProofVersion: z.string().min(1),
  closedForm: z.string().min(1),
  preflight: z.object({
    recurrence: z.string().min(1),
    baseCase: z.string().min(1),
    domain: z.string().min(1),
    requestedAsymptotic: z.string().min(1),
    requestedProof: z.string().min(1),
  }),
  parameters: z.object({
    a: z.string().min(1),
    b: z.string().min(1),
    f: z.string().min(1),
    criticalExponent: z.string().min(1),
    criticalFunction: z.string().min(1),
    masterCase: z.string().min(1),
    regularityWitness: z.string().min(1),
    asymptoticBound: z.string().min(1),
  }),
  recursionTree: z.object({
    height: z.string().min(1),
    nodesAtLevel: z.string().min(1),
    subproblemSizeAtLevel: z.string().min(1),
    costPerNodeAtLevel: z.string().min(1),
    levelCost: z.string().min(1),
    leafCount: z.string().min(1),
    totalCost: z.string().min(1),
    textAlternative: z.string().min(1),
  }),
  proof: z.object({
    claim: z.string().min(1),
    inductionMethod: z.string().min(1),
    baseCase: z.string().min(1),
    hypothesis: z.string().min(1),
    substitution: z.string().min(1),
    algebra: z.string().min(1),
    constantCondition: z.string().min(1),
    conclusion: z.string().min(1),
  }),
  master: z.object({
    a: z.number().int().positive(),
    b: z.number().int().positive(),
    f: z.string().min(1),
    criticalExponent: z.string().min(1),
    criticalFunction: z.string().min(1),
    comparison: z.enum(['smaller', 'equal', 'larger']),
    caseId: z.enum(['fall1', 'fall2', 'fall3', 'not_applicable']),
    result: z.string().min(1),
    regularityWitness: z.string().min(1),
  }),
});

export const RecurrenceProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('recurrence_runtime_proof'),
  algorithm: z.literal('master_theorem_case_1_runtime_induction'),
  contentOrigin: z.literal('official_exercise_solution'),
  recurrence: z.string().min(1),
  baseCase: z.string().min(1),
  domain: z.string().min(1),
  requestedDeliverable: z.string().min(1),
  canonical: RecurrenceCanonicalSchema,
});

export const RecurrenceVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mutation: z.string().min(1),
  productionStatus: z.enum(['locked_reference', 'practice_only', 'blocked']),
  sourcePolicy: z.string().min(1),
});

export const RecurrenceTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('proof'),
  title: z.string().min(1),
  proofFamily: z.string().min(1),
  problemClass: z.string().min(1),
  typicalExamTask: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  prerequisites: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  centralInvariant: z.string().min(1),
  commonMistakes: z.array(z.string()),
  historicalRelevance: z.string().min(1),
  intuition: z.string().min(1),
  correctnessIdea: z.string().min(1),
  failureConditions: z.string().min(1),
  steps: z.array(z.string()).min(1),
  problem: RecurrenceProblemSchema,
  variants: z.array(RecurrenceVariantSchema),
  hints: z.array(TrainingHintSchema),
});

export const RecurrenceRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('proof'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Rekurrenzrubriksumme ist inkonsistent.',
      });
  });

export const RecurrenceTrainersFileSchema = z.array(RecurrenceTrainerSchema);
export const RecurrenceRubricsFileSchema = z.array(RecurrenceRubricSchema);

const DpTextBlockSchema = z.record(z.string(), z.string().min(1));

export const DpInputDefinitionSchema = z.object({
  objects: z.array(z.string().min(1)).min(1),
  domain: z.string().min(1),
});
export const DpObjectiveSchema = z.object({
  direction: z.enum(['maximize', 'minimize', 'decide']),
  quantity: z.string().min(1),
});
export const DpStateDimensionSchema = z.object({
  name: z.string().min(1),
  meaning: z.string().min(1),
  range: z.string().min(1),
});
export const DpStateDefinitionSchema = z.object({
  tableName: z.string().min(1),
  dimensions: z.array(DpStateDimensionSchema).min(1),
  entryMeaning: z.string().min(1),
  optimizationDirection: z.string().min(1),
});
export const DpBaseCaseSchema = z.object({
  id: z.string().min(1),
  condition: z.string().min(1),
  value: z.string().min(1),
});
export const DpTransitionCaseSchema = z.object({
  id: z.string().min(1),
  condition: z.string().min(1),
  formula: z.string().min(1),
  predecessors: z.array(z.string().min(1)).min(1),
});
export const DpRecurrenceSchema = z.object({
  baseCases: z.array(DpBaseCaseSchema).min(1),
  transitionCases: z.array(DpTransitionCaseSchema).min(1),
  invalidStatePolicy: z.string().min(1),
});
export const DpEvaluationOrderSchema = z.object({
  dependencyDirection: z.string().min(1),
  order: z.string().min(1),
  outputCell: z.string().min(1),
});
export const DpAlgorithmAstSchema = z.object({
  allocation: z.string().min(1),
  initialization: z.string().min(1),
  loops: z.array(z.string().min(1)).min(1),
  returnStatement: z.string().min(1),
  renderedPseudocode: z.array(z.string().min(1)).min(1),
});
export const DpOutputDefinitionSchema = z.object({
  value: z.string().min(1),
  reconstructionRequired: z.boolean(),
  reconstruction: z.string().min(1),
});
export const DpCorrectnessProofSchema = z.object({
  claim: z.string().min(1),
  baseCase: z.string().min(1),
  inductionHypothesis: z.string().min(1),
  inductionStep: z.string().min(1),
  conclusion: z.string().min(1),
});
export const DpComplexityAnalysisSchema = z.object({
  stateCount: z.string().min(1),
  transitionCost: z.string().min(1),
  runtime: z.string().min(1),
  memory: z.string().min(1),
});
export const CanonicalDpSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: z.object({
    interpretation: DpTextBlockSchema,
    state: DpTextBlockSchema,
    recurrence: DpTextBlockSchema,
    evaluation: DpTextBlockSchema,
    algorithm: DpTextBlockSchema,
    proof: DpTextBlockSchema,
    complexity: DpTextBlockSchema,
  }),
  dpTable: z.array(z.array(z.number().int().nonnegative()).min(1)).min(1),
  optimalValue: z.number().int().nonnegative(),
  oracleValidationStatus: z.literal('brute_force_matches_dp'),
});
export const DpTrainingVariantSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  title: z.string().min(1),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  matrix: z.array(z.array(z.number().int().nonnegative()).min(2)).min(1),
  focus: z.string().min(1),
  canonicalSolution: CanonicalDpSolutionSchema,
});
export const DpDesignProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('dp_design'),
  algorithm: z.literal('mine_path_dynamic_programming'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  historicalExamTextIncluded: z.literal(false),
  input: DpInputDefinitionSchema,
  objective: DpObjectiveSchema,
  stateDefinition: DpStateDefinitionSchema,
  recurrence: DpRecurrenceSchema,
  evaluationOrder: DpEvaluationOrderSchema,
  algorithmAst: DpAlgorithmAstSchema,
  outputDefinition: DpOutputDefinitionSchema,
  correctnessProof: DpCorrectnessProofSchema,
  complexity: DpComplexityAnalysisSchema,
  canonicalSolution: CanonicalDpSolutionSchema,
  variants: z.array(DpTrainingVariantSchema).min(1),
});
export const DpDesignTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('design'),
  designFamily: z.literal('dynamic_programming'),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  examTaskNumbers: z.array(z.number().int().positive()).min(1),
  prerequisiteTopicIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)).min(1),
  supportedModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  difficultyLevels: z.array(z.string().min(1)).min(1),
  engineVersion: z.string().min(1),
  canonicalSolutionVersion: z.string().min(1),
  scoringModelVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  answerPayloadSchemaVersion: z.string().min(1),
  rendererType: z.literal('dp_design_mine'),
  lazyLoader: z.string().min(1),
  availabilityStatus: z.literal('available'),
  problem: DpDesignProblemSchema,
  hints: z.array(TrainingHintSchema),
});
export const DpDesignRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('design'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    examPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'DP-Entwurfsrubriksumme ist inkonsistent.',
      });
  });

export const DpDesignTrainersFileSchema = z.array(DpDesignTrainerSchema);
export const DpDesignRubricsFileSchema = z.array(DpDesignRubricSchema);
export const DpDesignProblemsFileSchema = z.array(DpDesignProblemSchema);
export const DpDesignVariantsFileSchema = z.array(DpTrainingVariantSchema);

export const GreedyStructuredAnswerSchema = z.object({
  interpretation: z.object({
    inputObjects: z.string().min(1),
    objective: z.string().min(1),
    constraints: z.string().min(1),
    output: z.string().min(1),
  }),
  greedyRule: z.object({
    sortingOrder: z.string().min(1),
    tieBreaker: z.string().min(1),
    decision: z.string().min(1),
    objectiveReason: z.string().min(1),
  }),
  algorithm: z.object({
    preprocessing: z.string().min(1),
    accumulator: z.string().min(1),
    loop: z.string().min(1),
    returnStatement: z.string().min(1),
  }),
  proof: z.object({
    claim: z.string().min(1),
    contradictionAssumption: z.string().min(1),
    exchangeStep: z.string().min(1),
    difference: z.string().min(1),
    conclusion: z.string().min(1),
  }),
  complexity: z.object({
    sorting: z.string().min(1),
    loop: z.string().min(1),
    total: z.string().min(1),
    memory: z.string().min(1),
  }),
});

export const CanonicalGreedySolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: GreedyStructuredAnswerSchema,
  sampleInput: z.array(z.number().int().positive()).min(1),
  sortedOrder: z.array(z.number().int().positive()).min(1),
  optimalValue: z.number().int().nonnegative(),
  oracleValidationStatus: z.literal('brute_force_matches_greedy'),
});

export const GreedyTrainingVariantSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  title: z.string().min(1),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  difficulties: z.array(z.number().int().positive()).min(1),
  focus: z.string().min(1),
  canonicalSolution: CanonicalGreedySolutionSchema,
});

export const GreedyDesignProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('greedy_design'),
  algorithm: z.literal('fitnesspunkte_sort_descending'),
  contentOrigin: z.literal('official_exam_solution'),
  historicalExamTextIncluded: z.literal(false),
  inputDescription: z.string().min(1),
  objective: z.string().min(1),
  greedyRule: z.string().min(1),
  exchangeProof: z.string().min(1),
  runtime: z.string().min(1),
  canonicalSolution: CanonicalGreedySolutionSchema,
  variants: z.array(GreedyTrainingVariantSchema).min(1),
});

export const GreedyDesignTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('design'),
  designFamily: z.literal('greedy'),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  examTaskNumbers: z.array(z.number().int().positive()).min(1),
  prerequisiteTopicIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)).min(1),
  supportedModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  difficultyLevels: z.array(z.string().min(1)).min(1),
  engineVersion: z.string().min(1),
  canonicalSolutionVersion: z.string().min(1),
  scoringModelVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  answerPayloadSchemaVersion: z.string().min(1),
  rendererType: z.literal('greedy_design_fitnesspunkte'),
  lazyLoader: z.string().min(1),
  availabilityStatus: z.literal('available'),
  problem: GreedyDesignProblemSchema,
  hints: z.array(TrainingHintSchema),
});

export const GreedyDesignRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('design'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    examPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Greedy-Entwurfsrubriksumme ist inkonsistent.',
      });
  });

export const GreedyDesignTrainersFileSchema = z.array(GreedyDesignTrainerSchema);
export const GreedyDesignRubricsFileSchema = z.array(GreedyDesignRubricSchema);
export const GreedyDesignProblemsFileSchema = z.array(GreedyDesignProblemSchema);
export const GreedyDesignVariantsFileSchema = z.array(GreedyTrainingVariantSchema);

export const DivideConquerStructuredAnswerSchema = z.object({
  interpretation: z.object({
    input: z.string().min(1),
    objective: z.string().min(1),
    output: z.string().min(1),
  }),
  decomposition: z.object({
    subproblem: z.string().min(1),
    baseCase: z.string().min(1),
    split: z.string().min(1),
  }),
  combine: z.object({
    leftCase: z.string().min(1),
    rightCase: z.string().min(1),
    crossCase: z.string().min(1),
    summary: z.string().min(1),
  }),
  algorithm: z.object({
    signature: z.string().min(1),
    recursiveCalls: z.string().min(1),
    returnValue: z.string().min(1),
  }),
  recurrence: z.object({
    equation: z.string().min(1),
    combineCost: z.string().min(1),
    runtime: z.string().min(1),
  }),
  proof: z.object({
    claim: z.string().min(1),
    inductionParameter: z.string().min(1),
    baseCase: z.string().min(1),
    inductionStep: z.string().min(1),
    caseAnalysis: z.string().min(1),
    conclusion: z.string().min(1),
  }),
});

export const DivideConquerResultSchema = z.object({
  maxDifference: z.number().int().nonnegative(),
  minimum: z.number().int(),
  maximum: z.number().int(),
});

export const CanonicalDivideConquerSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: DivideConquerStructuredAnswerSchema,
  sampleInput: z.array(z.number().int().positive()).min(1),
  result: DivideConquerResultSchema,
  oracleValidationStatus: z.literal('brute_force_matches_divide_conquer'),
});

export const DivideConquerTrainingVariantSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  title: z.string().min(1),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  values: z.array(z.number().int().positive()).min(1),
  focus: z.string().min(1),
  canonicalResult: DivideConquerResultSchema,
});

export const DivideConquerDesignProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('divide_conquer_design'),
  algorithm: z.literal('max_value_difference_divide_conquer'),
  contentOrigin: z.literal('official_exam_solution'),
  historicalExamTextIncluded: z.literal(false),
  inputDescription: z.string().min(1),
  objective: z.string().min(1),
  subproblem: z.string().min(1),
  split: z.string().min(1),
  combine: z.string().min(1),
  recurrence: z.string().min(1),
  runtime: z.string().min(1),
  proof: z.string().min(1),
  canonicalSolution: CanonicalDivideConquerSolutionSchema,
  variants: z.array(DivideConquerTrainingVariantSchema).min(1),
});

export const DivideConquerDesignTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('design'),
  designFamily: z.literal('divide_and_conquer'),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  examTaskNumbers: z.array(z.number().int().positive()).min(1),
  prerequisiteTopicIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)).min(1),
  supportedModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  difficultyLevels: z.array(z.string().min(1)).min(1),
  engineVersion: z.string().min(1),
  canonicalSolutionVersion: z.string().min(1),
  scoringModelVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  answerPayloadSchemaVersion: z.string().min(1),
  rendererType: z.literal('divide_conquer_max_difference'),
  lazyLoader: z.string().min(1),
  availabilityStatus: z.literal('available'),
  problem: DivideConquerDesignProblemSchema,
  hints: z.array(TrainingHintSchema),
});

export const DivideConquerDesignRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('design'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    examPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Divide-and-Conquer-Entwurfsrubriksumme ist inkonsistent.',
      });
  });

export const DivideConquerDesignTrainersFileSchema = z.array(DivideConquerDesignTrainerSchema);
export const DivideConquerDesignRubricsFileSchema = z.array(DivideConquerDesignRubricSchema);
export const DivideConquerDesignProblemsFileSchema = z.array(DivideConquerDesignProblemSchema);
export const DivideConquerDesignVariantsFileSchema = z.array(DivideConquerTrainingVariantSchema);

export const RbInsertionStructuredAnswerSchema = z.object({
  nilConvention: z.string().min(1),
  insertedKeys: z.string().min(1),
  fixupCases: z.string().min(1),
  finalTree: z.string().min(1),
  blackHeight: z.string().min(1),
  runtime: z.string().min(1),
  explanation: z.string().min(1),
});

export const RbTraceStepSchema = z.object({
  insertedKey: z.number().int(),
  action: z.string().min(1),
  caseLabel: z.enum(['root-black', 'case-1-recolor', 'case-2-rotate', 'case-3-rotate']),
  reason: z.string().min(1),
  tree: z.string().min(1),
});

export const CanonicalRbInsertionSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: RbInsertionStructuredAnswerSchema,
  insertedKeys: z.array(z.number().int()).min(1),
  finalTreeCompact: z.string().min(1),
  blackHeight: z.number().int().positive(),
  trace: z.array(RbTraceStepSchema).min(1),
  oracleValidationStatus: z.literal('rb_invariants_validated'),
});

export const RbInsertionTrainingVariantSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  title: z.string().min(1),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  insertedKeys: z.array(z.number().int()).min(1),
  focus: z.string().min(1),
  canonicalSolution: CanonicalRbInsertionSolutionSchema,
});

export const RbInsertionProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('red_black_tree_insertion'),
  algorithm: z.literal('rb_insert_fixup'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  historicalExamTextIncluded: z.literal(false),
  nilConvention: z.string().min(1),
  insertedKeys: z.array(z.number().int()).min(1),
  inputDescription: z.string().min(1),
  invariantChecklist: z.array(z.string().min(1)).min(1),
  rotationNotation: z.string().min(1),
  runtime: z.string().min(1),
  canonicalSolution: CanonicalRbInsertionSolutionSchema,
  variants: z.array(RbInsertionTrainingVariantSchema).min(1),
});

export const RbInsertionTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('tracing'),
  treeFamily: z.literal('red_black_tree'),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  examTaskNumbers: z.array(z.number().int().positive()).min(1),
  prerequisiteTopicIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)).min(1),
  supportedModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  difficultyLevels: z.array(z.string().min(1)).min(1),
  engineVersion: z.string().min(1),
  canonicalSolutionVersion: z.string().min(1),
  scoringModelVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  answerPayloadSchemaVersion: z.string().min(1),
  rendererType: z.literal('red_black_tree_insertion'),
  lazyLoader: z.string().min(1),
  availabilityStatus: z.literal('available'),
  problem: RbInsertionProblemSchema,
  hints: z.array(TrainingHintSchema),
});

export const RbInsertionRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('tracing'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    examPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Rot-Schwarz-Rubriksumme ist inkonsistent.',
      });
  });

export const RbInsertionTrainersFileSchema = z.array(RbInsertionTrainerSchema);
export const RbInsertionRubricsFileSchema = z.array(RbInsertionRubricSchema);
export const RbInsertionProblemsFileSchema = z.array(RbInsertionProblemSchema);
export const RbInsertionVariantsFileSchema = z.array(RbInsertionTrainingVariantSchema);

export const GraphDistanceSchema = z.number().int().nullable();
export const GraphMatrixSchema = z.array(z.array(GraphDistanceSchema).min(1)).min(1);
export const WeightedGraphEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  weight: z.number().int(),
});
export const FloydWarshallMatrixStepSchema = z.object({
  label: z.string().min(1),
  viaVertex: z.string().nullable(),
  matrix: GraphMatrixSchema,
});
export const FloydWarshallStructuredAnswerSchema = z.object({
  vertexOrder: z.string().min(1),
  d0: z.string().min(1),
  d1: z.string().min(1),
  d2: z.string().min(1),
  d3: z.string().min(1),
  d4: z.string().min(1),
  recurrence: z.string().min(1),
  runtime: z.string().min(1),
  explanation: z.string().min(1),
});
export const CanonicalFloydWarshallSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: FloydWarshallStructuredAnswerSchema,
  vertexOrder: z.array(z.string().min(1)).min(1),
  matrices: z.array(FloydWarshallMatrixStepSchema).min(1),
  recurrence: z.string().min(1),
  runtime: z.string().min(1),
  oracleValidationStatus: z.enum([
    'official_matrix_sequence_reproduced',
    'generated_oracle_verified',
  ]),
});
export const DijkstraTraceStepSchema = z.object({
  iteration: z.number().int().nonnegative(),
  markedVertex: z.string().nullable(),
  distances: z.record(z.string().min(1), GraphDistanceSchema),
  predecessors: z.record(z.string().min(1), z.string().nullable()),
  settled: z.array(z.string().min(1)),
  relaxations: z.array(z.string().min(1)),
});
export const DijkstraStructuredAnswerSchema = z.object({
  startVertex: z.string().min(1),
  markedOrder: z.string().min(1),
  distanceTable: z.string().min(1),
  predecessorTable: z.string().min(1),
  relaxationLog: z.string().min(1),
  runtime: z.string().min(1),
  explanation: z.string().min(1),
});
export const CanonicalDijkstraSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: DijkstraStructuredAnswerSchema,
  vertexOrder: z.array(z.string().min(1)).min(1),
  startVertex: z.string().min(1),
  steps: z.array(DijkstraTraceStepSchema).min(1),
  runtime: z.string().min(1),
  oracleValidationStatus: z.enum(['official_trace_table_reproduced', 'generated_oracle_verified']),
});
export const PrimTraceStepSchema = z.object({
  iteration: z.number().int().nonnegative(),
  selectedVertex: z.string().nullable(),
  selectedEdge: z.string().nullable(),
  keys: z.record(z.string().min(1), GraphDistanceSchema),
  parents: z.record(z.string().min(1), z.string().nullable()),
  treeVertices: z.array(z.string().min(1)),
  selectedEdges: z.array(z.string().min(1)),
  totalWeight: z.number().int().nonnegative(),
});
export const PrimStructuredAnswerSchema = z.object({
  startVertex: z.string().min(1),
  selectedVertices: z.string().min(1),
  selectedEdges: z.string().min(1),
  keyTable: z.string().min(1),
  parentTable: z.string().min(1),
  totalWeight: z.string().min(1),
  safeEdgeExplanation: z.string().min(1),
  runtime: z.string().min(1),
});
export const CanonicalPrimSolutionSchema = z.object({
  canonicalSolutionVersion: z.string().min(1),
  structuredAnswer: PrimStructuredAnswerSchema,
  vertexOrder: z.array(z.string().min(1)).min(1),
  startVertex: z.string().min(1),
  steps: z.array(PrimTraceStepSchema).min(1),
  mstEdges: z.array(z.string().min(1)).min(1),
  totalWeight: z.number().int().nonnegative(),
  runtime: z.string().min(1),
  oracleValidationStatus: z.enum(['official_edge_order_reproduced', 'generated_oracle_verified']),
  multipleMstPolicy: z.enum(['strict_no_ties', 'semantic_minimum_weight_equivalence']),
});
export const GraphTracingTrainingVariantSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  title: z.string().min(1),
  mode: z.enum(['learn', 'practice', 'exam', 'review']),
  graphKind: z.enum(['weighted_directed', 'weighted_undirected']),
  vertices: z.array(z.string().min(1)).min(1),
  edges: z.array(WeightedGraphEdgeSchema).min(1),
  focus: z.string().min(1),
  canonicalSolution: z.union([
    CanonicalFloydWarshallSolutionSchema,
    CanonicalDijkstraSolutionSchema,
    CanonicalPrimSolutionSchema,
  ]),
});
export const FloydWarshallProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('graph_algorithm_tracing'),
  algorithm: z.literal('floyd_warshall'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  historicalExamTextIncluded: z.literal(false),
  graphKind: z.literal('weighted_directed'),
  vertices: z.array(z.string().min(1)).min(1),
  edges: z.array(WeightedGraphEdgeSchema).min(1),
  vertexOrder: z.array(z.string().min(1)).min(1),
  infinitySymbol: z.literal('∞'),
  requiredOutput: z.literal('complete_initial_and_iteration_matrices'),
  recurrence: z.string().min(1),
  runtime: z.string().min(1),
  canonicalSolution: CanonicalFloydWarshallSolutionSchema,
  variants: z.array(GraphTracingTrainingVariantSchema).min(1),
});
export const DijkstraProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('graph_algorithm_tracing'),
  algorithm: z.literal('dijkstra'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  historicalExamTextIncluded: z.literal(false),
  graphKind: z.literal('weighted_directed'),
  vertices: z.array(z.string().min(1)).min(1),
  edges: z.array(WeightedGraphEdgeSchema).min(1),
  vertexOrder: z.array(z.string().min(1)).min(1),
  startVertex: z.string().min(1),
  infinitySymbol: z.literal('âˆž'),
  requiredOutput: z.literal('complete_distance_predecessor_and_marking_trace'),
  tiePolicy: z.string().min(1),
  runtime: z.string().min(1),
  canonicalSolution: CanonicalDijkstraSolutionSchema,
  variants: z.array(GraphTracingTrainingVariantSchema).min(1),
});
export const PrimProblemSchema = z.object({
  ...TrainingContentShape,
  taskType: z.literal('graph_algorithm_tracing'),
  algorithm: z.literal('prim'),
  contentOrigin: z.literal('source_aligned_generated_exercise'),
  historicalExamTextIncluded: z.literal(false),
  graphKind: z.literal('weighted_undirected'),
  vertices: z.array(z.string().min(1)).min(1),
  edges: z.array(WeightedGraphEdgeSchema).min(1),
  vertexOrder: z.array(z.string().min(1)).min(1),
  startVertex: z.string().min(1),
  requiredOutput: z.literal('complete_key_parent_edge_order_and_total_weight_trace'),
  tiePolicy: z.string().min(1),
  multipleMstPolicy: z.string().min(1),
  runtime: z.string().min(1),
  canonicalSolution: CanonicalPrimSolutionSchema,
  variants: z.array(GraphTracingTrainingVariantSchema).min(1),
});
export const GraphTracingProblemSchema = z.union([
  FloydWarshallProblemSchema,
  DijkstraProblemSchema,
  PrimProblemSchema,
]);
export const GraphTracingTrainerSchema = z.object({
  ...TrainingContentShape,
  trainerKind: z.literal('tracing'),
  graphFamily: z.enum(['shortest_paths', 'spanning_trees']),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  examTaskNumbers: z.array(z.number().int().positive()).min(1),
  prerequisiteTopicIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)).min(1),
  supportedModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  difficultyLevels: z.array(z.string().min(1)).min(1),
  engineVersion: z.string().min(1),
  canonicalSolutionVersion: z.string().min(1),
  scoringModelVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  answerPayloadSchemaVersion: z.string().min(1),
  rendererType: z.enum(['floyd_warshall_matrix', 'dijkstra_trace', 'prim_mst_trace']),
  lazyLoader: z.string().min(1),
  availabilityStatus: z.literal('available'),
  problem: GraphTracingProblemSchema,
  hints: z.array(TrainingHintSchema),
});
export const GraphTracingRubricSchema = z
  .object({
    ...TrainingContentShape,
    trainerKind: z.literal('tracing'),
    trainerId: z.string().min(1),
    maxPoints: z.number().positive(),
    examPoints: z.number().positive(),
    criteria: z.array(ProofRubricCriterionSchema).min(1),
    followUpErrorPolicy: z.string().min(1),
    caps: z.object({
      solutionRevealedMaximumPoints: z.number().min(0),
      hintsUsedMaximumPoints: z.number().min(0),
    }),
  })
  .superRefine((rubric, context) => {
    const sum = rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    if (sum !== rubric.maxPoints)
      context.addIssue({
        code: 'custom',
        path: ['maxPoints'],
        message: 'Graph-Tracing-Rubriksumme ist inkonsistent.',
      });
  });

export const GraphTracingTrainersFileSchema = z.array(GraphTracingTrainerSchema);
export const GraphTracingRubricsFileSchema = z.array(GraphTracingRubricSchema);
export const GraphTracingProblemsFileSchema = z.array(GraphTracingProblemSchema);
export const GraphTracingVariantsFileSchema = z.array(GraphTracingTrainingVariantSchema);

export const ExactPointSchema = z.object({
  numerator: z.number().int().nonnegative(),
  denominator: z.number().int().positive(),
});

export const ExamCoverageStatusSchema = z.enum([
  'metadata_only',
  'partially_supported',
  'fully_supported',
]);

export const ExamTimingPolicySchema = z.object({
  id: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  derivation: z.string().min(1),
  officialDuration: z.boolean(),
  warningThresholdMinutes: z.array(z.number().int().positive()),
  warningThresholdRatios: z.array(z.number().positive()),
});

export const ExamScoringPolicySchema = z.object({
  id: z.string().min(1),
  exactPoints: z.literal(true),
  showOfficialGrade: z.literal(false),
  classificationLabels: z.array(z.string().min(1)),
});

export const ExamSubmissionPolicySchema = z.object({
  id: z.string().min(1),
  irreversible: z.boolean(),
  gradeOnlyAfterFinalSubmission: z.literal(true),
  allowUnansweredSubmission: z.boolean(),
});

export const ExamRecoveryPolicySchema = z.object({
  id: z.string().min(1),
  autosave: z.literal(true),
  timerContinuesOnReload: z.literal(true),
  snapshotVersion: z.string().min(1),
  corruptedSnapshotPolicy: z.string().min(1),
});

export const ExamProfileCoverageSchema = z.object({
  profileId: z.string().min(1),
  title: z.string().min(1),
  slots: z.number().int().positive(),
  points: z.number().positive().nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  supportedSlots: z.array(z.number().int().positive()),
  partiallySupportedSlots: z.array(z.number().int().positive()),
  unsupportedSlots: z.array(z.number().int().positive()),
  coverageStatus: ExamCoverageStatusSchema,
  startable: z.boolean(),
  fullyGradable: z.boolean(),
  missingTrainerFamilies: z.array(z.string().min(1)),
  evidenceStatus: z.string().min(1),
  unknownFields: z.array(z.string().min(1)).optional(),
  sourceRefs: z.array(SourceReferenceSchema).optional(),
});

export const ExamProfileCoverageFileSchema = z.object({
  schemaVersion: z.string().min(1),
  phase: z.literal(7),
  auditedAt: z.string().min(1),
  profiles: z.array(ExamProfileCoverageSchema).min(1),
});

export const ExamTaskDefinitionSchema = z.object({
  id: z.string().min(1),
  taskSlotId: z.string().min(1),
  trainerId: z.string().min(1),
  adapterId: z.string().min(1),
  title: z.string().min(1),
  family: z.enum(['tracing', 'proof', 'design']),
  rendererType: z.string().min(1),
  examPoints: ExactPointSchema,
  internalMaxPoints: z.number().positive(),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
});

export const ExamTaskInstanceSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  lastReviewed: z.string().min(1),
  publicDistributionStatus: PublicDistributionStatusSchema,
  engineVersion: z.string().min(1),
  examPackageId: z.string().min(1),
  taskSlotId: z.string().min(1),
  trainerId: z.string().min(1),
  adapterId: z.string().min(1),
  examPoints: ExactPointSchema,
});

export const ExamPackageSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  verificationStatus: VerificationStatusSchema,
  lastReviewed: z.string().min(1),
  publicDistributionStatus: PublicDistributionStatusSchema,
  engineVersion: z.string().min(1),
  examPackageId: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  packageType: z.literal('generated_core_mock'),
  historicalExam: z.literal(false),
  sourceAligned: z.literal(true),
  fullyAutoGradable: z.literal(true),
  version: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalPoints: ExactPointSchema,
  taskSlots: z.array(ExamTaskDefinitionSchema).min(1),
  allowedAids: z.array(z.string().min(1)),
  pausePolicy: z.string().min(1),
  submissionPolicy: ExamSubmissionPolicySchema,
  recoveryPolicy: ExamRecoveryPolicySchema,
  timerPolicy: ExamTimingPolicySchema,
  scoringPolicy: ExamScoringPolicySchema,
  masteryPolicy: z.string().min(1),
  createdAt: z.string().min(1),
});

export const ExamTaskAdapterDefinitionSchema = z.object({
  id: z.string().min(1),
  trainerId: z.string().min(1),
  taskKind: z.string().min(1),
  version: z.string().min(1),
  supportedExamModes: z.array(z.enum(['strict_exam', 'practice_exam'])).min(1),
});

export const ExamResultTemplateSchema = z.object({
  id: z.string().min(1),
  sections: z.array(z.string().min(1)).min(1),
});

export const ExamPackagesFileSchema = z.array(ExamPackageSchema);
export const ExamTaskInstancesFileSchema = z.array(ExamTaskInstanceSchema);
export const ExamScoringPoliciesFileSchema = z.array(ExamScoringPolicySchema);

export const ExamSessionSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema),
  verificationStatus: VerificationStatusSchema,
  lastReviewed: z.string().min(1),
  duplicateGroupId: z.string().nullable(),
  examPackageId: z.string().min(1),
  examPackageVersion: z.string().min(1),
  profileId: z.string().nullable(),
  mode: z.enum(['strict_exam', 'practice_exam']),
  status: z.enum([
    'created',
    'briefing',
    'ready',
    'running',
    'recovery_required',
    'time_expired',
    'submitted',
    'graded',
    'archived',
    'invalid',
  ]),
  createdAt: z.string().min(1),
  startedAt: z.string().nullable(),
  deadlineAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  gradedAt: z.string().nullable(),
  currentTaskSlotId: z.string().min(1),
  reviewFlags: z.record(z.string(), z.boolean()),
  taskStates: z.record(z.string(), z.unknown()),
  taskPayloadVersions: z.record(z.string(), z.string()),
  timerWarningsShown: z.array(z.string()),
  recoveryMetadata: z.record(z.string(), z.unknown()),
  appVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
});

export const ExamSnapshotSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  snapshotVersion: z.string().min(1),
  checksum: z.string().min(1),
  savedAt: z.string().min(1),
  contentVersion: z.string().min(1),
  packageVersion: z.string().min(1),
  adapterVersions: z.record(z.string(), z.string()),
  taskPayloadVersions: z.record(z.string(), z.string()),
  payload: z.unknown(),
});

export const ExamResultSchema = z.object({
  id: z.string().min(1),
  resultId: z.string().min(1),
  sessionId: z.string().min(1),
  taskScores: z.array(z.unknown()),
  totalScore: ExactPointSchema,
  maximumScore: ExactPointSchema,
  timingAnalytics: z.record(z.string(), z.unknown()),
  errorClusters: z.array(z.unknown()),
  masteryImpact: z.record(z.string(), z.number().min(0).max(1)),
  recommendations: z.array(z.unknown()),
  generatedAt: z.string().min(1),
  scoringVersion: z.string().min(1),
});

export const ContentManifestSchema = z.object({
  schemaVersion: z.string(),
  contentVersion: z.string(),
  builtAt: z.string(),
  sourceCount: z.number().int().nonnegative(),
  topicCount: z.number().int().nonnegative(),
  examProfileCount: z.number().int().nonnegative(),
  fixtureCount: z.number().int().nonnegative(),
  trainerCount: z.number().int().nonnegative(),
  files: z.array(z.object({ name: z.string(), sha256: z.string().length(64) })),
});

export const ContentHealthSchema = z.object({
  schemaVersion: z.string(),
  contentVersion: z.string(),
  verificationStatusCounts: z.record(VerificationStatusSchema, z.number().int().nonnegative()),
  unresolvedConflictCount: z.number().int().nonnegative(),
  visualReviewRequiredCount: z.number().int().nonnegative(),
  brokenReferenceCount: z.number().int().nonnegative(),
  duplicateSafeExamFrequency: z.boolean(),
  phase0ValidationPassed: z.boolean(),
  phase0aValidationPassed: z.boolean(),
  indexedDbSchemaVersion: z.number().int().positive(),
  pwaVersion: z.string(),
});

export const SourceCitationFixtureSchema = z.object({
  ...Meta,
  title: z.string(),
  pageLabel: z.string(),
  authorityLabel: z.string(),
  evidenceType: EvidenceTypeSchema,
  conflictWarning: z.string().nullable(),
});

export const SafeSourcesFileSchema = z.array(SourceDocumentSchema);
export const TopicsIndexFileSchema = z.array(TopicSchema);
export const ExamProfilesFileSchema = z.array(ExamProfileSchema);
export const CitationFixturesFileSchema = z.array(SourceCitationFixtureSchema);

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type ExamProfile = z.infer<typeof ExamProfileSchema>;
export type SourceCitationFixture = z.infer<typeof SourceCitationFixtureSchema>;
export type PracticeAttempt = z.infer<typeof PracticeAttemptSchema>;
export type MasteryRecord = z.infer<typeof MasteryRecordSchema>;
export type ErrorRecord = z.infer<typeof ErrorRecordSchema>;
export type StudySession = z.infer<typeof StudySessionSchema>;
export type TracingProblem = z.infer<typeof TracingProblemSchema>;
export type KnapsackTracingProblem = z.infer<typeof KnapsackTracingProblemSchema>;
export type UnionFindTracingProblem = z.infer<typeof UnionFindTracingProblemSchema>;
export type TracingStep = z.infer<typeof TracingStepSchema>;
export type TracingTrainer = z.infer<typeof TracingTrainerSchema>;
export type TracingRubric = z.infer<typeof TracingRubricSchema>;
export type LoopInvariantProofProblem = z.infer<typeof LoopInvariantProofProblemSchema>;
export type ProofTrainer = z.infer<typeof ProofTrainerSchema>;
export type ProofRubric = z.infer<typeof ProofRubricSchema>;
export type RecurrenceTrainer = z.infer<typeof RecurrenceTrainerSchema>;
export type RecurrenceRubric = z.infer<typeof RecurrenceRubricSchema>;
export type DpDesignTrainer = z.infer<typeof DpDesignTrainerSchema>;
export type DpDesignRubric = z.infer<typeof DpDesignRubricSchema>;
export type DpDesignProblem = z.infer<typeof DpDesignProblemSchema>;
export type DpTrainingVariant = z.infer<typeof DpTrainingVariantSchema>;
export type GreedyDesignTrainer = z.infer<typeof GreedyDesignTrainerSchema>;
export type GreedyDesignRubric = z.infer<typeof GreedyDesignRubricSchema>;
export type GreedyDesignProblem = z.infer<typeof GreedyDesignProblemSchema>;
export type GreedyTrainingVariant = z.infer<typeof GreedyTrainingVariantSchema>;
export type DivideConquerDesignTrainer = z.infer<typeof DivideConquerDesignTrainerSchema>;
export type DivideConquerDesignRubric = z.infer<typeof DivideConquerDesignRubricSchema>;
export type DivideConquerDesignProblem = z.infer<typeof DivideConquerDesignProblemSchema>;
export type DivideConquerTrainingVariant = z.infer<typeof DivideConquerTrainingVariantSchema>;
export type RbInsertionTrainer = z.infer<typeof RbInsertionTrainerSchema>;
export type RbInsertionRubric = z.infer<typeof RbInsertionRubricSchema>;
export type RbInsertionProblem = z.infer<typeof RbInsertionProblemSchema>;
export type RbInsertionTrainingVariant = z.infer<typeof RbInsertionTrainingVariantSchema>;
export type GraphDistance = z.infer<typeof GraphDistanceSchema>;
export type GraphTracingTrainer = z.infer<typeof GraphTracingTrainerSchema>;
export type GraphTracingRubric = z.infer<typeof GraphTracingRubricSchema>;
export type GraphTracingProblem = z.infer<typeof GraphTracingProblemSchema>;
export type GraphTracingTrainingVariant = z.infer<typeof GraphTracingTrainingVariantSchema>;
export type FloydWarshallStructuredAnswer = z.infer<typeof FloydWarshallStructuredAnswerSchema>;
export type ExamPackage = z.infer<typeof ExamPackageSchema>;
export type ExamTaskDefinition = z.infer<typeof ExamTaskDefinitionSchema>;
export type ExamTaskInstance = z.infer<typeof ExamTaskInstanceSchema>;
export type ExamProfileCoverage = z.infer<typeof ExamProfileCoverageSchema>;
export type ExamSession = z.infer<typeof ExamSessionSchema>;
export type ExamSnapshot = z.infer<typeof ExamSnapshotSchema>;
export type ExamResult = z.infer<typeof ExamResultSchema>;
export type TrainingRecommendation = z.infer<typeof TrainingRecommendationSchema>;
