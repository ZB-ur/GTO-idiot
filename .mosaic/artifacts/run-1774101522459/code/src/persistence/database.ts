// ============================================================
// Dexie.js IndexedDB database — schema & migrations
// ============================================================

import Dexie, { type Table } from 'dexie';
import type { Session, SessionStatus } from '../types/session';
import type { HandHistory, HandHistorySummary } from '../types';

// ============================================================
// Stored record types (IndexedDB-friendly flat shapes)
// ============================================================

/** Session record as stored in IndexedDB */
export interface SessionRecord {
  id: string;
  status: SessionStatus;
  /** JSON-serialised Session object (players, blinds, etc.) */
  data: Session;
  startedAt: string;
  endedAt: string | null;
  profitLossBB: number;
}

/** Hand history record as stored in IndexedDB */
export interface HandHistoryRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  handNumber: number;
  /** Indexed fields pulled up for query performance */
  userPosition: string;
  reachedStreet: string;
  result: 'won' | 'lost' | 'folded';
  profitLossBB: number;
  /** Full hand history data */
  data: HandHistory;
  /** Pre-computed summary for list views */
  summary: HandHistorySummary;
}

// ============================================================
// Database class
// ============================================================

export class GtoIdiotDatabase extends Dexie {
  sessions!: Table<SessionRecord, string>;
  handHistories!: Table<HandHistoryRecord, string>;

  constructor() {
    super('gto-idiot-db');

    // Version 1 — initial schema
    this.version(1).stores({
      sessions: 'id, status, startedAt, endedAt',
      handHistories:
        'id, sessionId, timestamp, handNumber, userPosition, reachedStreet, result, [sessionId+timestamp]',
    });
  }
}

// ============================================================
// Singleton instance
// ============================================================

let dbInstance: GtoIdiotDatabase | null = null;

export function getDatabase(): GtoIdiotDatabase {
  if (!dbInstance) {
    dbInstance = new GtoIdiotDatabase();
  }
  return dbInstance;
}

/**
 * Reset the database singleton — useful for testing.
 * Does NOT delete IndexedDB data; call db.delete() first if needed.
 */
export function resetDatabaseInstance(): void {
  dbInstance = null;
}
