import type { ExamPackage } from '../../../content/schemas';
import type { ExamSession } from '../types';

export function deriveTimerWarnings(
  session: ExamSession,
  examPackage: ExamPackage,
  remainingMs: number,
): string[] {
  const durationMs = examPackage.durationMinutes * 60_000;
  const warnings = [
    ...examPackage.timerPolicy.warningThresholdRatios
      .filter((ratio) => remainingMs <= durationMs * ratio)
      .map((ratio) => `${Math.round(ratio * 100)}-prozent-verbleibend`),
    ...examPackage.timerPolicy.warningThresholdMinutes
      .filter((minutes) => remainingMs <= minutes * 60_000)
      .map((minutes) => `${minutes}-minuten-verbleibend`),
  ];
  if (remainingMs === 0) warnings.push('zeit-abgelaufen');
  return [...new Set(warnings)].filter((warning) => !session.timerWarningsShown.includes(warning));
}
