import type { ExamProfileCoverage } from '../../../content/schemas';
import type { ValidationResult } from '../types';

export function validateExamProfile(
  profile: ExamProfileCoverage,
): ValidationResult<ExamProfileCoverage> {
  if (profile.coverageStatus !== 'fully_supported' && profile.startable)
    return { ok: false, errors: ['Unvollständiges historisches Profil darf nicht startbar sein.'] };
  return { ok: true, value: profile, errors: [] };
}
