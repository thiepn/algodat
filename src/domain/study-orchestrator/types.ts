import type {
  DailyStudyPlan,
  ExamSlotReadiness,
  OverallExamReadiness,
  WeeklyStudyPlan,
} from './schemas';

export type {
  DailyStudyPlan,
  ExamDatePhasePolicy,
  ExamSlotReadiness,
  OverallExamReadiness,
  ReadinessBand,
  ReadinessPolicy,
  ReviewSchedule,
  SpacedReviewPolicy,
  StudyActivityCandidate,
  StudyActivityDefinition,
  StudyActivityReason,
  StudyActivityStatus,
  StudyEvidence,
  StudyEvidenceType,
  StudyPlanDefaultSettings,
  StudyPlanGenerationInput,
  StudyPlanSettings,
  StudyPriorityPolicy,
  WeeklyStudyPlan,
} from './schemas';

export interface StudyPlanGenerationResult {
  dailyPlan: DailyStudyPlan;
  weeklyPlan: WeeklyStudyPlan;
  slotReadiness: ExamSlotReadiness[];
  overallReadiness: OverallExamReadiness;
}

export interface StudyPlanError {
  code: string;
  message: string;
}
