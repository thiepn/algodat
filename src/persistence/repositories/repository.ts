import type { StoreNames } from 'idb';
import { getDatabase } from '../database/database';
import type { AlgoDatDatabase } from '../database/schema';

export interface Repository<T> {
  get(id: string): Promise<T | undefined>;
  list(): Promise<T[]>;
  put(value: T & { id: string }): Promise<void>;
  delete(id: string): Promise<void>;
}

export function createRepository<K extends StoreNames<AlgoDatDatabase>>(
  storeName: K,
): Repository<AlgoDatDatabase[K]['value']> {
  return {
    async get(id) {
      const database = await getDatabase();
      return database.get(storeName, id) as Promise<AlgoDatDatabase[K]['value'] | undefined>;
    },
    async list() {
      const database = await getDatabase();
      return database.getAll(storeName) as Promise<AlgoDatDatabase[K]['value'][]>;
    },
    async put(value) {
      const database = await getDatabase();
      await database.put(storeName, value, value.id);
    },
    async delete(id) {
      const database = await getDatabase();
      await database.delete(storeName, id);
    },
  };
}
