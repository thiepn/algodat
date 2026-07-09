import { z } from 'zod';

export const StudyEvidenceTypeSchema = z.enum([
  'trainer_attempt',
  'diagnostic_session',
  'exam_result',
  'mastery_snapshot',
  'review_history',
]);

export const StudyActivityTypeSchema = z.enum([
  'deep_trainer_learning',
  'deep_trainer_practice',
  'deep_trainer_exam',
  'targeted_review',
  'diagnostic_quickcheck',
  'diagnostic_topic',
  'diagnostic_standard',
  'error_replay',
  'exam_package',
  'exam_task_retry',
  'concept_review',
  'rest_or_buffer',
]);

export const StudyActivityStatusSchema = z.enum([
  'planned',
  'started',
  'completed',
  'skipped',
  'snoozed',
  'unavailable',
  'replaced',
]);

export const ReadinessBandSchema = z.enum([
  'insufficient_evidence',
  'foundation_missing',
  'developing',
  'mostly_stable',
  'exam_ready',
  'stale_evidence',
]);

export const CoverageStatusSchema = z.enum([
  'strong',
  'partial',
  'narrow_family_only',
  'diagnostic_only',
  'unsupported',
]);

export const StudyPlanPhaseSchema = z.enum([
  'continuous',
  'foundation_phase',
  'consolidation_phase',
  'exam_practice_phase',
  'final_review_phase',
  'past_exam_date',
]);

const PublicStatusSchema = z.literal('public_safe');
const AvailabilityStatusSchema = z.enum(['available', 'blocked', 'planned']);

export const StudyActivityDefinitionSchema = z.object({
  activityId: z.string().min(1),
  activityType: StudyActivityTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  targetCompetencyIds: z.array(z.string()).min(1),
  targetMasteryDimensions: z.array(z.string()).min(1),
  examTaskNumbers: z.array(z.number().int().min(1).max(9)),
  relatedTrainerId: z.string().nullable(),
  relatedDiagnosticTemplateId: z.string().nullable(),
  relatedExamPackageId: z.string().nullable(),
  estimatedMinutes: z.number().int().positive(),
  minimumMinutes: z.number().int().positive(),
  maximumMinutes: z.number().int().positive(),
  difficulty: z.enum(['foundation', 'practice', 'exam', 'review', 'buffer']),
  prerequisiteCompetencyIds: z.array(z.string()),
  evidenceRequirements: z.array(StudyEvidenceTypeSchema),
  completionDefinition: z.string().min(1),
  route: z.string().min(1),
  publicDistributionStatus: PublicStatusSchema,
  availabilityStatus: AvailabilityStatusSchema,
});

export const StudyActivityCatalogFileSchema = z.array(StudyActivityDefinitionSchema).min(1);

export const ExamSlotCompetencyMapSchema = z.object({
  slotId: z.string().min(1),
  taskNumber: z.number().int().min(1).max(9),
  title: z.string().min(1),
  typicalPoints: z.number().positive(),
  supportedFamilies: z.array(z.string()).min(1),
  trainerIds: z.array(z.string()),
  competencyIds: z.array(z.string()).min(1),
  masteryDimensions: z.array(z.string()).min(1),
  requiredEvidenceTypes: z.array(StudyEvidenceTypeSchema).min(1),
  optionalEvidenceTypes: z.array(StudyEvidenceTypeSchema),
  unsupportedVariants: z.array(z.string()),
  coverageStatus: CoverageStatusSchema,
  activityIds: z.array(z.string()).min(1),
});

export const ExamSlotCompetencyMapFileSchema = z.array(ExamSlotCompetencyMapSchema).min(9);

export const StudyPriorityPolicySchema = z.object({
  policyVersion: z.string().min(1),
  weights: z.object({
    masteryDeficit: z.number(),
    examSlotWeight: z.number(),
    reviewDueUrgency: z.number(),
    repeatedErrorWeight: z.number(),
    confidenceMismatchWeight: z.number(),
    evidenceRecencyWeight: z.number(),
    unsupportedCoveragePenalty: z.number(),
    prerequisitePenalty: z.number(),
    timeFit: z.number(),
    activityVariety: z.number(),
    recentRepetitionPenalty: z.number(),
    userPinnedPriority: z.number(),
    examDateUrgency: z.number(),
  }),
  tieBreakers: z.array(z.enum(['activityType', 'examTaskNumber', 'activityId'])).min(1),
});

export const SpacedReviewPolicySchema = z.object({
  policyVersion: z.string().min(1),
  intervalDays: z.array(z.number().int().positive()).min(5),
  modifiers: z.object({
    wrong: z.number(),
    correctWithHint: z.number(),
    correctWithoutHint: z.number(),
    repeatedExamCorrect: z.number(),
    wrongHighConfidence: z.number(),
    correctLowConfidence: z.number(),
  }),
});

export const ReadinessPolicySchema = z.object({
  policyVersion: z.string().min(1),
  thresholds: z.object({
    foundationMissingBelow: z.number().min(0).max(1),
    developingBelow: z.number().min(0).max(1),
    mostlyStableBelow: z.number().min(0).max(1),
    examReadyAt: z.number().min(0).max(1),
    staleAfterDays: z.number().int().positive(),
    minEvidenceForReady: z.number().int().positive(),
  }),
  caps: z.object({
    diagnosticOnlyMaxBand: ReadinessBandSchema,
    noTimedEvidenceMaxBand: ReadinessBandSchema,
    repeatedErrorMaxBand: ReadinessBandSchema,
    unsupportedCoverageMaxBand: ReadinessBandSchema,
  }),
});

export const ExamDatePhasePolicySchema = z.object({
  policyVersion: z.string().min(1),
  phases: z.array(
    z.object({
      phase: StudyPlanPhaseSchema,
      minDaysUntilExam: z.number().int().nullable(),
      maxDaysUntilExam: z.number().int().nullable(),
      priorityMultiplier: z.number().positive(),
      description: z.string().min(1),
    }),
  ),
});

export const StudyPlanDefaultSettingsSchema = z.object({
  settingsVersion: z.string().min(1),
  dailyMinuteBudget: z.number().int().positive(),
  maxSingleSessionMinutes: z.number().int().positive(),
  learningDaysPerWeek: z.number().int().min(1).max(7),
  preferredWeekdays: z.array(z.number().int().min(1).max(7)).min(1),
  preferredModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  focusMode: z.enum(['exam_breadth', 'weaknesses', 'balanced']),
  plannedMockExams: z.number().int().min(0),
  bufferDays: z.number().int().min(0),
  weekStartsOn: z.number().int().min(1).max(7),
  timezone: z.string().min(1),
});

export const StudyOrchestratorConfigBundleSchema = z.object({
  activityCatalog: StudyActivityCatalogFileSchema,
  examSlotMap: ExamSlotCompetencyMapFileSchema,
  priorityPolicy: StudyPriorityPolicySchema,
  spacedReviewPolicy: SpacedReviewPolicySchema,
  readinessPolicy: ReadinessPolicySchema,
  examDatePhasePolicy: ExamDatePhasePolicySchema,
  defaultSettings: StudyPlanDefaultSettingsSchema,
});

export const StudyEvidenceSchema = z.object({
  evidenceId: z.string(),
  evidenceType: StudyEvidenceTypeSchema,
  createdAt: z.string(),
  competencyIds: z.array(z.string()),
  examTaskNumbers: z.array(z.number().int().min(1).max(9)),
  scoreRatio: z.number().min(0).max(1).nullable(),
  timed: z.boolean(),
  hintsUsed: z.boolean(),
  solutionRevealed: z.boolean(),
  errorCodes: z.array(z.string()),
  misconceptionIds: z.array(z.string()),
  confidence: z.number().min(0).max(1).nullable(),
  sourceId: z.string(),
});

export const ReviewScheduleSchema = z.object({
  id: z.string(),
  reviewUnitId: z.string(),
  competencyIds: z.array(z.string()),
  errorCodes: z.array(z.string()),
  sourceEvidenceIds: z.array(z.string()),
  lastReviewedAt: z.string(),
  nextDueAt: z.string(),
  intervalLevel: z.number().int().min(0),
  successCount: z.number().int().min(0),
  failureCount: z.number().int().min(0),
  lastOutcome: z.enum(['correct', 'wrong', 'mixed', 'manual']),
  policyVersion: z.string(),
});

export const StudyActivityReasonSchema = z.object({
  factor: z.string(),
  label: z.string(),
  detail: z.string(),
  contribution: z.number(),
});

export const StudyActivityCandidateSchema = z.object({
  activityId: z.string(),
  activityType: StudyActivityTypeSchema,
  title: z.string(),
  route: z.string(),
  targetCompetencyIds: z.array(z.string()),
  examTaskNumbers: z.array(z.number().int().min(1).max(9)),
  estimatedMinutes: z.number().int().positive(),
  priority: z.number(),
  reasons: z.array(StudyActivityReasonSchema),
  blockedReasons: z.array(z.string()),
  status: StudyActivityStatusSchema,
});

export const ExamSlotReadinessSchema = z.object({
  slotId: z.string(),
  taskNumber: z.number().int().min(1).max(9),
  title: z.string(),
  readinessBand: ReadinessBandSchema,
  readinessScore: z.number().min(0).max(1),
  evidenceLevel: z.enum(['none', 'diagnostic', 'practice', 'timed']),
  coverageStatus: CoverageStatusSchema,
  blockingGaps: z.array(z.string()),
  recommendedActivities: z.array(z.string()),
  components: z.object({
    masteryLevel: z.number().min(0).max(1),
    evidenceStrength: z.number().min(0).max(1),
    evidenceRecency: z.number().min(0).max(1),
    timedPerformance: z.number().min(0).max(1),
    transferCoverage: z.number().min(0).max(1),
    errorStability: z.number().min(0).max(1),
    completionReliability: z.number().min(0).max(1),
  }),
});

export const OverallExamReadinessSchema = z.object({
  weightedReadiness: z.number().min(0).max(1),
  coverageCompleteness: z.number().min(0).max(1),
  weakestSlot: z.string(),
  staleSlotCount: z.number().int().min(0),
  insufficientEvidenceSlotCount: z.number().int().min(0),
  timedExamEvidence: z.boolean(),
  overallBand: ReadinessBandSchema,
});

export const DailyStudyPlanSchema = z.object({
  id: z.string(),
  planId: z.string(),
  planType: z.literal('daily'),
  planDate: z.string(),
  timezone: z.string(),
  settingsVersion: z.string(),
  policyVersion: z.string(),
  masteryModelVersion: z.literal('mastery-v14'),
  evidenceFingerprint: z.string(),
  generatedAt: z.string(),
  generationReason: z.string(),
  activities: z.array(StudyActivityCandidateSchema),
  totalEstimatedMinutes: z.number().int().min(0),
  completionState: z.enum(['open', 'partially_completed', 'completed']),
  dueReviewCount: z.number().int().min(0),
  mainGoal: z.string(),
});

export const WeeklyStudyPlanSchema = z.object({
  id: z.string(),
  planId: z.string(),
  planType: z.literal('weekly'),
  weekStart: z.string(),
  timezone: z.string(),
  days: z.array(DailyStudyPlanSchema),
  totalEstimatedMinutes: z.number().int().min(0),
  policyVersion: z.string(),
  evidenceFingerprint: z.string(),
  generatedAt: z.string(),
});

export const StudyPlanSettingsSchema = z.object({
  id: z.literal('study-plan-settings'),
  settingsVersion: z.string(),
  examDate: z.string().nullable(),
  dailyMinuteBudget: z.number().int().positive(),
  maxSingleSessionMinutes: z.number().int().positive(),
  learningDaysPerWeek: z.number().int().min(1).max(7),
  preferredWeekdays: z.array(z.number().int().min(1).max(7)).min(1),
  preferredModes: z.array(z.enum(['learn', 'practice', 'exam', 'review'])).min(1),
  focusMode: z.enum(['exam_breadth', 'weaknesses', 'balanced']),
  plannedMockExams: z.number().int().min(0),
  bufferDays: z.number().int().min(0),
  weekStartsOn: z.number().int().min(1).max(7),
  timezone: z.string(),
  updatedAt: z.string(),
});

export const StudyPlanGenerationInputSchema = z.object({
  today: z.string(),
  settings: StudyPlanSettingsSchema,
  evidence: z.array(StudyEvidenceSchema),
  reviewSchedules: z.array(ReviewScheduleSchema),
  activities: z.array(StudyActivityDefinitionSchema),
  slotMap: z.array(ExamSlotCompetencyMapSchema),
  priorityPolicy: StudyPriorityPolicySchema,
  readinessPolicy: ReadinessPolicySchema,
  reviewPolicy: SpacedReviewPolicySchema,
  examDatePhasePolicy: ExamDatePhasePolicySchema,
});

export type StudyEvidence = z.infer<typeof StudyEvidenceSchema>;
export type StudyEvidenceType = z.infer<typeof StudyEvidenceTypeSchema>;
export type StudyActivityDefinition = z.infer<typeof StudyActivityDefinitionSchema>;
export type StudyActivityCandidate = z.infer<typeof StudyActivityCandidateSchema>;
export type StudyActivityReason = z.infer<typeof StudyActivityReasonSchema>;
export type StudyActivityStatus = z.infer<typeof StudyActivityStatusSchema>;
export type DailyStudyPlan = z.infer<typeof DailyStudyPlanSchema>;
export type WeeklyStudyPlan = z.infer<typeof WeeklyStudyPlanSchema>;
export type StudyPlanSettings = z.infer<typeof StudyPlanSettingsSchema>;
export type StudyPlanGenerationInput = z.infer<typeof StudyPlanGenerationInputSchema>;
export type ExamSlotReadiness = z.infer<typeof ExamSlotReadinessSchema>;
export type OverallExamReadiness = z.infer<typeof OverallExamReadinessSchema>;
export type ReadinessBand = z.infer<typeof ReadinessBandSchema>;
export type ReviewSchedule = z.infer<typeof ReviewScheduleSchema>;
export type StudyPriorityPolicy = z.infer<typeof StudyPriorityPolicySchema>;
export type SpacedReviewPolicy = z.infer<typeof SpacedReviewPolicySchema>;
export type ReadinessPolicy = z.infer<typeof ReadinessPolicySchema>;
export type ExamDatePhasePolicy = z.infer<typeof ExamDatePhasePolicySchema>;
export type StudyPlanDefaultSettings = z.infer<typeof StudyPlanDefaultSettingsSchema>;
