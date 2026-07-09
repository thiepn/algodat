import type { ExamSession, ExamSessionStatus, ValidationResult } from '../types';

const allowedTransitions: Record<ExamSessionStatus, ExamSessionStatus[]> = {
  created: ['briefing', 'invalid'],
  briefing: ['ready', 'invalid'],
  ready: ['running', 'invalid'],
  running: ['time_expired', 'submitted', 'recovery_required', 'invalid'],
  recovery_required: ['running', 'invalid'],
  time_expired: ['submitted', 'graded'],
  submitted: ['graded'],
  graded: ['archived'],
  archived: [],
  invalid: [],
};

export function transitionExamSession(
  session: ExamSession,
  nextStatus: ExamSessionStatus,
  at: string,
): ValidationResult<ExamSession> {
  if (!allowedTransitions[session.status].includes(nextStatus))
    return {
      ok: false,
      errors: [`Übergang ${session.status} → ${nextStatus} ist unzulässig.`],
    };
  const next: ExamSession = { ...session, status: nextStatus };
  if (nextStatus === 'submitted') next.submittedAt = at;
  if (nextStatus === 'graded') next.gradedAt = at;
  return { ok: true, value: next, errors: [] };
}

export function allowedExamTransitions(status: ExamSessionStatus): ExamSessionStatus[] {
  return [...allowedTransitions[status]];
}
