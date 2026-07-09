import type { ExamPackage } from '../../../content/schemas';
import { aggregateExamScores } from '../scoring/aggregate';
import { computeExamTimingAnalytics } from '../analytics/timing';
import { buildExamResultReport } from '../report/build';
import { gradeExamTask } from '../scoring/grade';
import type { ExamResultReport, ExamSession } from '../types';

export function finalizeExamSubmission(
  session: ExamSession,
  examPackage: ExamPackage,
  now: string,
): { session: ExamSession; report: ExamResultReport } {
  const submitted = {
    ...session,
    status: 'submitted' as const,
    submittedAt: session.submittedAt ?? now,
  };
  const scores = examPackage.taskSlots.map((task) =>
    gradeExamTask(task, submitted.taskStates[task.taskSlotId]?.answer),
  );
  const aggregate = aggregateExamScores(scores);
  const timing = computeExamTimingAnalytics(submitted, new Date(now).getTime());
  const graded = { ...submitted, status: 'graded' as const, gradedAt: now };
  return {
    session: graded,
    report: buildExamResultReport({ session: graded, examPackage, aggregate, timing }),
  };
}
