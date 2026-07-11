import type { ExamSession } from '../types';

export function navigateToTask(session: ExamSession, taskSlotId: string, at: string): ExamSession {
  const state = session.taskStates[taskSlotId];
  if (!state) return { ...session, status: 'invalid' };
  return {
    ...session,
    currentTaskSlotId: taskSlotId,
    taskStates: {
      ...session.taskStates,
      [taskSlotId]: {
        ...state,
        firstOpenedAt: state.firstOpenedAt ?? at,
        switchCount: state.switchCount + (session.currentTaskSlotId === taskSlotId ? 0 : 1),
      },
    },
  };
}

export function markTaskForReview(
  session: ExamSession,
  taskSlotId: string,
  marked: boolean,
): ExamSession {
  return { ...session, reviewFlags: { ...session.reviewFlags, [taskSlotId]: marked } };
}

export function updateTaskCompletionState(
  session: ExamSession,
  taskSlotId: string,
  answer: unknown,
  completionStatus: ExamSession['taskStates'][string]['completionStatus'],
  at: string,
  answerRevision?: number,
): ExamSession {
  const state = session.taskStates[taskSlotId];
  if (!state) return { ...session, status: 'invalid' };
  return {
    ...session,
    taskStates: {
      ...session.taskStates,
      [taskSlotId]: {
        ...state,
        answer,
        answerRevision: answerRevision ?? state.answerRevision ?? 0,
        completionStatus,
        lastEditedAt: at,
      },
    },
  };
}
