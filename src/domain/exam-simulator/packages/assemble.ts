import type { ExamPackage } from '../../../content/schemas';
import { validateExamPackage } from './validate';
import type { ValidationResult } from '../types';

export function assembleExamPackage(examPackage: ExamPackage): ValidationResult<ExamPackage> {
  return validateExamPackage({
    ...examPackage,
    taskSlots: [...examPackage.taskSlots].sort((left, right) =>
      left.taskSlotId.localeCompare(right.taskSlotId),
    ),
  });
}
