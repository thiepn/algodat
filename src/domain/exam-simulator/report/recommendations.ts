import type { ExamRecommendation, ExamScoreAggregate, ExamTimingAnalytics } from '../types';

export function recommendPostExamActivities(
  aggregate: ExamScoreAggregate,
  timing: ExamTimingAnalytics,
): ExamRecommendation[] {
  const lowest = [...aggregate.taskScores].sort(
    (left, right) =>
      left.internalScore / left.internalMaximum - right.internalScore / right.internalMaximum,
  )[0];
  const recommendations: ExamRecommendation[] = [];
  if (lowest)
    recommendations.push({
      code: 'repeat_lowest_task',
      label: `Wiederhole zuerst ${lowest.trainerId}`,
      reason: 'Diese Aufgabe hatte relativ den größten Punktverlust.',
      trainerId: lowest.trainerId,
    });
  if (timing.expired)
    recommendations.push({
      code: 'repeat_time_management',
      label: 'Zeitmanagement im Übungsmodus wiederholen',
      reason: 'Die Prüfung wurde durch Zeitablauf beendet.',
      trainerId: null,
    });
  return recommendations;
}
