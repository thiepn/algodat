import { validateRecoverySnapshot } from './validate';
import type { ExamRecoverySnapshot, ExamSession, ValidationResult } from '../types';

export function restoreRecoverySnapshot(
  snapshot: ExamRecoverySnapshot,
): ValidationResult<ExamSession> {
  const validation = validateRecoverySnapshot(snapshot);
  if (!validation.ok) return { ok: false, errors: validation.errors };
  return { ok: true, value: snapshot.payload, errors: [] };
}
