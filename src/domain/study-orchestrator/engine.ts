import {
  DailyStudyPlanSchema,
  ExamSlotReadinessSchema,
  OverallExamReadinessSchema,
  ReviewScheduleSchema,
  StudyActivityCandidateSchema,
  StudyEvidenceSchema,
  StudyPlanGenerationInputSchema,
  WeeklyStudyPlanSchema,
  type DailyStudyPlan,
  type ExamDatePhasePolicy,
  type ExamSlotReadiness,
  type OverallExamReadiness,
  type ReadinessBand,
  type ReadinessPolicy,
  type ReviewSchedule,
  type SpacedReviewPolicy,
  type StudyActivityCandidate,
  type StudyActivityDefinition,
  type StudyEvidence,
  type StudyPlanGenerationInput,
  type StudyPlanSettings,
  type WeeklyStudyPlan,
} from './schemas';

const bandRank: Record<ReadinessBand, number> = {
  insufficient_evidence: 0,
  foundation_missing: 1,
  developing: 2,
  stale_evidence: 2,
  mostly_stable: 3,
  exam_ready: 4,
};

function stableHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 999;
  return Math.floor((to - from) / 86_400_000);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function capBand(band: ReadinessBand, cap: ReadinessBand): ReadinessBand {
  return bandRank[band] <= bandRank[cap] ? band : cap;
}

function bandFromScore(
  score: number,
  evidenceCount: number,
  policy: ReadinessPolicy,
): ReadinessBand {
  if (evidenceCount === 0) return 'insufficient_evidence';
  if (score < policy.thresholds.foundationMissingBelow) return 'foundation_missing';
  if (score < policy.thresholds.developingBelow) return 'developing';
  if (score < policy.thresholds.mostlyStableBelow) return 'mostly_stable';
  return 'exam_ready';
}

export function normalizeStudyEvidence(evidence: StudyEvidence[]): StudyEvidence[] {
  const byId = new Map<string, StudyEvidence>();
  for (const entry of evidence) byId.set(entry.evidenceId, StudyEvidenceSchema.parse(entry));
  return [...byId.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId, 'de'));
}

export function collectStudyEvidence(input: { evidence?: StudyEvidence[] }): StudyEvidence[] {
  return normalizeStudyEvidence(input.evidence ?? []);
}

export function computeEvidenceFingerprint(
  evidence: StudyEvidence[],
  settings?: StudyPlanSettings,
) {
  const normalized = normalizeStudyEvidence(evidence).map((entry) => ({
    evidenceId: entry.evidenceId,
    evidenceType: entry.evidenceType,
    createdAt: entry.createdAt,
    competencyIds: entry.competencyIds,
    examTaskNumbers: entry.examTaskNumbers,
    scoreRatio: entry.scoreRatio,
    timed: entry.timed,
    hintsUsed: entry.hintsUsed,
    solutionRevealed: entry.solutionRevealed,
    errorCodes: entry.errorCodes,
    misconceptionIds: entry.misconceptionIds,
    confidence: entry.confidence,
  }));
  return `fp-${stableHash(JSON.stringify({ normalized, settings }))}`;
}

export function computeExamSlotReadiness(
  input: Pick<StudyPlanGenerationInput, 'today' | 'evidence' | 'slotMap' | 'readinessPolicy'>,
): ExamSlotReadiness[] {
  return input.slotMap.map((slot) => {
    const relevant = input.evidence.filter(
      (entry) =>
        entry.examTaskNumbers.includes(slot.taskNumber) ||
        entry.competencyIds.some((id) => slot.competencyIds.includes(id)),
    );
    const scored = relevant.filter((entry) => entry.scoreRatio !== null);
    const averageScore = scored.length
      ? scored.reduce((sum, entry) => sum + (entry.scoreRatio ?? 0), 0) / scored.length
      : 0;
    const latest = relevant.map((entry) => entry.createdAt).sort((a, b) => b.localeCompare(a))[0];
    const daysOld = latest ? Math.max(0, daysBetween(latest, input.today)) : 999;
    const timedEvidence = relevant.some((entry) => entry.timed);
    const diagnosticOnly =
      relevant.length > 0 && relevant.every((entry) => entry.evidenceType === 'diagnostic_session');
    const repeatedErrors = relevant.flatMap((entry) => entry.errorCodes);
    const hasRepeatedError = repeatedErrors.some(
      (error, index) => repeatedErrors.indexOf(error) !== index,
    );
    const evidenceStrength = clamp01(
      relevant.length / input.readinessPolicy.thresholds.minEvidenceForReady,
    );
    const evidenceRecency = clamp01(1 - daysOld / input.readinessPolicy.thresholds.staleAfterDays);
    const timedPerformance = timedEvidence
      ? clamp01(
          relevant
            .filter((entry) => entry.timed && entry.scoreRatio !== null)
            .reduce(
              (sum, entry, _index, values) => sum + (entry.scoreRatio ?? 0) / values.length,
              0,
            ),
        )
      : 0;
    const transferCoverage =
      slot.coverageStatus === 'strong'
        ? 1
        : slot.coverageStatus === 'partial'
          ? 0.7
          : slot.coverageStatus === 'narrow_family_only'
            ? 0.5
            : slot.coverageStatus === 'diagnostic_only'
              ? 0.3
              : 0;
    const errorStability = hasRepeatedError ? 0.25 : 1;
    const completionReliability = clamp01(
      relevant.filter((entry) => entry.scoreRatio !== null && (entry.scoreRatio ?? 0) > 0).length /
        Math.max(1, relevant.length),
    );
    const readinessScore = clamp01(
      averageScore * 0.34 +
        evidenceStrength * 0.18 +
        evidenceRecency * 0.12 +
        timedPerformance * 0.14 +
        transferCoverage * 0.12 +
        errorStability * 0.05 +
        completionReliability * 0.05,
    );
    let readinessBand = bandFromScore(readinessScore, relevant.length, input.readinessPolicy);
    if (daysOld > input.readinessPolicy.thresholds.staleAfterDays && relevant.length > 0)
      readinessBand = 'stale_evidence';
    if (diagnosticOnly)
      readinessBand = capBand(readinessBand, input.readinessPolicy.caps.diagnosticOnlyMaxBand);
    if (!timedEvidence)
      readinessBand = capBand(readinessBand, input.readinessPolicy.caps.noTimedEvidenceMaxBand);
    if (hasRepeatedError)
      readinessBand = capBand(readinessBand, input.readinessPolicy.caps.repeatedErrorMaxBand);
    if (slot.coverageStatus === 'unsupported')
      readinessBand = capBand(readinessBand, input.readinessPolicy.caps.unsupportedCoverageMaxBand);
    const blockingGaps = [
      ...(relevant.length === 0 ? ['Keine belastbare Evidenz vorhanden.'] : []),
      ...(diagnosticOnly ? ['Bisher liegt nur Diagnoseevidenz vor.'] : []),
      ...(!timedEvidence ? ['Kein Versuch unter Zeitdruck vorhanden.'] : []),
      ...(hasRepeatedError ? ['Wiederholter Fehler blockiert höhere Bereitschaft.'] : []),
      ...(slot.coverageStatus === 'unsupported'
        ? ['Für Varianten dieses Slots fehlt Coverage.']
        : []),
    ];
    return ExamSlotReadinessSchema.parse({
      slotId: slot.slotId,
      taskNumber: slot.taskNumber,
      title: slot.title,
      readinessBand,
      readinessScore,
      evidenceLevel: timedEvidence
        ? 'timed'
        : scored.some((entry) => entry.evidenceType === 'trainer_attempt')
          ? 'practice'
          : diagnosticOnly
            ? 'diagnostic'
            : 'none',
      coverageStatus: slot.coverageStatus,
      blockingGaps,
      recommendedActivities: slot.activityIds,
      components: {
        masteryLevel: averageScore,
        evidenceStrength,
        evidenceRecency,
        timedPerformance,
        transferCoverage,
        errorStability,
        completionReliability,
      },
    });
  });
}

export function computeOverallExamReadiness(slots: ExamSlotReadiness[]): OverallExamReadiness {
  const weightedReadiness = slots.length
    ? slots.reduce((sum, slot) => sum + slot.readinessScore, 0) / slots.length
    : 0;
  const coverageCompleteness = slots.length
    ? slots.filter((slot) => slot.coverageStatus === 'strong' || slot.coverageStatus === 'partial')
        .length / slots.length
    : 0;
  const weakest = [...slots].sort((a, b) => a.readinessScore - b.readinessScore)[0];
  const staleSlotCount = slots.filter((slot) => slot.readinessBand === 'stale_evidence').length;
  const insufficientEvidenceSlotCount = slots.filter(
    (slot) => slot.readinessBand === 'insufficient_evidence',
  ).length;
  const timedExamEvidence = slots.some((slot) => slot.evidenceLevel === 'timed');
  let overallBand: ReadinessBand =
    weightedReadiness >= 0.82
      ? 'exam_ready'
      : weightedReadiness >= 0.66
        ? 'mostly_stable'
        : 'developing';
  if (!timedExamEvidence) overallBand = capBand(overallBand, 'mostly_stable');
  if (insufficientEvidenceSlotCount > 0) overallBand = capBand(overallBand, 'developing');
  if (staleSlotCount > 1) overallBand = capBand(overallBand, 'stale_evidence');
  return OverallExamReadinessSchema.parse({
    weightedReadiness,
    coverageCompleteness,
    weakestSlot: weakest?.slotId ?? 'none',
    staleSlotCount,
    insufficientEvidenceSlotCount,
    timedExamEvidence,
    overallBand,
  });
}

export function buildReviewUnits(
  evidence: StudyEvidence[],
  policy: SpacedReviewPolicy,
  today: string,
): ReviewSchedule[] {
  return evidence
    .filter(
      (entry) =>
        entry.errorCodes.length || entry.misconceptionIds.length || entry.scoreRatio !== null,
    )
    .map((entry) => {
      const wrong = (entry.scoreRatio ?? 0) < 0.6;
      const highConfidenceWrong = wrong && (entry.confidence ?? 0) >= 0.8;
      const intervalLevel = wrong ? 0 : entry.timed && (entry.scoreRatio ?? 0) >= 0.85 ? 3 : 1;
      const interval = policy.intervalDays[intervalLevel] ?? 1;
      return ReviewScheduleSchema.parse({
        id: `review-${entry.evidenceId}`,
        reviewUnitId: [...entry.competencyIds, ...entry.errorCodes, ...entry.misconceptionIds]
          .sort()
          .join(':'),
        competencyIds: entry.competencyIds,
        errorCodes: entry.errorCodes,
        sourceEvidenceIds: [entry.evidenceId],
        lastReviewedAt: entry.createdAt,
        nextDueAt: new Date(
          new Date(entry.createdAt).getTime() + interval * 86_400_000,
        ).toISOString(),
        intervalLevel: highConfidenceWrong ? 0 : intervalLevel,
        successCount: wrong ? 0 : 1,
        failureCount: wrong ? 1 : 0,
        lastOutcome: wrong ? 'wrong' : 'correct',
        policyVersion: policy.policyVersion,
      });
    })
    .filter((review) => daysBetween(today, review.nextDueAt) <= 365);
}

export function updateReviewSchedule(
  schedule: ReviewSchedule,
  outcome: 'correct' | 'wrong' | 'mixed' | 'manual',
  reviewedAt: string,
  policy: SpacedReviewPolicy,
): ReviewSchedule {
  const successCount = outcome === 'correct' ? schedule.successCount + 1 : schedule.successCount;
  const failureCount = outcome === 'wrong' ? schedule.failureCount + 1 : schedule.failureCount;
  const intervalLevel =
    outcome === 'wrong'
      ? 0
      : Math.min(
          policy.intervalDays.length - 1,
          schedule.intervalLevel + (outcome === 'correct' ? 1 : 0),
        );
  const interval = policy.intervalDays[intervalLevel] ?? 1;
  return ReviewScheduleSchema.parse({
    ...schedule,
    lastReviewedAt: reviewedAt,
    nextDueAt: new Date(new Date(reviewedAt).getTime() + interval * 86_400_000).toISOString(),
    intervalLevel,
    successCount,
    failureCount,
    lastOutcome: outcome,
    policyVersion: policy.policyVersion,
  });
}

export function findDueReviews(schedules: ReviewSchedule[], today: string): ReviewSchedule[] {
  return schedules
    .filter((schedule) => schedule.nextDueAt.slice(0, 10) <= today.slice(0, 10))
    .sort(
      (a, b) =>
        a.nextDueAt.localeCompare(b.nextDueAt) || a.reviewUnitId.localeCompare(b.reviewUnitId),
    );
}

export function scoreStudyActivity(
  activity: StudyActivityDefinition,
  input: StudyPlanGenerationInput,
  dueReviews: ReviewSchedule[],
): StudyActivityCandidate {
  const policy = input.priorityPolicy.weights;
  const relatedReadiness = computeExamSlotReadiness(input).filter((slot) =>
    activity.examTaskNumbers.includes(slot.taskNumber),
  );
  const averageSlotReadiness = relatedReadiness.length
    ? relatedReadiness.reduce((sum, slot) => sum + slot.readinessScore, 0) / relatedReadiness.length
    : 0;
  const masteryDeficit = (1 - averageSlotReadiness) * policy.masteryDeficit;
  const examSlotWeight =
    (activity.examTaskNumbers.includes(7) || activity.examTaskNumbers.includes(8) ? 1 : 0.7) *
    policy.examSlotWeight;
  const dueForActivity = dueReviews.filter((review) =>
    review.competencyIds.some((id) => activity.targetCompetencyIds.includes(id)),
  ).length;
  const reviewDueUrgency = Math.min(1, dueForActivity / 2) * policy.reviewDueUrgency;
  const repeatedErrors = input.evidence.flatMap((entry) => entry.errorCodes);
  const repeatedErrorWeight =
    repeatedErrors.some((error, index) => repeatedErrors.indexOf(error) !== index) &&
    activity.activityType === 'error_replay'
      ? policy.repeatedErrorWeight
      : 0;
  const confidenceMismatchWeight =
    input.evidence.some(
      (entry) => (entry.confidence ?? 0) >= 0.8 && (entry.scoreRatio ?? 1) < 0.6,
    ) &&
    (activity.activityType === 'diagnostic_topic' || activity.activityType === 'error_replay')
      ? policy.confidenceMismatchWeight
      : 0;
  const weakTargetEvidence = input.evidence.filter(
    (entry) =>
      (entry.scoreRatio ?? 1) < 0.6 &&
      entry.competencyIds.some((competencyId) =>
        activity.targetCompetencyIds.includes(competencyId),
      ),
  ).length;
  const targetedWeaknessWeight =
    weakTargetEvidence > 0 && !activity.activityType.startsWith('diagnostic')
      ? 36 / Math.max(1, activity.targetCompetencyIds.length)
      : 0;
  const evidenceRecencyWeight = relatedReadiness.some(
    (slot) => slot.readinessBand === 'stale_evidence',
  )
    ? policy.evidenceRecencyWeight
    : 0;
  const unsupportedCoveragePenalty = relatedReadiness.some(
    (slot) => slot.coverageStatus === 'unsupported',
  )
    ? policy.unsupportedCoveragePenalty
    : 0;
  const prerequisitePenalty = activity.prerequisiteCompetencyIds.some(
    (id) => !input.evidence.some((entry) => entry.competencyIds.includes(id)),
  )
    ? weakTargetEvidence > 0
      ? 0
      : policy.prerequisitePenalty
    : 0;
  const timeFit =
    activity.estimatedMinutes <= input.settings.maxSingleSessionMinutes &&
    activity.estimatedMinutes <= input.settings.dailyMinuteBudget
      ? policy.timeFit
      : -policy.timeFit;
  const examDateUrgency = getExamDatePhase(
    input.settings.examDate,
    input.today,
    input.examDatePhasePolicy,
  ).phase.includes('exam')
    ? policy.examDateUrgency
    : 0;
  const reasons = [
    {
      factor: 'masteryDeficit',
      label: 'Lücke im Slot',
      detail: `Der zugehörige Slot liegt bei ${Math.round(averageSlotReadiness * 100)} % internem Readiness-Score.`,
      contribution: masteryDeficit,
    },
    {
      factor: 'reviewDueUrgency',
      label: 'Wiederholung fällig',
      detail:
        dueForActivity > 0
          ? `${dueForActivity} passende Wiederholung(en) sind fällig.`
          : 'Keine passende Wiederholung ist heute fällig.',
      contribution: reviewDueUrgency,
    },
    {
      factor: 'timeFit',
      label: 'Passt ins Zeitbudget',
      detail: `${activity.estimatedMinutes} Minuten bei Tagesbudget ${input.settings.dailyMinuteBudget} Minuten.`,
      contribution: timeFit,
    },
  ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const priority =
    masteryDeficit +
    examSlotWeight +
    reviewDueUrgency +
    repeatedErrorWeight +
    confidenceMismatchWeight +
    targetedWeaknessWeight +
    evidenceRecencyWeight +
    examDateUrgency +
    timeFit -
    prerequisitePenalty -
    unsupportedCoveragePenalty;
  return StudyActivityCandidateSchema.parse({
    activityId: activity.activityId,
    activityType: activity.activityType,
    title: activity.title,
    route: activity.route,
    targetCompetencyIds: activity.targetCompetencyIds,
    examTaskNumbers: activity.examTaskNumbers,
    estimatedMinutes: activity.estimatedMinutes,
    priority,
    reasons: reasons.slice(0, 3),
    blockedReasons: [
      ...(activity.estimatedMinutes > input.settings.dailyMinuteBudget
        ? ['Nicht genug Zeit im Tagesbudget.']
        : []),
      ...(prerequisitePenalty > 0 ? ['Voraussetzung fehlt oder hat keine Evidenz.'] : []),
      ...(activity.availabilityStatus !== 'available' ? ['Inhalt ist noch nicht verfügbar.'] : []),
    ],
    status: activity.availabilityStatus === 'available' ? 'planned' : 'unavailable',
  });
}

export function buildActivityCandidates(input: StudyPlanGenerationInput): StudyActivityCandidate[] {
  const dueReviews = findDueReviews(input.reviewSchedules, input.today);
  return input.activities
    .map((activity) => scoreStudyActivity(activity, input, dueReviews))
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        (a.examTaskNumbers[0] ?? 99) - (b.examTaskNumbers[0] ?? 99) ||
        a.activityId.localeCompare(b.activityId, 'de'),
    );
}

export function applyQueueConstraints(
  candidates: StudyActivityCandidate[],
  settings: StudyPlanSettings,
): StudyActivityCandidate[] {
  const selected: StudyActivityCandidate[] = [];
  let usedMinutes = 0;
  const trainerCounts = new Map<string, number>();
  let diagnosticCount = 0;
  for (const candidate of candidates) {
    if (candidate.status === 'unavailable') continue;
    if (candidate.activityType.startsWith('diagnostic') && diagnosticCount >= 1) continue;
    if (usedMinutes + candidate.estimatedMinutes > settings.dailyMinuteBudget) continue;
    const familyKey = candidate.activityId.replace(/-(lernen|ueben|pruefung|review|error)$/u, '');
    if ((trainerCounts.get(familyKey) ?? 0) >= 2) continue;
    if (
      candidate.activityType === 'exam_package' &&
      candidate.estimatedMinutes > settings.dailyMinuteBudget
    )
      continue;
    selected.push(candidate);
    usedMinutes += candidate.estimatedMinutes;
    if (candidate.activityType.startsWith('diagnostic')) diagnosticCount += 1;
    trainerCounts.set(familyKey, (trainerCounts.get(familyKey) ?? 0) + 1);
  }
  return selected;
}

export function buildDailyStudyPlan(input: StudyPlanGenerationInput): DailyStudyPlan {
  const parsed = StudyPlanGenerationInputSchema.parse(input);
  const fingerprint = computeEvidenceFingerprint(parsed.evidence, parsed.settings);
  const dueReviews = findDueReviews(parsed.reviewSchedules, parsed.today);
  const selected = applyQueueConstraints(buildActivityCandidates(parsed), parsed.settings);
  const totalEstimatedMinutes = selected.reduce(
    (sum, activity) => sum + activity.estimatedMinutes,
    0,
  );
  return DailyStudyPlanSchema.parse({
    id: `plan-${parsed.today}`,
    planId: `daily-${parsed.today}-${fingerprint}`,
    planType: 'daily',
    planDate: parsed.today,
    timezone: parsed.settings.timezone,
    settingsVersion: parsed.settings.settingsVersion,
    policyVersion: parsed.priorityPolicy.policyVersion,
    masteryModelVersion: 'mastery-v14',
    evidenceFingerprint: fingerprint,
    generatedAt: `${parsed.today}T00:00:00.000Z`,
    generationReason: 'deterministische Planung aus Evidenz, Fälligkeiten und Einstellungen',
    activities: selected,
    totalEstimatedMinutes,
    completionState: selected.every((activity) => activity.status === 'completed')
      ? 'completed'
      : 'open',
    dueReviewCount: dueReviews.length,
    mainGoal: selected[0]?.title ?? 'Puffer und kurze Wiederholung',
  });
}

export function buildWeeklyStudyPlan(input: StudyPlanGenerationInput): WeeklyStudyPlan {
  const days: DailyStudyPlan[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(`${input.today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    const iso = date.toISOString().slice(0, 10);
    const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
    if (input.settings.preferredWeekdays.includes(weekday))
      days.push(buildDailyStudyPlan({ ...input, today: iso }));
  }
  return WeeklyStudyPlanSchema.parse({
    id: `week-${input.today}`,
    planId: `weekly-${input.today}-${computeEvidenceFingerprint(input.evidence, input.settings)}`,
    planType: 'weekly',
    weekStart: input.today,
    timezone: input.settings.timezone,
    days,
    totalEstimatedMinutes: days.reduce((sum, day) => sum + day.totalEstimatedMinutes, 0),
    policyVersion: input.priorityPolicy.policyVersion,
    evidenceFingerprint: computeEvidenceFingerprint(input.evidence, input.settings),
    generatedAt: `${input.today}T00:00:00.000Z`,
  });
}

export function explainStudyRecommendation(candidate: StudyActivityCandidate): string {
  return candidate.reasons
    .slice(0, 3)
    .map((reason) => reason.detail)
    .join(' ');
}

export function regenerateStudyPlan(input: StudyPlanGenerationInput) {
  const slotReadiness = computeExamSlotReadiness(input);
  return {
    dailyPlan: buildDailyStudyPlan(input),
    weeklyPlan: buildWeeklyStudyPlan(input),
    slotReadiness,
    overallReadiness: computeOverallExamReadiness(slotReadiness),
  };
}

export function validateStudyPlan(plan: DailyStudyPlan | WeeklyStudyPlan) {
  return plan.planType === 'daily'
    ? DailyStudyPlanSchema.parse(plan)
    : WeeklyStudyPlanSchema.parse(plan);
}

export function markStudyActivityStarted(plan: DailyStudyPlan, activityId: string): DailyStudyPlan {
  return DailyStudyPlanSchema.parse({
    ...plan,
    activities: plan.activities.map((activity) =>
      activity.activityId === activityId ? { ...activity, status: 'started' } : activity,
    ),
  });
}

export function markStudyActivityCompleted(
  plan: DailyStudyPlan,
  activityId: string,
): DailyStudyPlan {
  const activities = plan.activities.map((activity) =>
    activity.activityId === activityId ? { ...activity, status: 'completed' } : activity,
  );
  return DailyStudyPlanSchema.parse({
    ...plan,
    activities,
    completionState: activities.every((activity) => activity.status === 'completed')
      ? 'completed'
      : 'partially_completed',
  });
}

export function snoozeStudyActivity(plan: DailyStudyPlan, activityId: string): DailyStudyPlan {
  return DailyStudyPlanSchema.parse({
    ...plan,
    activities: plan.activities.map((activity) =>
      activity.activityId === activityId ? { ...activity, status: 'snoozed' } : activity,
    ),
    completionState: 'partially_completed',
  });
}

export function skipStudyActivity(plan: DailyStudyPlan, activityId: string): DailyStudyPlan {
  return DailyStudyPlanSchema.parse({
    ...plan,
    activities: plan.activities.map((activity) =>
      activity.activityId === activityId ? { ...activity, status: 'skipped' } : activity,
    ),
    completionState: 'partially_completed',
  });
}

export function getExamDatePhase(
  examDate: string | null,
  today: string,
  policy: ExamDatePhasePolicy,
) {
  if (!examDate) return { phase: 'continuous' as const, daysUntilExam: null, multiplier: 1 };
  const daysUntilExam = daysBetween(today, examDate);
  const match = policy.phases.find((phase) => {
    const minOk = phase.minDaysUntilExam === null || daysUntilExam >= phase.minDaysUntilExam;
    const maxOk = phase.maxDaysUntilExam === null || daysUntilExam <= phase.maxDaysUntilExam;
    return minOk && maxOk;
  });
  return {
    phase: match?.phase ?? (daysUntilExam < 0 ? 'past_exam_date' : 'continuous'),
    daysUntilExam,
    multiplier: match?.priorityMultiplier ?? 1,
  };
}
