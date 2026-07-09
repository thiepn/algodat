import type { ExamProfileCoverage } from '../../../content/schemas';

export function computeProfileCoverage(profile: ExamProfileCoverage): ExamProfileCoverage {
  if (profile.unsupportedSlots.length === 0 && profile.partiallySupportedSlots.length === 0)
    return { ...profile, coverageStatus: 'fully_supported', startable: true, fullyGradable: true };
  if (profile.supportedSlots.length > 0 || profile.partiallySupportedSlots.length > 0)
    return {
      ...profile,
      coverageStatus: 'partially_supported',
      startable: false,
      fullyGradable: false,
    };
  return { ...profile, coverageStatus: 'metadata_only', startable: false, fullyGradable: false };
}
