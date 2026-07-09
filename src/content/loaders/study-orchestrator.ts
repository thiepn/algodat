import examDatePhasePolicyData from '../generated/exam-date-phase-policy.json';
import examSlotCompetencyMapData from '../generated/exam-slot-competency-map.json';
import readinessPolicyData from '../generated/readiness-policy.json';
import spacedReviewPolicyData from '../generated/spaced-review-policy.json';
import studyActivityCatalogData from '../generated/study-activity-catalog.json';
import studyPlanDefaultSettingsData from '../generated/study-plan-default-settings.json';
import studyPriorityPolicyData from '../generated/study-priority-policy.json';
import {
  ExamDatePhasePolicySchema,
  ExamSlotCompetencyMapFileSchema,
  ReadinessPolicySchema,
  SpacedReviewPolicySchema,
  StudyActivityCatalogFileSchema,
  StudyPlanDefaultSettingsSchema,
  StudyPriorityPolicySchema,
} from '../../domain/study-orchestrator/schemas';

export const studyOrchestratorContent = {
  activityCatalog: StudyActivityCatalogFileSchema.parse(studyActivityCatalogData),
  examSlotMap: ExamSlotCompetencyMapFileSchema.parse(examSlotCompetencyMapData),
  priorityPolicy: StudyPriorityPolicySchema.parse(studyPriorityPolicyData),
  spacedReviewPolicy: SpacedReviewPolicySchema.parse(spacedReviewPolicyData),
  readinessPolicy: ReadinessPolicySchema.parse(readinessPolicyData),
  examDatePhasePolicy: ExamDatePhasePolicySchema.parse(examDatePhasePolicyData),
  defaultSettings: StudyPlanDefaultSettingsSchema.parse(studyPlanDefaultSettingsData),
};

export type StudyOrchestratorContent = typeof studyOrchestratorContent;
