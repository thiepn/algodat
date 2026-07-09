import type { ExamSession } from '../types';

export function handleExamExpiry(session: ExamSession, now: string): ExamSession {
  if (session.status !== 'running') return session;
  return { ...session, status: 'time_expired', submittedAt: now };
}
