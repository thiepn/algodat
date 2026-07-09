import { studyOrchestratorContent } from '../../content/loaders/study-orchestrator';
import {
  buildReviewUnits,
  computeExamSlotReadiness,
  computeOverallExamReadiness,
  findDueReviews,
  regenerateStudyPlan,
  skipStudyActivity,
  snoozeStudyActivity,
  markStudyActivityCompleted,
  markStudyActivityStarted,
  type DailyStudyPlan,
  type StudyEvidence,
  type StudyPlanSettings,
} from '../../domain/study-orchestrator';
import {
  diagnosticSessionRepository,
  examResultRepository,
  masteryRepository,
  practiceAttemptRepository,
  reviewScheduleRepository,
  studyPlanRepository,
  studyPlanSettingsRepository,
} from '../../persistence/repositories';

const settingsId = 'study-plan-settings';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inferCompetenciesFromTrainer(trainerId: string | undefined) {
  if (!trainerId) return ['foundation-asymptotics'];
  return studyOrchestratorContent.activityCatalog
    .filter((activity) => activity.relatedTrainerId === trainerId)
    .flatMap((activity) => activity.targetCompetencyIds)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function inferTasksFromTrainer(trainerId: string | undefined) {
  if (!trainerId) return [1];
  return studyOrchestratorContent.activityCatalog
    .filter((activity) => activity.relatedTrainerId === trainerId)
    .flatMap((activity) => activity.examTaskNumbers)
    .filter((value, index, values) => values.indexOf(value) === index);
}

export function defaultStudyPlanSettings(now = new Date().toISOString()): StudyPlanSettings {
  return {
    id: settingsId,
    ...studyOrchestratorContent.defaultSettings,
    examDate: null,
    updatedAt: now,
  };
}

export async function loadStudyPlanSettings() {
  return (
    (await studyPlanSettingsRepository.get(settingsId)) ??
    defaultStudyPlanSettings(new Date().toISOString())
  );
}

export async function saveStudyPlanSettings(settings: StudyPlanSettings) {
  await studyPlanSettingsRepository.put({
    ...settings,
    id: settingsId,
    updatedAt: new Date().toISOString(),
  });
}

export async function collectLocalStudyEvidence(): Promise<StudyEvidence[]> {
  const [attempts, diagnosticSessions, examResults, masteryRecords] = await Promise.all([
    practiceAttemptRepository.list(),
    diagnosticSessionRepository.list(),
    examResultRepository.list(),
    masteryRepository.list(),
  ]);

  const trainerEvidence = attempts
    .filter((attempt) => attempt.status === 'completed')
    .map((attempt) => {
      const value = attempt as unknown as Record<string, unknown>;
      const trainerId = String(value.trainerId ?? '');
      const completedAt = String(
        value.completedAt ?? value.endedAt ?? value.updatedAt ?? new Date().toISOString(),
      );
      const scoreRatio =
        typeof value.scoreRatio === 'number'
          ? value.scoreRatio
          : typeof value.score === 'number' && typeof value.maxScore === 'number'
            ? value.score / Math.max(1, value.maxScore)
            : null;
      return {
        evidenceId: `attempt-${attempt.id}`,
        evidenceType: 'trainer_attempt' as const,
        createdAt: completedAt,
        competencyIds: inferCompetenciesFromTrainer(trainerId),
        examTaskNumbers: inferTasksFromTrainer(trainerId),
        scoreRatio,
        timed: value.mode === 'exam',
        hintsUsed: Boolean(value.hintsUsed),
        solutionRevealed: Boolean(value.solutionRevealed),
        errorCodes: Array.isArray(value.errorCodes) ? value.errorCodes.map(String) : [],
        misconceptionIds: [],
        confidence: null,
        sourceId: attempt.id,
      };
    });

  const diagnosticEvidence = diagnosticSessions
    .filter((session) => session.completedAt)
    .flatMap((session) =>
      (session.competencyResults ?? []).map((result) => ({
        evidenceId: `diagnostic-${session.id}-${result.competencyId}`,
        evidenceType: 'diagnostic_session' as const,
        createdAt: session.completedAt ?? session.updatedAt,
        competencyIds: [result.competencyId],
        examTaskNumbers:
          studyOrchestratorContent.examSlotMap
            .filter((slot) => slot.competencyIds.includes(result.competencyId))
            .map((slot) => slot.taskNumber) || [],
        scoreRatio: result.scoreRatio,
        timed:
          (session as unknown as { timeLimitMinutes?: number | null }).timeLimitMinutes !== null,
        hintsUsed: false,
        solutionRevealed: false,
        errorCodes: [],
        misconceptionIds: result.misconceptionIds,
        confidence: result.confidence,
        sourceId: session.id,
      })),
    );

  const examEvidence = examResults.flatMap((result) => {
    const value = result as unknown as Record<string, unknown>;
    const slotResults = Array.isArray(value.slotResults) ? value.slotResults : [];
    return slotResults.map((slotResult, index) => {
      const slotValue = slotResult as Record<string, unknown>;
      const taskNumber =
        typeof slotValue.taskNumber === 'number' ? slotValue.taskNumber : index + 1;
      return {
        evidenceId: `exam-${result.id}-${taskNumber}`,
        evidenceType: 'exam_result' as const,
        createdAt: String(value.createdAt ?? value.submittedAt ?? new Date().toISOString()),
        competencyIds: studyOrchestratorContent.examSlotMap.find(
          (slot) => slot.taskNumber === taskNumber,
        )?.competencyIds ?? ['foundation-asymptotics'],
        examTaskNumbers: [taskNumber],
        scoreRatio:
          typeof slotValue.scoreRatio === 'number'
            ? slotValue.scoreRatio
            : typeof slotValue.points === 'number' && typeof slotValue.maxPoints === 'number'
              ? slotValue.points / Math.max(1, slotValue.maxPoints)
              : null,
        timed: true,
        hintsUsed: false,
        solutionRevealed: false,
        errorCodes: Array.isArray(slotValue.errorCodes) ? slotValue.errorCodes.map(String) : [],
        misconceptionIds: [],
        confidence: null,
        sourceId: result.id,
      };
    });
  });

  const masteryEvidence = masteryRecords.map((record) => ({
    evidenceId: `mastery-${record.id}`,
    evidenceType: 'mastery_snapshot' as const,
    createdAt: record.updatedAt,
    competencyIds: [record.topicOrTaskId ?? 'foundation-asymptotics'],
    examTaskNumbers: inferTasksFromTrainer(record.topicOrTaskId),
    scoreRatio: null,
    timed: false,
    hintsUsed: false,
    solutionRevealed: false,
    errorCodes: [],
    misconceptionIds: [],
    confidence: null,
    sourceId: record.id,
  }));

  return [...trainerEvidence, ...diagnosticEvidence, ...examEvidence, ...masteryEvidence];
}

export async function generateAndStoreStudyPlan(reason = 'manuelle Regeneration') {
  const today = todayIso();
  const settings = await loadStudyPlanSettings();
  const evidence = await collectLocalStudyEvidence();
  const storedSchedules = await reviewScheduleRepository.list();
  const reviewSchedules = storedSchedules.length
    ? storedSchedules
    : buildReviewUnits(evidence, studyOrchestratorContent.spacedReviewPolicy, today);
  for (const schedule of reviewSchedules) await reviewScheduleRepository.put(schedule);
  const result = regenerateStudyPlan({
    today,
    settings,
    evidence,
    reviewSchedules,
    activities: studyOrchestratorContent.activityCatalog,
    slotMap: studyOrchestratorContent.examSlotMap,
    priorityPolicy: studyOrchestratorContent.priorityPolicy,
    readinessPolicy: studyOrchestratorContent.readinessPolicy,
    reviewPolicy: studyOrchestratorContent.spacedReviewPolicy,
    examDatePhasePolicy: studyOrchestratorContent.examDatePhasePolicy,
  });
  const dailyPlan = { ...result.dailyPlan, generationReason: reason };
  await studyPlanRepository.put(dailyPlan);
  await studyPlanRepository.put(result.weeklyPlan);
  return { ...result, dailyPlan };
}

export async function loadOrCreateTodayPlan() {
  const today = todayIso();
  const existing = (await studyPlanRepository.list()).find(
    (plan) => plan.planType === 'daily' && plan.planDate === today,
  ) as DailyStudyPlan | undefined;
  if (existing) {
    const evidence = await collectLocalStudyEvidence();
    const slotReadiness = computeExamSlotReadiness({
      today,
      evidence,
      slotMap: studyOrchestratorContent.examSlotMap,
      readinessPolicy: studyOrchestratorContent.readinessPolicy,
    });
    return {
      dailyPlan: existing,
      slotReadiness,
      overallReadiness: computeOverallExamReadiness(slotReadiness),
      dueReviews: findDueReviews(await reviewScheduleRepository.list(), today),
    };
  }
  const generated = await generateAndStoreStudyPlan('erster Tagesplan');
  return {
    dailyPlan: generated.dailyPlan,
    slotReadiness: generated.slotReadiness,
    overallReadiness: generated.overallReadiness,
    dueReviews: findDueReviews(await reviewScheduleRepository.list(), today),
  };
}

async function updatePlan(plan: DailyStudyPlan) {
  await studyPlanRepository.put(plan);
  return plan;
}

export async function startStudyActivity(plan: DailyStudyPlan, activityId: string) {
  return updatePlan(markStudyActivityStarted(plan, activityId));
}

export async function completeStudyActivity(plan: DailyStudyPlan, activityId: string) {
  return updatePlan(markStudyActivityCompleted(plan, activityId));
}

export async function skipStudyPlanActivity(plan: DailyStudyPlan, activityId: string) {
  return updatePlan(skipStudyActivity(plan, activityId));
}

export async function snoozeStudyPlanActivity(plan: DailyStudyPlan, activityId: string) {
  return updatePlan(snoozeStudyActivity(plan, activityId));
}

export async function loadWeeklyPlan() {
  const today = todayIso();
  const existing = (await studyPlanRepository.list()).find(
    (plan) => plan.planType === 'weekly' && plan.weekStart === today,
  );
  return existing ?? (await generateAndStoreStudyPlan('Wochenplan-Regeneration')).weeklyPlan;
}

export async function loadReadiness() {
  const today = todayIso();
  const evidence = await collectLocalStudyEvidence();
  const slotReadiness = computeExamSlotReadiness({
    today,
    evidence,
    slotMap: studyOrchestratorContent.examSlotMap,
    readinessPolicy: studyOrchestratorContent.readinessPolicy,
  });
  return {
    slotReadiness,
    overallReadiness: computeOverallExamReadiness(slotReadiness),
  };
}

export async function loadDueReviews() {
  return findDueReviews(await reviewScheduleRepository.list(), todayIso());
}
