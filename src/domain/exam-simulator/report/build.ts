import type { ExamPackage } from '../../../content/schemas';
import type {
  ExamResultReport,
  ExamScoreAggregate,
  ExamSession,
  ExamTimingAnalytics,
} from '../types';
import { recommendPostExamActivities } from './recommendations';

export function buildExamResultReport({
  session,
  examPackage,
  aggregate,
  timing,
}: {
  session: ExamSession;
  examPackage: ExamPackage;
  aggregate: ExamScoreAggregate;
  timing: ExamTimingAnalytics;
}): ExamResultReport {
  const errors = aggregate.taskScores.flatMap((score) =>
    score.errors.map((error) => ({ ...error, trainerId: score.trainerId })),
  );
  const errorClusters = Object.values(
    errors.reduce<Record<string, { errorCode: string; count: number; trainerIds: string[] }>>(
      (clusters, error) => {
        clusters[error.errorCode] ??= { errorCode: error.errorCode, count: 0, trainerIds: [] };
        const cluster = clusters[error.errorCode]!;
        cluster.count += 1;
        if (!cluster.trainerIds.includes(error.trainerId)) cluster.trainerIds.push(error.trainerId);
        return clusters;
      },
      {},
    ),
  );
  return {
    sessionId: session.id,
    examPackageId: examPackage.id,
    title: examPackage.title,
    submittedAt: session.submittedAt ?? new Date().toISOString(),
    aggregate,
    timing,
    errorClusters,
    masteryImpact: updateMasteryFromExam(aggregate, timing),
    recommendations: recommendPostExamActivities(aggregate, timing),
  };
}

export function updateMasteryFromExam(
  aggregate: ExamScoreAggregate,
  timing: ExamTimingAnalytics,
): Record<string, number> {
  const ratio =
    Number(aggregate.totalScore.numerator * aggregate.maximumScore.denominator) /
    Number(aggregate.totalScore.denominator * aggregate.maximumScore.numerator);
  const completion =
    timing.perTask.filter(
      (task) => task.completionStatus === 'complete' || task.completionStatus === 'answered',
    ).length / Math.max(1, timing.perTask.length);
  return {
    exam_readiness: Math.min(0.9, ratio * 0.9),
    exam_time_management: timing.expired ? 0.35 : 0.7,
    task_switching_discipline: 0.65,
    completion_reliability: completion,
    performance_under_time_pressure: Math.min(0.85, ratio * (timing.expired ? 0.55 : 0.85)),
    cross_topic_transfer: Math.min(0.85, ratio * completion),
  };
}
