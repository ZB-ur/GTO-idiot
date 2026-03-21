// ============================================================
// Session repository — CRUD operations for game sessions
// ============================================================

import type { Session, SessionSummary } from '../types/session';
import { getDatabase, type SessionRecord } from './database';

// ============================================================
// Helpers
// ============================================================

function toSessionRecord(session: Session, profitLossBB = 0): SessionRecord {
  return {
    id: session.id,
    status: session.status,
    data: session,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    profitLossBB,
  };
}

function toSessionSummary(record: SessionRecord): SessionSummary {
  return {
    id: record.id,
    status: record.status,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    handCount: record.data.handCount,
    profitLossBB: record.profitLossBB,
  };
}

// ============================================================
// Repository
// ============================================================

export const sessionRepository = {
  /**
   * Create a new session.
   * Throws if a session with the same ID already exists.
   */
  async create(session: Session): Promise<void> {
    const db = getDatabase();
    await db.sessions.add(toSessionRecord(session));
  },

  /**
   * Get a session by ID. Returns undefined if not found.
   */
  async getById(sessionId: string): Promise<Session | undefined> {
    const db = getDatabase();
    const record = await db.sessions.get(sessionId);
    return record?.data;
  },

  /**
   * Get the currently active (or paused) session, if any.
   * Returns undefined when no resumable session exists.
   */
  async getActive(): Promise<Session | undefined> {
    const db = getDatabase();
    // Check for 'active' first, then 'paused'
    let record = await db.sessions.where('status').equals('active').first();
    if (!record) {
      record = await db.sessions.where('status').equals('paused').first();
    }
    return record?.data;
  },

  /**
   * Update an existing session. Merges profit/loss if provided.
   */
  async update(session: Session, profitLossBB?: number): Promise<void> {
    const db = getDatabase();
    const existing = await db.sessions.get(session.id);
    const pl = profitLossBB ?? existing?.profitLossBB ?? 0;
    await db.sessions.put(toSessionRecord(session, pl));
  },

  /**
   * List all sessions ordered by startedAt descending.
   */
  async listAll(): Promise<{ sessions: SessionSummary[]; total: number }> {
    const db = getDatabase();
    const records = await db.sessions.orderBy('startedAt').reverse().toArray();
    return {
      sessions: records.map(toSessionSummary),
      total: records.length,
    };
  },

  /**
   * Delete a session and all its associated hand histories.
   */
  async delete(sessionId: string): Promise<void> {
    const db = getDatabase();
    await db.transaction('rw', [db.sessions, db.handHistories], async () => {
      await db.sessions.delete(sessionId);
      await db.handHistories.where('sessionId').equals(sessionId).delete();
    });
  },

  /**
   * Check whether an active (non-completed) session exists.
   */
  async hasActiveSession(): Promise<boolean> {
    const db = getDatabase();
    const count = await db.sessions
      .where('status')
      .anyOf(['active', 'paused'])
      .count();
    return count > 0;
  },
};
