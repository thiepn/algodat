import contentManifest from '../../content/generated/content-manifest.json';
import { getDatabase } from './database';
import { DATABASE_VERSION, PersistenceExportSchema, type PersistenceExport } from './schema';

export async function exportProgress(): Promise<PersistenceExport> {
  const database = await getDatabase();
  return PersistenceExportSchema.parse({
    databaseVersion: DATABASE_VERSION,
    contentVersion: contentManifest.contentVersion,
    exportedAt: new Date().toISOString(),
    studySessions: await database.getAll('studySessions'),
    practiceAttempts: await database.getAll('practiceAttempts'),
    masteryRecords: await database.getAll('masteryRecords'),
    errorRecords: await database.getAll('errorRecords'),
    examSessions: await database.getAll('examSessions'),
    examSnapshots: await database.getAll('examSnapshots'),
    examResults: await database.getAll('examResults'),
    diagnosticSessions: await database.getAll('diagnosticSessions'),
    studyPlans: await database.getAll('studyPlans'),
    studyPlanSettings: await database.getAll('studyPlanSettings'),
    reviewSchedules: await database.getAll('reviewSchedules'),
    cheatSheets: await database.getAll('cheatSheets'),
    preferences: (await database.get('preferences', 'preferences')) ?? null,
  });
}

export async function importProgress(
  input: unknown,
): Promise<{ imported: number; contentVersionChanged: boolean }> {
  const payload = PersistenceExportSchema.parse(input);
  const database = await getDatabase();
  const transaction = database.transaction(
    [
      'studySessions',
      'practiceAttempts',
      'masteryRecords',
      'errorRecords',
      'examSessions',
      'examSnapshots',
      'examResults',
      'diagnosticSessions',
      'studyPlans',
      'studyPlanSettings',
      'reviewSchedules',
      'cheatSheets',
      'preferences',
    ],
    'readwrite',
  );
  await Promise.all([
    transaction.objectStore('studySessions').clear(),
    transaction.objectStore('practiceAttempts').clear(),
    transaction.objectStore('masteryRecords').clear(),
    transaction.objectStore('errorRecords').clear(),
    transaction.objectStore('examSessions').clear(),
    transaction.objectStore('examSnapshots').clear(),
    transaction.objectStore('examResults').clear(),
    transaction.objectStore('diagnosticSessions').clear(),
    transaction.objectStore('studyPlans').clear(),
    transaction.objectStore('studyPlanSettings').clear(),
    transaction.objectStore('reviewSchedules').clear(),
    transaction.objectStore('cheatSheets').clear(),
    transaction.objectStore('preferences').clear(),
  ]);
  for (const value of payload.studySessions)
    await transaction.objectStore('studySessions').put(value, value.id);
  for (const value of payload.practiceAttempts)
    await transaction.objectStore('practiceAttempts').put(value, value.id);
  for (const value of payload.masteryRecords)
    await transaction.objectStore('masteryRecords').put(value, value.id);
  for (const value of payload.errorRecords)
    await transaction.objectStore('errorRecords').put(value, value.id);
  for (const value of payload.examSessions)
    await transaction.objectStore('examSessions').put(value, value.id);
  for (const value of payload.examSnapshots)
    await transaction.objectStore('examSnapshots').put(value, value.id);
  for (const value of payload.examResults)
    await transaction.objectStore('examResults').put(value, value.id);
  for (const value of payload.diagnosticSessions)
    await transaction.objectStore('diagnosticSessions').put(value, value.id);
  for (const value of payload.studyPlans)
    await transaction.objectStore('studyPlans').put(value, value.id);
  for (const value of payload.studyPlanSettings)
    await transaction.objectStore('studyPlanSettings').put(value, value.id);
  for (const value of payload.reviewSchedules)
    await transaction.objectStore('reviewSchedules').put(value, value.id);
  for (const value of payload.cheatSheets)
    await transaction.objectStore('cheatSheets').put(value, value.id);
  if (payload.preferences)
    await transaction.objectStore('preferences').put(payload.preferences, payload.preferences.id);
  await transaction.done;
  return {
    imported:
      payload.studySessions.length +
      payload.practiceAttempts.length +
      payload.masteryRecords.length +
      payload.errorRecords.length +
      payload.examSessions.length +
      payload.examSnapshots.length +
      payload.examResults.length +
      payload.diagnosticSessions.length +
      payload.studyPlans.length +
      payload.studyPlanSettings.length +
      payload.reviewSchedules.length +
      payload.cheatSheets.length +
      (payload.preferences ? 1 : 0),
    contentVersionChanged: payload.contentVersion !== contentManifest.contentVersion,
  };
}
