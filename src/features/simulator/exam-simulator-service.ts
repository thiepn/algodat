import { content } from '../../content/loaders/content';
import type {
  ExamPackage,
  ExamResult as StoredExamResult,
  ExamSession as StoredExamSession,
  ExamSnapshot as StoredExamSnapshot,
  MasteryRecord,
} from '../../content/schemas';
import {
  createExamSession,
  createRecoverySnapshot,
  exactToLabel,
  finalizeExamSubmission,
  handleExamExpiry,
  markTaskForReview,
  navigateToTask,
  restoreRecoverySnapshot,
  startExamSession,
  updateTaskCompletionState,
  type ExamResultReport,
  type ExamSession,
} from '../../domain/exam-simulator';
import { completionForExamAnswer } from './ExamTaskRenderer';
import {
  examResultRepository,
  examSessionRepository,
  examSnapshotRepository,
  masteryRepository,
} from '../../persistence/repositories';

export function getCoreExamPackage(): ExamPackage {
  const examPackage = content.examPackages.find(
    (candidate) => candidate.id === 'exam-package-aktuelle-probeklausur-v5',
  );
  if (!examPackage) throw new Error('Aktuelle Probeklausur fehlt.');
  return examPackage;
}

export function getExamPackageById(examPackageId: string): ExamPackage | undefined {
  return content.examPackages.find((candidate) => candidate.id === examPackageId);
}

function packageForSession(session: ExamSession) {
  return getExamPackageById(session.examPackageId) ?? getCoreExamPackage();
}

function meta(session: ExamSession, examPackage = getCoreExamPackage()): StoredExamSession {
  return {
    ...session,
    schemaVersion: '1.0.0',
    sourceRefs: examPackage.sourceRefs,
    verificationStatus: 'verified_against_official_source',
    lastReviewed: new Date().toISOString(),
    duplicateGroupId: null,
    taskPayloadVersions: Object.fromEntries(
      examPackage.taskSlots.map((slot) => [slot.taskSlotId, `${slot.adapterId}-payload-v1`]),
    ),
    recoveryMetadata: { policy: examPackage.recoveryPolicy.id },
    appVersion: content.manifest.contentVersion,
  };
}

export async function createSimulatorSession(
  mode: 'strict_exam' | 'practice_exam' = 'strict_exam',
  examPackageId = getCoreExamPackage().id,
) {
  const examPackage = getExamPackageById(examPackageId) ?? getCoreExamPackage();
  const session = createExamSession({
    examPackage,
    mode,
    now: new Date().toISOString(),
    contentVersion: content.manifest.contentVersion,
  });
  const briefing = { ...session, status: 'briefing' as const };
  await examSessionRepository.put(meta(briefing, examPackage));
  return briefing;
}

export async function startSimulatorSession(session: ExamSession) {
  const examPackage = packageForSession(session);
  const started = startExamSession(session, examPackage.durationMinutes, Date.now());
  await examSessionRepository.put(meta(started, examPackage));
  await saveSimulatorSnapshot(started);
  return started;
}

export async function saveSimulatorSnapshot(session: ExamSession) {
  const examPackage = packageForSession(session);
  const snapshot = createRecoverySnapshot({
    session,
    savedAt: new Date().toISOString(),
    adapterVersions: Object.fromEntries(
      examPackage.taskSlots.map((slot) => [slot.adapterId, `${slot.adapterId}-v1`]),
    ),
    taskPayloadVersions: Object.fromEntries(
      examPackage.taskSlots.map((slot) => [slot.taskSlotId, `${slot.adapterId}-payload-v1`]),
    ),
  });
  const stored: StoredExamSnapshot = {
    ...snapshot,
    payload: snapshot.payload,
  };
  await examSnapshotRepository.put(stored);
  return stored;
}

export async function restoreSimulatorSession(sessionId: string) {
  const snapshot = await examSnapshotRepository.get(`snapshot-${sessionId}`);
  if (!snapshot) return undefined;
  const restored = restoreRecoverySnapshot(snapshot as never);
  if (!restored.ok || !restored.value) return undefined;
  return restored.value;
}

export async function getSimulatorSession(sessionId: string) {
  const [stored, recovered] = await Promise.all([
    examSessionRepository.get(sessionId),
    restoreSimulatorSession(sessionId),
  ]);
  // Der Snapshot wird nach jeder Session-Schreiboperation erstellt. Er schützt
  // gegen einen abgebrochenen IndexedDB-Commit, ohne abgeschlossene Ergebnisse zu verwerfen.
  if (recovered && (!stored || recovered.createdAt === (stored as ExamSession).createdAt))
    return recovered;
  return stored as ExamSession | undefined;
}

export async function listSimulatorSessions() {
  return (await examSessionRepository.list()) as ExamSession[];
}

const sessionWriteQueues = new Map<string, Promise<unknown>>();

function updateLatestSession(
  sessionId: string,
  mutate: (latest: ExamSession) => ExamSession,
): Promise<ExamSession> {
  const previous = sessionWriteQueues.get(sessionId) ?? Promise.resolve();
  const operation = previous
    .catch(() => undefined)
    .then(async () => {
      const stored = await examSessionRepository.get(sessionId);
      if (!stored) throw new Error('Die Klausursitzung wurde nicht gefunden.');
      const updated = mutate(stored as ExamSession);
      await examSessionRepository.put(meta(updated, packageForSession(updated)));
      await saveSimulatorSnapshot(updated);
      return updated;
    });
  sessionWriteQueues.set(sessionId, operation);
  void operation.finally(() => {
    if (sessionWriteQueues.get(sessionId) === operation) sessionWriteQueues.delete(sessionId);
  });
  return operation;
}

export async function saveTaskAnswer({
  sessionId,
  taskSlotId,
  answerRevision,
  answer,
}: {
  sessionId: string;
  taskSlotId: string;
  answerRevision: number;
  answer: unknown;
}) {
  const session = await getSimulatorSession(sessionId);
  if (!session) throw new Error('Die Klausursitzung wurde nicht gefunden.');
  const examPackage = packageForSession(session);
  const task = examPackage.taskSlots.find((slot) => slot.taskSlotId === taskSlotId);
  if (!task) throw new Error('Aufgabe der Klausursitzung fehlt.');
  const completion = completionForExamAnswer(task, answer);
  return updateLatestSession(sessionId, (latest) => {
    const currentRevision = latest.taskStates[taskSlotId]?.answerRevision ?? 0;
    if (answerRevision < currentRevision) return latest;
    return updateTaskCompletionState(
      latest,
      taskSlotId,
      structuredClone(answer),
      completion.status,
      new Date().toISOString(),
      answerRevision,
    );
  });
}

export async function navigateSimulatorTask(session: ExamSession, taskSlotId: string) {
  return updateLatestSession(session.id, (latest) =>
    navigateToTask(latest, taskSlotId, new Date().toISOString()),
  );
}

export async function setSimulatorReviewFlag(
  session: ExamSession,
  taskSlotId: string,
  marked: boolean,
) {
  return updateLatestSession(session.id, (latest) => markTaskForReview(latest, taskSlotId, marked));
}

export async function expireSimulatorSession(session: ExamSession) {
  const expired = handleExamExpiry(session, new Date().toISOString());
  return submitSimulatorSession(expired);
}

export async function submitSimulatorSession(session: ExamSession) {
  const examPackage = packageForSession(session);
  const { session: graded, report } = finalizeExamSubmission(
    session,
    examPackage,
    new Date().toISOString(),
  );
  await examSessionRepository.put(meta(graded, examPackage));
  await examResultRepository.put(toStoredResult(report));
  await masteryRepository.put(toMasteryRecord(report, examPackage));
  return { session: graded, report };
}

export async function getSimulatorResult(sessionId: string) {
  return examResultRepository.get(`exam-result-${sessionId}`);
}

function serializableExact(value: { numerator: bigint; denominator: bigint }) {
  return { numerator: Number(value.numerator), denominator: Number(value.denominator) };
}

function toStoredResult(report: ExamResultReport): StoredExamResult {
  return {
    id: `exam-result-${report.sessionId}`,
    resultId: `exam-result-${report.sessionId}`,
    sessionId: report.sessionId,
    taskScores: report.aggregate.taskScores.map((score) => ({
      ...score,
      mappedExamScore: serializableExact(score.mappedExamScore),
      examMaximum: serializableExact(score.examMaximum),
    })),
    totalScore: serializableExact(report.aggregate.totalScore),
    maximumScore: serializableExact(report.aggregate.maximumScore),
    timingAnalytics: { ...report.timing },
    errorClusters: report.errorClusters,
    masteryImpact: report.masteryImpact,
    recommendations: report.recommendations,
    generatedAt: report.submittedAt,
    scoringVersion: 'exam-scoring-v1',
  };
}

function toMasteryRecord(report: ExamResultReport, examPackage: ExamPackage): MasteryRecord {
  const now = new Date().toISOString();
  return {
    id: `mastery-${report.sessionId}`,
    schemaVersion: '1.0.0',
    contentVersion: content.manifest.contentVersion,
    sourceRefs: examPackage.sourceRefs,
    verificationStatus: 'verified_against_official_source',
    lastReviewed: now,
    duplicateGroupId: null,
    topicOrTaskId: report.sessionId,
    dimensions: report.masteryImpact,
    evidenceAttemptIds: [report.sessionId],
    updatedAt: now,
  };
}

export function formatExamPoint(value: { numerator: bigint; denominator: bigint }) {
  return exactToLabel(value);
}
