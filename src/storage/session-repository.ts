// ============================================================
// GTO Idiot — Session Repository
// CRUD + query operations for the sessions table
// ============================================================

import { db, fromSessionRecord, type SessionRecord } from './database';
import type {
  Session,
  SessionStatus,
  CreateSessionRequest,
  RecoverSessionResponse,
} from '../types';

// ---------- Create ----------

export async function createSession(request: CreateSessionRequest): Promise<Session> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const record: SessionRecord = {
    id,
    status: 'active',
    config: {
      bots: request.bots,
      blinds: request.blinds,
      starting_stack: 100, // default 100 BB
    },
    hand_count: 0,
    current_hand_id: null,
    player_stack: 100, // starts at starting_stack
    created_at: now,
    updated_at: now,
  };

  await db.sessions.add(record);
  return fromSessionRecord(record);
}

// ---------- Read ----------

export async function getSession(sessionId: string): Promise<Session | null> {
  const record = await db.sessions.get(sessionId);
  return record ? fromSessionRecord(record) : null;
}

export async function listSessions(options: {
  status?: SessionStatus;
  limit?: number;
  offset?: number;
} = {}): Promise<{ sessions: Session[]; total: number }> {
  const { status, limit = 20, offset = 0 } = options;

  let collection = status
    ? db.sessions.where('status').equals(status)
    : db.sessions.toCollection();

  const total = await collection.count();

  // Re-create collection for the actual query (Dexie collections are consumed once)
  collection = status
    ? db.sessions.where('status').equals(status)
    : db.sessions.toCollection();

  const records = await collection
    .reverse()        // newest first (by insertion order / primary key)
    .offset(offset)
    .limit(limit)
    .sortBy('created_at')
    .then((arr) => arr.reverse()); // sortBy is asc-only, reverse for desc

  return {
    sessions: records.map(fromSessionRecord),
    total,
  };
}

// ---------- Update ----------

export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<SessionRecord, 'status' | 'hand_count' | 'current_hand_id' | 'player_stack'>>,
): Promise<Session | null> {
  const now = new Date().toISOString();
  const count = await db.sessions.update(sessionId, {
    ...updates,
    updated_at: now,
  });

  if (count === 0) return null;
  return getSession(sessionId);
}

export async function pauseSession(sessionId: string): Promise<Session | null> {
  return updateSession(sessionId, { status: 'paused' });
}

export async function resumeSession(sessionId: string): Promise<Session | null> {
  return updateSession(sessionId, { status: 'active' });
}

export async function endSession(sessionId: string): Promise<Session | null> {
  return updateSession(sessionId, { status: 'completed', current_hand_id: null });
}

export async function incrementHandCount(
  sessionId: string,
  currentHandId: string | null,
): Promise<void> {
  await db.transaction('rw', db.sessions, async () => {
    const record = await db.sessions.get(sessionId);
    if (!record) return;
    await db.sessions.update(sessionId, {
      hand_count: record.hand_count + 1,
      current_hand_id: currentHandId,
      updated_at: new Date().toISOString(),
    });
  });
}

export async function updatePlayerStack(
  sessionId: string,
  newStack: number,
): Promise<void> {
  await db.sessions.update(sessionId, {
    player_stack: newStack,
    updated_at: new Date().toISOString(),
  });
}

// ---------- Recovery ----------

export async function recoverSession(): Promise<RecoverSessionResponse> {
  // Find the most recent active or paused session
  const record = await db.sessions
    .where('status')
    .anyOf('active', 'paused')
    .reverse()
    .sortBy('updated_at')
    .then((arr) => (arr.length > 0 ? arr.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] : undefined));

  if (!record) {
    return { has_unfinished: false, session: null };
  }

  return {
    has_unfinished: true,
    session: fromSessionRecord(record),
  };
}

// ---------- Delete ----------

export async function deleteSession(sessionId: string): Promise<boolean> {
  const existing = await db.sessions.get(sessionId);
  if (!existing) return false;
  await db.sessions.delete(sessionId);
  return true;
}

/** Delete all sessions and their associated hands */
export async function deleteAllSessions(): Promise<void> {
  await db.transaction('rw', [db.sessions, db.hands], async () => {
    await db.sessions.clear();
    await db.hands.clear();
  });
}
