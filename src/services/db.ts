import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION } from '../constants';

export type GTOIdiotDB = IDBPDatabase;

let dbInstance: GTOIdiotDB | null = null;

export async function getDB(): Promise<GTOIdiotDB> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store — keyed by sessionId
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
        sessionStore.createIndex('byStatus', 'status');
        sessionStore.createIndex('byCreatedAt', 'createdAt');
        sessionStore.createIndex('byUpdatedAt', 'updatedAt');
      }

      // Hands store — keyed by handId
      if (!db.objectStoreNames.contains('hands')) {
        const handStore = db.createObjectStore('hands', { keyPath: 'handId' });
        handStore.createIndex('bySessionId', 'sessionId');
        handStore.createIndex('byPlayedAt', 'playedAt');
      }

      // Preferences store — keyed by key string
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
