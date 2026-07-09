import { checksumPayload } from './snapshot';
import type { ExamRecoverySnapshot, ValidationResult } from '../types';

export function validateRecoverySnapshot(
  snapshot: ExamRecoverySnapshot,
): ValidationResult<ExamRecoverySnapshot> {
  if (snapshot.snapshotVersion !== 'exam-snapshot-v1')
    return { ok: false, errors: ['Snapshot-Version wird nicht unterstützt.'] };
  if (snapshot.checksum !== checksumPayload(snapshot.payload))
    return { ok: false, errors: ['Snapshot-Prüfsumme ist ungültig.'] };
  return { ok: true, value: snapshot, errors: [] };
}
