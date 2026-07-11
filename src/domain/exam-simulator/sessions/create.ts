import type { ExamPackage } from '../../../content/schemas';
import type { ExamMode, ExamSession, ExamTaskSessionState } from '../types';

export function createExamSession({
  examPackage,
  mode,
  now,
  contentVersion,
}: {
  examPackage: ExamPackage;
  mode: ExamMode;
  now: string;
  contentVersion: string;
}): ExamSession {
  const taskStates = Object.fromEntries(
    examPackage.taskSlots.map((slot): [string, ExamTaskSessionState] => [
      slot.taskSlotId,
      {
        taskSlotId: slot.taskSlotId,
        trainerId: slot.trainerId,
        adapterId: slot.adapterId,
        answer: null,
        answerRevision: 0,
        completionStatus: 'unanswered',
        firstOpenedAt: null,
        lastEditedAt: null,
        activeTimeMs: 0,
        switchCount: 0,
      },
    ]),
  );
  return {
    id: `exam-session-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`,
    examPackageId: examPackage.id,
    examPackageVersion: examPackage.version,
    profileId: null,
    mode,
    status: 'created',
    createdAt: now,
    startedAt: null,
    deadlineAt: null,
    submittedAt: null,
    gradedAt: null,
    currentTaskSlotId: examPackage.taskSlots[0]?.taskSlotId ?? '',
    reviewFlags: Object.fromEntries(examPackage.taskSlots.map((slot) => [slot.taskSlotId, false])),
    taskStates,
    timerWarningsShown: [],
    contentVersion,
    masteryModelVersion: 'mastery-v6',
  };
}

export function startExamSession(
  session: ExamSession,
  durationMinutes: number,
  nowMs: number,
): ExamSession {
  const startedAt = new Date(nowMs).toISOString();
  return {
    ...session,
    status: 'running',
    startedAt,
    deadlineAt: new Date(nowMs + durationMinutes * 60_000).toISOString(),
  };
}

export function resumeExamSession(session: ExamSession): ExamSession {
  if (session.status === 'recovery_required') return { ...session, status: 'running' };
  return session;
}
