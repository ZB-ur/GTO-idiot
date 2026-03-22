import { describe, it, expect } from 'vitest';
import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, type GtoIdiotDB } from '../../src/db/schema';

describe('IndexedDB Schema', () => {
  it('should create hands object store with correct indexes', async () => {
    const db = await openDB<GtoIdiotDB>(DB_NAME + '-test-schema', DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('hands', { keyPath: 'handId' });
        store.createIndex('by-playedAt', 'playedAt');
        store.createIndex('by-blindLevel', 'blindLevel');
        store.createIndex('by-profit', 'result.playerProfit');
      },
    });
    expect(db.objectStoreNames.contains('hands')).toBe(true);
    const tx = db.transaction('hands', 'readonly');
    const store = tx.objectStore('hands');
    expect(store.indexNames.contains('by-playedAt')).toBe(true);
    expect(store.indexNames.contains('by-blindLevel')).toBe(true);
    expect(store.indexNames.contains('by-profit')).toBe(true);
    db.close();
  });

  it('should open database and upgrade schema', async () => {
    const db = await openDB<GtoIdiotDB>(DB_NAME + '-test-upgrade', DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('hands', { keyPath: 'handId' });
        store.createIndex('by-playedAt', 'playedAt');
        store.createIndex('by-blindLevel', 'blindLevel');
        store.createIndex('by-profit', 'result.playerProfit');
      },
    });
    expect(db.version).toBe(DB_VERSION);
    db.close();
  });
});
