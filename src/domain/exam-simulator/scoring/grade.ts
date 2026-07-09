import type { ExamTaskDefinition } from '../../../content/schemas';
import { getExamTaskAdapter } from '../tasks/registry';

export function gradeExamTask(task: ExamTaskDefinition, answer: unknown) {
  return getExamTaskAdapter(task.trainerId).gradeAfterSubmission(answer, task);
}
