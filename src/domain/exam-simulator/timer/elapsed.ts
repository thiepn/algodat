export function computeElapsedTime(startedAt: string | null, nowMs: number): number {
  if (!startedAt) return 0;
  return Math.max(0, nowMs - new Date(startedAt).getTime());
}

export function computeRemainingTime(deadlineAt: string | null, nowMs: number): number {
  if (!deadlineAt) return 0;
  return Math.max(0, new Date(deadlineAt).getTime() - nowMs);
}
