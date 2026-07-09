import type { IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type { AlgoDatDatabase } from '../database/schema';

export interface Migration {
  version: number;
  upgrade: (
    database: IDBPDatabase<AlgoDatDatabase>,
    transaction: IDBPTransaction<
      AlgoDatDatabase,
      ArrayLike<StoreNames<AlgoDatDatabase>>,
      'versionchange'
    >,
  ) => void;
}

export const migrations: Migration[] = [
  {
    version: 1,
    upgrade(database) {
      database.createObjectStore('studySessions');
      const attempts = database.createObjectStore('practiceAttempts');
      attempts.createIndex('by-item', 'itemId');
      database.createObjectStore('masteryRecords');
      const errors = database.createObjectStore('errorRecords');
      errors.createIndex('by-attempt', 'attemptId');
      database.createObjectStore('preferences');
    },
  },
  {
    version: 2,
    upgrade() {
      // Die Store-Struktur bleibt stabil; Version 2 erweitert den validierten Versuchswert.
    },
  },
  {
    version: 3,
    upgrade(_database, transaction) {
      const attempts = transaction.objectStore('practiceAttempts');
      if (!attempts.indexNames.contains('by-trainer'))
        attempts.createIndex('by-trainer', 'trainerId');
    },
  },
  {
    version: 4,
    upgrade() {
      // Phase 4 erweitert PracticeAttempt um trainerKind und canonicalProofVersion.
      // Die Store-Struktur bleibt bewusst unverändert, damit alte lokale Versuche erhalten bleiben.
    },
  },
  {
    version: 5,
    upgrade() {
      // Phase 5 ergänzt Rekurrenz-Laufzeitbeweise als neue Payload-Variante.
      // Die Store-Struktur bleibt bewusst unverändert, damit alte lokale Versuche erhalten bleiben.
    },
  },
  {
    version: 6,
    upgrade() {
      // Phase 6 ergänzt DP-Entwurfsversuche als strukturierte Payload-Variante.
      // Die Store-Struktur bleibt bewusst unverändert, damit alte lokale Versuche erhalten bleiben.
    },
  },
  {
    version: 7,
    upgrade(database) {
      const sessions = database.createObjectStore('examSessions');
      sessions.createIndex('by-package', 'examPackageId');
      const snapshots = database.createObjectStore('examSnapshots');
      snapshots.createIndex('by-session', 'sessionId');
      const results = database.createObjectStore('examResults');
      results.createIndex('by-session', 'sessionId');
    },
  },
  {
    version: 8,
    upgrade(database) {
      const sessions = database.createObjectStore('diagnosticSessions');
      sessions.createIndex('by-mode', 'mode');
    },
  },
  {
    version: 9,
    upgrade(database) {
      const plans = database.createObjectStore('studyPlans');
      plans.createIndex('by-date', 'planDate');
      plans.createIndex('by-type', 'planType');
      database.createObjectStore('studyPlanSettings');
      const reviewSchedules = database.createObjectStore('reviewSchedules');
      reviewSchedules.createIndex('by-next-due', 'nextDueAt');
    },
  },
  {
    version: 10,
    upgrade(database) {
      const cheatSheets = database.createObjectStore('cheatSheets');
      cheatSheets.createIndex('by-updated', 'updatedAt');
      cheatSheets.createIndex('by-mode', 'mode');
    },
  },
];
