import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, type GtoIdiotDB } from './schema';

let dbInstance: IDBPDatabase<GtoIdiotDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<GtoIdiotDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<GtoIdiotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('hands', { keyPath: 'handId' });
      store.createIndex('by-playedAt', 'playedAt');
      store.createIndex('by-blindLevel', 'blindLevel');
      store.createIndex('by-profit', 'result.playerProfit');
    },
  });
  return dbInstance;
}

export { type GtoIdiotDB } from './schema';
