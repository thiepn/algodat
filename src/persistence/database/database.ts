import { deleteDB, openDB, type IDBPDatabase } from 'idb';
import { migrations } from '../migrations/migrations';
import { DATABASE_NAME, DATABASE_VERSION, type AlgoDatDatabase } from './schema';

let databasePromise: Promise<IDBPDatabase<AlgoDatDatabase>> | undefined;

export function getDatabase(): Promise<IDBPDatabase<AlgoDatDatabase>> {
  databasePromise ??= openDB<AlgoDatDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      for (const migration of migrations) {
        if (
          migration.version > oldVersion &&
          migration.version <= (newVersion ?? DATABASE_VERSION)
        ) {
          migration.upgrade(database, transaction);
        }
      }
    },
  });
  return databasePromise;
}

export async function resetDatabase(): Promise<void> {
  const database = await databasePromise;
  database?.close();
  databasePromise = undefined;
  await deleteDB(DATABASE_NAME);
}
