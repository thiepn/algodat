import { describe, expect, it } from 'vitest';
import { studyOrchestratorContent } from '../../src/content/loaders/study-orchestrator';
import {
  buildDailyStudyPlan,
  buildReviewUnits,
  computeEvidenceFingerprint,
  computeExamSlotReadiness,
  computeOverallExamReadiness,
  getExamDatePhase,
  markStudyActivityCompleted,
  regenerateStudyPlan,
  skipStudyActivity,
  snoozeStudyActivity,
  type StudyEvidence,
  type StudyPlanSettings,
} from '../../src/domain/study-orchestrator';

const settings: StudyPlanSettings = {
  id: 'study-plan-settings',
  ...studyOrchestratorContent.defaultSettings,
  examDate: null,
  updatedAt: '2026-07-09T00:00:00.000Z',
};

function input(evidence: StudyEvidence[] = [], overrides: Partial<StudyPlanSettings> = {}) {
  const currentSettings = { ...settings, ...overrides };
  const reviewSchedules = buildReviewUnits(
    evidence,
    studyOrchestratorContent.spacedReviewPolicy,
    '2026-07-09',
  );
  return {
    today: '2026-07-09',
    settings: currentSettings,
    evidence,
    reviewSchedules,
    activities: studyOrchestratorContent.activityCatalog,
    slotMap: studyOrchestratorContent.examSlotMap,
    priorityPolicy: studyOrchestratorContent.priorityPolicy,
    readinessPolicy: studyOrchestratorContent.readinessPolicy,
    reviewPolicy: studyOrchestratorContent.spacedReviewPolicy,
    examDatePhasePolicy: studyOrchestratorContent.examDatePhasePolicy,
  };
}

const weakRecurrence: StudyEvidence = {
  evidenceId: 'weak-recurrence',
  evidenceType: 'diagnostic_session',
  createdAt: '2026-07-08T00:00:00.000Z',
  competencyIds: ['foundation-recurrences'],
  examTaskNumbers: [6],
  scoreRatio: 0.25,
  timed: false,
  hintsUsed: false,
  solutionRevealed: false,
  errorCodes: ['master-case-mixup'],
  misconceptionIds: ['master-case-mixup'],
  confidence: 0.9,
  sourceId: 'diag-1',
};

describe('Study-Orchestrator-Domain', () => {
  it('validiert Katalog und Policies mit referenzierbaren Kernwerten', () => {
    expect(studyOrchestratorContent.activityCatalog.length).toBeGreaterThanOrEqual(10);
    expect(studyOrchestratorContent.examSlotMap).toHaveLength(9);
    expect(studyOrchestratorContent.spacedReviewPolicy.intervalDays).toEqual([1, 3, 7, 14, 30]);
  });

  it('erzeugt für neue Nutzer keinen exam-ready-Status und empfiehlt Diagnose', () => {
    const result = regenerateStudyPlan(input());
    expect(result.overallReadiness.overallBand).not.toBe('exam_ready');
    expect(
      result.slotReadiness.every((slot) => slot.readinessBand === 'insufficient_evidence'),
    ).toBe(true);
    expect(result.dailyPlan.activities[0]?.activityType).toMatch(/diagnostic|rest_or_buffer/u);
  });

  it('priorisiert schwache Rekurrenz ohne Prim-Ablenkung', () => {
    const plan = buildDailyStudyPlan(input([weakRecurrence]));
    const titles = plan.activities.map((activity) => activity.title).join(' ');
    expect(titles).toContain('Rekurrenz');
    expect(titles).not.toContain('Prim-MST');
  });

  it('erkennt wiederholte Dijkstra-Fehler als Error Replay', () => {
    const evidence: StudyEvidence[] = [
      {
        ...weakRecurrence,
        evidenceId: 'dijkstra-1',
        competencyIds: ['foundation-graph-algorithms'],
        examTaskNumbers: [3],
        errorCodes: ['dijkstra_negative_edge'],
        misconceptionIds: ['dijkstra-negative-edge'],
      },
      {
        ...weakRecurrence,
        evidenceId: 'dijkstra-2',
        competencyIds: ['foundation-graph-algorithms'],
        examTaskNumbers: [3],
        errorCodes: ['dijkstra_negative_edge'],
        misconceptionIds: ['dijkstra-negative-edge'],
      },
    ];
    const plan = buildDailyStudyPlan(input(evidence));
    expect(
      plan.activities.some((activity) => activity.activityId === 'activity-dijkstra-error'),
    ).toBe(true);
  });

  it('cappt gute Diagnose ohne Zeitdruck unter exam-ready', () => {
    const evidence: StudyEvidence[] = [
      {
        ...weakRecurrence,
        evidenceId: 'strong-diagnosis',
        scoreRatio: 1,
        confidence: 1,
        errorCodes: [],
        misconceptionIds: [],
      },
    ];
    const readiness = computeExamSlotReadiness(input(evidence));
    expect(readiness.find((slot) => slot.taskNumber === 6)?.readinessBand).not.toBe('exam_ready');
  });

  it('berechnet fällige Wiederholungen und stabile Fingerprints deterministisch', () => {
    const reviews = buildReviewUnits(
      [weakRecurrence],
      studyOrchestratorContent.spacedReviewPolicy,
      '2026-07-09',
    );
    expect(reviews[0]?.nextDueAt.slice(0, 10)).toBe('2026-07-09');
    expect(computeEvidenceFingerprint([weakRecurrence], settings)).toBe(
      computeEvidenceFingerprint([weakRecurrence], settings),
    );
  });

  it('hält Tagesbudget ein und Skip/Snooze verändern keine fachliche Evidenz', () => {
    const plan = buildDailyStudyPlan(input([weakRecurrence], { dailyMinuteBudget: 25 }));
    expect(plan.totalEstimatedMinutes).toBeLessThanOrEqual(25);
    const skipped = skipStudyActivity(plan, plan.activities[0]?.activityId ?? '');
    const snoozed = snoozeStudyActivity(plan, plan.activities[0]?.activityId ?? '');
    expect(skipped.evidenceFingerprint).toBe(plan.evidenceFingerprint);
    expect(snoozed.evidenceFingerprint).toBe(plan.evidenceFingerprint);
  });

  it('setzt Abschlussstatus ohne Duplikate', () => {
    const plan = buildDailyStudyPlan(input([weakRecurrence]));
    const completed = markStudyActivityCompleted(plan, plan.activities[0]?.activityId ?? '');
    expect(completed.activities.filter((activity) => activity.status === 'completed')).toHaveLength(
      1,
    );
  });

  it('berechnet Gesamtreadiness mit kritischem Cap', () => {
    const readiness = computeExamSlotReadiness(input([weakRecurrence]));
    const overall = computeOverallExamReadiness(readiness);
    expect(overall.insufficientEvidenceSlotCount).toBeGreaterThan(0);
    expect(overall.overallBand).not.toBe('exam_ready');
  });

  it('ordnet Prüfungsdatumsphasen transparent zu', () => {
    expect(
      getExamDatePhase('2026-07-14', '2026-07-09', studyOrchestratorContent.examDatePhasePolicy)
        .phase,
    ).toBe('final_review_phase');
    expect(
      getExamDatePhase(null, '2026-07-09', studyOrchestratorContent.examDatePhasePolicy).phase,
    ).toBe('continuous');
  });
});
