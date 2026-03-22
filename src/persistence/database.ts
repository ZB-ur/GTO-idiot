import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Session, SessionState } from '../types/session';
import type { HandHistory } from '../types/poker';

const DB_NAME = 'gto-idiot';
const DB_VERSION = 1;

export interface GtoIdiotDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: {
      'by-status': string;
      'by-startedAt': string;
    };
  };
  hands: {
    key: string;
    value: HandHistory;
    indexes: {
      'by-sessionId': string;
      'by-sessionId-handNumber': [string, number];
    };
  };
  sessionState: {
    key: string;
    value: SessionState;
  };
}

let dbInstance: IDBPDatabase<GtoIdiotDB> | null = null;

export async function getDatabase(): Promise<IDBPDatabase<GtoIdiotDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<GtoIdiotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-status', 'status');
        sessionStore.createIndex('by-startedAt', 'startedAt');
      }

      // Hands store (hand history)
      if (!db.objectStoreNames.contains('hands')) {
        const handStore = db.createObjectStore('hands', { keyPath: 'handId' });
        handStore.createIndex('by-sessionId', 'sessionId');
        handStore.createIndex('by-sessionId-handNumber', ['sessionId', 'handNumber']);
      }

      // Session state store (for crash recovery)
      if (!db.objectStoreNames.contains('sessionState')) {
        db.createObjectStore('sessionState', { keyPath: 'sessionId' });
      }
    },
    blocked() {
      console.warn('[GTO-Idiot DB] Database upgrade blocked by another tab');
    },
    blocking() {
      // Close this connection so the other tab can upgrade
      dbInstance?.close();
      dbInstance = null;
    },
    terminated() {
      dbInstance = null;
    },
  });

  return dbInstance;
}

/**
 * Close the database connection. Useful for testing cleanup.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database. Useful for testing or full reset.
 */
export async function deleteDatabase(): Promise<void> {
  await closeDatabase();
  const { deleteDB } = await import('idb');
  await deleteDB(DB_NAME);
}
