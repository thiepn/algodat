import { z } from 'zod';

export const DiagnosticModeSchema = z.enum(['learn', 'practice', 'diagnosis', 'exam']);

export const DiagnosticItemTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'true_false_reason',
  'matching',
  'ordering',
  'numeric_short_answer',
  'symbolic_choice',
  'table_completion',
  'code_recognition',
  'error_diagnosis',
  'algorithm_selection',
  'complexity_classification',
]);

export const DiagnosticDifficultySchema = z.enum(['leicht', 'mittel', 'schwer']);

export const DiagnosticErrorCodeSchema = z.enum([
  'asymptotic_dominance_error',
  'asymptotic_notation_error',
  'best_worst_case_confusion',
  'recurrence_form_error',
  'master_theorem_applicability_error',
  'master_theorem_case_error',
  'sorting_runtime_error',
  'sorting_stability_error',
  'sorting_in_place_error',
  'search_precondition_error',
  'data_structure_operation_error',
  'data_structure_runtime_error',
  'bst_vs_heap_confusion',
  'rb_tree_invariant_confusion',
  'union_find_operation_confusion',
  'graph_type_error',
  'graph_connectivity_error',
  'negative_edge_cycle_confusion',
  'shortest_path_algorithm_error',
  'shortest_path_precondition_error',
  'mst_shortest_path_confusion',
  'traversal_order_confusion',
  'greedy_dp_confusion',
  'greedy_dnc_confusion',
  'dp_dnc_confusion',
  'proof_method_error',
  'correctness_runtime_confusion',
  'necessary_sufficient_confusion',
  'code_recognition_error',
  'incomplete_answer',
  'over_selection_error',
  'under_selection_error',
  'manual_review_recommended',
]);

export const SourceRefSchema = z.object({
  sourceId: z.string().min(1),
  page: z.number().int().positive(),
  label: z.string().optional(),
});

export const FoundationCompetencySchema = z.object({
  competencyId: z.string().min(1),
  title: z.string().min(1),
  group: z.string().min(1),
  topicIds: z.array(z.string().min(1)).min(1),
  examTaskNumbers: z.array(z.number().int().min(1).max(9)).min(1),
  sourceRefs: z.array(SourceRefSchema).min(1),
  authorityLevel: z.number().int().min(1).max(4),
  canonicalFacts: z.array(z.string().min(1)).min(2),
  commonMisconceptions: z
    .array(
      z.object({
        misconceptionId: z.string().min(1),
        category: z.string().min(1),
        description: z.string().min(1),
        remediationTarget: z.string().min(1),
      }),
    )
    .min(1),
  supportedItemTypes: z.array(DiagnosticItemTypeSchema).min(1),
  relatedTrainerIds: z.array(z.string().min(1)),
  verificationStatus: z.enum(['official_verified', 'verified_against_official_source']),
  publicDistributionStatus: z.literal('public_safe'),
});

export const DiagnosticOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean().optional(),
  misconceptionId: z.string().optional(),
  distractorCategory: z.string().optional(),
  reasonIncorrect: z.string().optional(),
  diagnosticValue: z.string().optional(),
  remediationTarget: z.string().optional(),
  sourceRefs: z.array(SourceRefSchema).optional(),
});

export const DiagnosticPromptSchema = z.object({
  stem: z.string().min(1),
  instruction: z.string().min(1),
});

export const DiagnosticAnswerDefinitionSchema = z.object({
  correctOptionIds: z.array(z.string()).optional(),
  correctPairs: z.record(z.string(), z.string()).optional(),
  correctOrderIds: z.array(z.string()).optional(),
  numericAnswer: z.number().optional(),
  tolerance: z.number().nonnegative().optional(),
  correctAlgorithmId: z.string().optional(),
  complexityClass: z.string().optional(),
  correctReasonId: z.string().optional(),
});

export const DiagnosticRubricSchema = z.object({
  maxPoints: z.number().positive(),
  partialCredit: z.enum([
    'none',
    'per_correct_option',
    'per_pair',
    'adjacent_pairs',
    'per_component',
  ]),
});

export const DiagnosticItemSchema = z
  .object({
    id: z.string().min(1),
    schemaVersion: z.string().min(1),
    contentVersion: z.string().min(1),
    competencyIds: z.array(z.string().min(1)).min(1),
    topicIds: z.array(z.string().min(1)).min(1),
    examTaskNumbers: z.array(z.number().int().min(1).max(9)).min(1),
    difficulty: DiagnosticDifficultySchema,
    itemType: DiagnosticItemTypeSchema,
    prompt: DiagnosticPromptSchema,
    options: z.array(DiagnosticOptionSchema),
    answerDefinition: DiagnosticAnswerDefinitionSchema,
    rubric: DiagnosticRubricSchema,
    feedbackRules: z.array(
      z.object({
        id: z.string().min(1),
        level: z.number().int().min(1).max(6),
        message: z.string().min(1),
        misconceptionId: z.string().optional(),
      }),
    ),
    misconceptionIds: z.array(z.string().min(1)),
    relatedTrainerIds: z.array(z.string().min(1)),
    estimatedSeconds: z.number().int().positive(),
    sourceRefs: z.array(SourceRefSchema).min(1),
    verificationStatus: z.enum(['official_verified', 'verified_against_official_source']),
    publicDistributionStatus: z.literal('public_safe'),
    solutionValidationStatus: z.literal('deterministic_engine_verified'),
    engineVersion: z.string().min(1),
    lastReviewed: z.string().min(1),
  })
  .superRefine((item, context) => {
    const optionIds = new Set(item.options.map((option) => option.id));
    if (optionIds.size !== item.options.length)
      context.addIssue({ code: 'custom', path: ['options'], message: 'Options-IDs doppelt.' });
    for (const id of item.answerDefinition.correctOptionIds ?? []) {
      if (!optionIds.has(id))
        context.addIssue({
          code: 'custom',
          path: ['answerDefinition', 'correctOptionIds'],
          message: `Korrekte Option fehlt: ${id}`,
        });
    }
    if (
      item.itemType === 'single_choice' &&
      (item.answerDefinition.correctOptionIds ?? []).length !== 1
    )
      context.addIssue({
        code: 'custom',
        path: ['answerDefinition'],
        message: 'SingleChoice braucht genau eine korrekte Option.',
      });
    if (
      item.itemType === 'multiple_choice' &&
      (item.answerDefinition.correctOptionIds ?? []).length < 1
    )
      context.addIssue({
        code: 'custom',
        path: ['answerDefinition'],
        message: 'MultipleChoice braucht mindestens eine korrekte Option.',
      });
    for (const option of item.options) {
      if (!option.correct && option.misconceptionId && !option.reasonIncorrect)
        context.addIssue({
          code: 'custom',
          path: ['options', option.id],
          message: 'Distraktor braucht reasonIncorrect.',
        });
    }
  });

export const DiagnosticAnswerSchema = z.object({
  itemId: z.string().min(1),
  selectedOptionIds: z.array(z.string()).optional(),
  selectedPairs: z.record(z.string(), z.string()).optional(),
  orderedIds: z.array(z.string()).optional(),
  numericValue: z.union([z.number(), z.string()]).optional(),
  algorithmId: z.string().optional(),
  confidence: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  answeredAt: z.string().min(1),
});

export const DiagnosticErrorSchema = z.object({
  errorCode: DiagnosticErrorCodeSchema,
  itemId: z.string().min(1),
  competencyIds: z.array(z.string().min(1)),
  selectedAnswer: z.unknown(),
  expectedAnswer: z.unknown(),
  evidence: z.string().min(1),
  misconceptionId: z.string().min(1),
  sourceRefs: z.array(SourceRefSchema).min(1),
  severity: z.enum(['hinweis', 'mittel', 'schwer']),
  rootCauseErrorId: z.string().nullable(),
  masteryDimensions: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
  recommendedReviewActivity: z.string().min(1),
});

export const DiagnosticItemResultSchema = z.object({
  itemId: z.string().min(1),
  competencyIds: z.array(z.string().min(1)),
  itemType: DiagnosticItemTypeSchema,
  points: z.number().min(0),
  maxPoints: z.number().positive(),
  correct: z.boolean(),
  completeness: z.number().min(0).max(1),
  reasoningSelection: z.number().min(0).max(1),
  confidence: z.number().min(1).max(5),
  timeEfficiency: z.number().min(0).max(1),
  errors: z.array(DiagnosticErrorSchema),
});

export const DiagnosticCompetencyResultSchema = z.object({
  competencyId: z.string().min(1),
  title: z.string().min(1),
  points: z.number().min(0),
  maxPoints: z.number().min(0),
  scoreRatio: z.number().min(0).max(1),
  evidenceCount: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1),
  misconceptionIds: z.array(z.string().min(1)),
  relatedTrainerIds: z.array(z.string().min(1)),
});

export const DiagnosticRecommendationSchema = z.object({
  id: z.string().min(1),
  priority: z.number().int().positive(),
  label: z.string().min(1),
  reason: z.string().min(1),
  targetType: z.enum(['trainer', 'topic', 'review']),
  targetId: z.string().min(1),
});

export const DiagnosticSessionConfigSchema = z.object({
  mode: DiagnosticModeSchema,
  itemCount: z.number().int().positive(),
  seed: z.string().min(1),
  competencyTargets: z.array(z.string().min(1)),
  timeLimitMinutes: z.number().int().positive().nullable(),
});

export const DiagnosticSessionSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  sessionType: z.literal('foundations_diagnostic'),
  configVersion: z.string().min(1),
  itemBankVersion: z.string().min(1),
  masteryModelVersion: z.literal('mastery-v13'),
  seed: z.string().min(1),
  mode: DiagnosticModeSchema,
  competencyTargets: z.array(z.string().min(1)),
  itemIds: z.array(z.string().min(1)),
  currentItemIndex: z.number().int().nonnegative(),
  responses: z.record(z.string(), DiagnosticAnswerSchema),
  confidenceResponses: z.record(z.string(), z.number().min(1).max(5)),
  startedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  completedAt: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
  itemResults: z.array(DiagnosticItemResultSchema),
  competencyResults: z.array(DiagnosticCompetencyResultSchema),
  errors: z.array(DiagnosticErrorSchema),
  recommendations: z.array(DiagnosticRecommendationSchema),
  finalScore: z.object({
    points: z.number().min(0),
    maxPoints: z.number().min(0),
  }),
});

export const DiagnosticSessionTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mode: DiagnosticModeSchema,
  itemCount: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive().nullable(),
  competencyTargets: z.array(z.string().min(1)),
});

export const MisconceptionDefinitionSchema = z.object({
  misconceptionId: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  remediationTarget: z.string().min(1),
  sourceRefs: z.array(SourceRefSchema).min(1),
});

export const DiagnosticRecommendationRuleSchema = z.object({
  id: z.string().min(1),
  errorCode: DiagnosticErrorCodeSchema,
  targetType: z.enum(['trainer', 'topic', 'review']),
  targetId: z.string().min(1),
  label: z.string().min(1),
});

export const FoundationCompetenciesFileSchema = z.array(FoundationCompetencySchema);
export const DiagnosticItemsFileSchema = z.array(DiagnosticItemSchema);
export const DiagnosticSessionTemplatesFileSchema = z.array(DiagnosticSessionTemplateSchema);
export const DiagnosticMisconceptionsFileSchema = z.array(MisconceptionDefinitionSchema);
export const DiagnosticRecommendationRulesFileSchema = z.array(DiagnosticRecommendationRuleSchema);

export type FoundationCompetency = z.infer<typeof FoundationCompetencySchema>;
export type DiagnosticItem = z.infer<typeof DiagnosticItemSchema>;
export type DiagnosticAnswer = z.infer<typeof DiagnosticAnswerSchema>;
export type DiagnosticError = z.infer<typeof DiagnosticErrorSchema>;
export type DiagnosticItemResult = z.infer<typeof DiagnosticItemResultSchema>;
export type DiagnosticCompetencyResult = z.infer<typeof DiagnosticCompetencyResultSchema>;
export type DiagnosticRecommendation = z.infer<typeof DiagnosticRecommendationSchema>;
export type DiagnosticSession = z.infer<typeof DiagnosticSessionSchema>;
export type DiagnosticSessionConfig = z.infer<typeof DiagnosticSessionConfigSchema>;
