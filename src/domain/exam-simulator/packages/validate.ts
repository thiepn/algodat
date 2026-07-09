import type { ExamPackage } from '../../../content/schemas';
import { exactFromContent, exactToNumber } from '../scoring/exact-points';
import type { ValidationResult } from '../types';

export function validateExamPackage(examPackage: ExamPackage): ValidationResult<ExamPackage> {
  const errors: string[] = [];
  if (examPackage.historicalExam)
    errors.push('Startbares Package darf keine historische Klausur sein.');
  if (!examPackage.fullyAutoGradable)
    errors.push('Startbares Package muss vollständig automatisch bewertbar sein.');
  const sum = examPackage.taskSlots.reduce(
    (total, slot) => total + exactToNumber(exactFromContent(slot.examPoints)),
    0,
  );
  if (Math.abs(sum - exactToNumber(exactFromContent(examPackage.totalPoints))) > 1e-9)
    errors.push('Punktesumme stimmt nicht mit Gesamtpunkten überein.');
  return errors.length ? { ok: false, errors } : { ok: true, value: examPackage, errors: [] };
}
