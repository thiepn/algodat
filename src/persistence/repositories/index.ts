import { createRepository } from './repository';

export const studySessionRepository = createRepository('studySessions');
export const practiceAttemptRepository = createRepository('practiceAttempts');
export const masteryRepository = createRepository('masteryRecords');
export const errorRepository = createRepository('errorRecords');
export const preferencesRepository = createRepository('preferences');
export const examSessionRepository = createRepository('examSessions');
export const examSnapshotRepository = createRepository('examSnapshots');
export const examResultRepository = createRepository('examResults');
export const diagnosticSessionRepository = createRepository('diagnosticSessions');
export const studyPlanRepository = createRepository('studyPlans');
export const studyPlanSettingsRepository = createRepository('studyPlanSettings');
export const reviewScheduleRepository = createRepository('reviewSchedules');
export const cheatSheetRepository = createRepository('cheatSheets');
export const localDocumentRepository = createRepository('localDocuments');

export type { Repository } from './repository';
