import type { ExamSession, ExamTimingAnalytics } from '../types';

export function computeExamTimingAnalytics(
  session: ExamSession,
  nowMs: number,
): ExamTimingAnalytics {
  const started = session.startedAt ? new Date(session.startedAt).getTime() : nowMs;
  return {
    totalElapsedMs: Math.max(
      0,
      (session.submittedAt ? new Date(session.submittedAt).getTime() : nowMs) - started,
    ),
    perTask: Object.values(session.taskStates).map((state) => ({
      taskSlotId: state.taskSlotId,
      activeTimeMs: state.activeTimeMs,
      switchCount: state.switchCount,
      completionStatus: state.completionStatus,
    })),
    expired: session.status === 'time_expired',
  };
}
