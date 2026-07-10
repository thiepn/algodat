import { afterEach, describe, expect, it } from 'vitest';
import { deleteDB, openDB } from 'idb';
import { content } from '../../src/content/loaders/content';
import { createExamSession, createRecoverySnapshot } from '../../src/domain/exam-simulator';
import { getDatabase, resetDatabase } from '../../src/persistence/database/database';
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  PersistenceExportSchema,
} from '../../src/persistence/database/schema';
import { exportProgress, importProgress } from '../../src/persistence/database/transfer';
import {
  cheatSheetRepository,
  diagnosticSessionRepository,
  examSessionRepository,
  examSnapshotRepository,
  preferencesRepository,
  reviewScheduleRepository,
  studyPlanRepository,
  studyPlanSettingsRepository,
} from '../../src/persistence/repositories';

afterEach(async () => resetDatabase());

describe('IndexedDB-Grundlage', () => {
  it('legt alle Stores an', async () => {
    const database = await getDatabase();
    expect(database.version).toBe(DATABASE_VERSION);
    expect([...database.objectStoreNames]).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it('migriert Version 13 ohne lokale PDF-Stores und ohne Lernfortschritt zu verlieren', async () => {
    await deleteDB(DATABASE_NAME);
    const oldDatabase = await openDB(DATABASE_NAME, 12, {
      upgrade(database) {
        for (const storeName of [
          'studySessions',
          'practiceAttempts',
          'masteryRecords',
          'errorRecords',
          'preferences',
          'examSessions',
          'examSnapshots',
          'examResults',
          'diagnosticSessions',
          'studyPlans',
          'studyPlanSettings',
          'reviewSchedules',
          'cheatSheets',
          'localDocuments',
          'localTaskRegions',
        ]) {
          if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName);
        }
      },
    });
    await oldDatabase.put(
      'preferences',
      {
        id: 'preferences',
        selectedExamProfileId: 'klausur-2021',
        reducedMotion: true,
        updatedAt: '2026-07-10T00:00:00.000Z',
      },
      'preferences',
    );
    await oldDatabase.put('localDocuments', { id: 'private-pdf-binding' }, 'private-pdf-binding');
    await oldDatabase.put('localTaskRegions', { id: 'private-region' }, 'private-region');
    oldDatabase.close();

    const migrated = await getDatabase();
    expect(migrated.version).toBe(DATABASE_VERSION);
    expect([...migrated.objectStoreNames]).not.toContain('localDocuments');
    expect([...migrated.objectStoreNames]).not.toContain('localTaskRegions');
    expect((await preferencesRepository.get('preferences'))?.selectedExamProfileId).toBe(
      'klausur-2021',
    );
  });

  it('exportiert und importiert validierte Präferenzen', async () => {
    await preferencesRepository.put({
      id: 'preferences',
      selectedExamProfileId: 'klausur-2021',
      reducedMotion: false,
      updatedAt: '2026-07-06',
    });
    const exported = await exportProgress();
    expect(PersistenceExportSchema.parse(exported).preferences?.selectedExamProfileId).toBe(
      'klausur-2021',
    );
    await resetDatabase();
    expect((await importProgress(exported)).imported).toBe(1);
    expect((await preferencesRepository.get('preferences'))?.selectedExamProfileId).toBe(
      'klausur-2021',
    );
  });

  it('exportiert und importiert ExamSessions und Snapshots', async () => {
    const examPackage = content.examPackages[0];
    if (!examPackage) throw new Error('Prüfungspaket fehlt.');
    const session = createExamSession({
      examPackage,
      mode: 'strict_exam',
      now: '2026-07-08T10:00:00.000Z',
      contentVersion: content.manifest.contentVersion,
    });
    await examSessionRepository.put({
      ...session,
      schemaVersion: '1.0.0',
      sourceRefs: examPackage.sourceRefs,
      verificationStatus: 'verified_against_official_source',
      lastReviewed: '2026-07-08',
      duplicateGroupId: null,
      taskPayloadVersions: {},
      recoveryMetadata: {},
      appVersion: content.manifest.contentVersion,
    });
    const snapshot = createRecoverySnapshot({
      session,
      savedAt: '2026-07-08T10:01:00.000Z',
      adapterVersions: {},
      taskPayloadVersions: {},
    });
    await examSnapshotRepository.put(snapshot);
    const exported = await exportProgress();
    expect(exported.examSessions).toHaveLength(1);
    expect(exported.examSnapshots).toHaveLength(1);
    await resetDatabase();
    expect((await importProgress(exported)).imported).toBe(2);
    expect(await examSessionRepository.get(session.id)).toBeDefined();
  });

  it('exportiert und importiert Diagnose-Sessions', async () => {
    await diagnosticSessionRepository.put({
      id: 'diagnostic-test',
      schemaVersion: '1.0.0',
      sessionType: 'foundations_diagnostic',
      configVersion: 'diagnostic-session-config-v1',
      itemBankVersion: content.manifest.contentVersion,
      masteryModelVersion: 'mastery-v13',
      seed: 'persist',
      mode: 'diagnosis',
      competencyTargets: ['foundation-asymptotics'],
      itemIds: ['fd-asymptotics-single-choice'],
      currentItemIndex: 0,
      responses: {},
      confidenceResponses: {},
      startedAt: '2026-07-09T00:00:00.000Z',
      updatedAt: '2026-07-09T00:00:00.000Z',
      completedAt: null,
      durationMs: 0,
      itemResults: [],
      competencyResults: [],
      errors: [],
      recommendations: [],
      finalScore: { points: 0, maxPoints: 0 },
    });
    const exported = await exportProgress();
    expect(exported.diagnosticSessions).toHaveLength(1);
    await resetDatabase();
    expect((await importProgress(exported)).imported).toBe(1);
    expect(await diagnosticSessionRepository.get('diagnostic-test')).toBeDefined();
  });

  it('exportiert und importiert Lernpläne, Einstellungen und Review-Fälligkeiten', async () => {
    await studyPlanSettingsRepository.put({
      id: 'study-plan-settings',
      settingsVersion: 'study-plan-settings-v1',
      examDate: null,
      dailyMinuteBudget: 45,
      maxSingleSessionMinutes: 30,
      learningDaysPerWeek: 5,
      preferredWeekdays: [1, 2, 3, 4, 5],
      preferredModes: ['practice', 'review'],
      focusMode: 'balanced',
      plannedMockExams: 1,
      bufferDays: 1,
      weekStartsOn: 1,
      timezone: 'Europe/Berlin',
      updatedAt: '2026-07-09T00:00:00.000Z',
    });
    await studyPlanRepository.put({
      id: 'plan-2026-07-09',
      planId: 'daily-2026-07-09-test',
      planType: 'daily',
      planDate: '2026-07-09',
      timezone: 'Europe/Berlin',
      settingsVersion: 'study-plan-settings-v1',
      policyVersion: 'study-priority-v1',
      masteryModelVersion: 'mastery-v14',
      evidenceFingerprint: 'fp-test',
      generatedAt: '2026-07-09T00:00:00.000Z',
      generationReason: 'Test',
      activities: [],
      totalEstimatedMinutes: 0,
      completionState: 'open',
      dueReviewCount: 0,
      mainGoal: 'Test',
    });
    await reviewScheduleRepository.put({
      id: 'review-test',
      reviewUnitId: 'foundation-recurrences:master-case-mixup',
      competencyIds: ['foundation-recurrences'],
      errorCodes: ['master-case-mixup'],
      sourceEvidenceIds: ['evidence-1'],
      lastReviewedAt: '2026-07-08T00:00:00.000Z',
      nextDueAt: '2026-07-09T00:00:00.000Z',
      intervalLevel: 0,
      successCount: 0,
      failureCount: 1,
      lastOutcome: 'wrong',
      policyVersion: 'spaced-review-v1',
    });
    const exported = await exportProgress();
    expect(exported.studyPlans).toHaveLength(1);
    expect(exported.studyPlanSettings).toHaveLength(1);
    expect(exported.reviewSchedules).toHaveLength(1);
    await resetDatabase();
    expect((await importProgress(exported)).imported).toBe(3);
    expect(await studyPlanRepository.get('plan-2026-07-09')).toBeDefined();
  });

  it('exportiert und importiert gespeicherte Spickzettel', async () => {
    await cheatSheetRepository.put({
      id: 'cheat-sheet-test',
      sheetId: 'cheat-sheet-test',
      title: 'Test-Spickzettel',
      mode: 'standard',
      presetId: 'preset-standard',
      catalogVersion: content.manifest.contentVersion,
      layoutPolicyVersion: 'cheat-sheet-layout-policy-v1',
      masteryModelVersion: 'mastery-v14',
      createdAt: '2026-07-09T00:00:00.000Z',
      updatedAt: '2026-07-09T00:00:00.000Z',
      selectedBlockIds: ['cs-asymptotik'],
      blockVariants: { 'cs-asymptotik': 'compact' },
      lockedBlockIds: [],
      placements: [{ blockId: 'cs-asymptotik', page: 1, order: 0, variant: 'compact', area: 72 }],
      printSettings: { paper: 'A4', sides: 'duplex', colorRequired: false },
      sourceSummary: [{ sourceId: 'src-35405e721f05', page: 9 }],
      validationStatus: 'valid',
    });
    const exported = await exportProgress();
    expect(exported.cheatSheets).toHaveLength(1);
    await resetDatabase();
    expect((await importProgress(exported)).imported).toBe(1);
    expect(await cheatSheetRepository.get('cheat-sheet-test')).toBeDefined();
  });

  it('weist ungültige Importe zurück', async () => {
    await expect(importProgress({ databaseVersion: 99 })).rejects.toThrow();
  });
});
