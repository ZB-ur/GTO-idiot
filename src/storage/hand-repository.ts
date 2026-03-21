// ============================================================
// GTO Idiot — Hand Repository
// CRUD + query operations for the hands table
// ============================================================

import {
  db,
  toHandRecord,
  toHandSummary,
  type HandRecord,
} from './database';
import type {
  HandHistory,
  HandSummary,
  HandHistoryListResponse,
  HandSortOrder,
  HandResultFilter,
  Position,
  DeviationSeverity,
} from '../types';

// ---------- Create ----------

export async function saveHand(hand: HandHistory): Promise<void> {
  const record = toHandRecord(hand);
  await db.hands.put(record); // put = upsert
}

// ---------- Read (single) ----------

export async function getHand(handId: string): Promise<HandHistory | null> {
  const record = await db.hands.get(handId);
  return record ? stripIndexFields(record) : null;
}

// ---------- Read (list — cross-session) ----------

export interface ListHandsOptions {
  session_id?: string;
  position?: Position;
  result?: HandResultFilter;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort?: HandSortOrder;
}

export async function listHands(
  options: ListHandsOptions = {},
): Promise<HandHistoryListResponse> {
  const {
    session_id,
    position,
    result,
    start_date,
    end_date,
    limit = 50,
    offset = 0,
    sort = 'newest',
  } = options;

  // Start with the full table, then apply JS filters.
  // For session_id we can use the index for an initial narrow.
  let collection = session_id
    ? db.hands.where('session_id').equals(session_id)
    : db.hands.toCollection();

  // Apply additional filters via .filter()
  if (position) {
    collection = collection.filter((h) => h.position === position);
  }
  if (result) {
    collection = collection.filter((h) => matchResult(h.result_bb, result));
  }
  if (start_date) {
    const start = new Date(start_date).getTime();
    collection = collection.filter((h) => new Date(h.date).getTime() >= start);
  }
  if (end_date) {
    const end = new Date(end_date).getTime();
    collection = collection.filter((h) => new Date(h.date).getTime() <= end);
  }

  // We need total before pagination
  const allFiltered = await collection.toArray();
  const total = allFiltered.length;

  // Sort
  sortHandRecords(allFiltered, sort);

  // Paginate
  const page = allFiltered.slice(offset, offset + limit);

  return {
    hands: page.map(toHandSummary),
    total,
    has_more: offset + limit < total,
  };
}

// ---------- Read (list — within session) ----------

export async function listSessionHands(
  sessionId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<{ hands: HandSummary[]; total: number }> {
  const { limit = 20, offset = 0 } = options;

  const allForSession = await db.hands
    .where('session_id')
    .equals(sessionId)
    .toArray();

  // Sort by hand_number descending (newest first)
  allForSession.sort((a, b) => b.hand_number - a.hand_number);

  const total = allForSession.length;
  const page = allForSession.slice(offset, offset + limit);

  return {
    hands: page.map(toHandSummary),
    total,
  };
}

// ---------- Update ----------

export async function updateHandDeviations(
  handId: string,
  hasDeviation: boolean,
  maxSeverity: DeviationSeverity | null,
): Promise<void> {
  await db.hands.update(handId, {
    has_deviation: hasDeviation,
    max_deviation_severity: maxSeverity,
  });
}

/** Bulk-update a hand record (e.g. after showdown completes the history) */
export async function updateHand(
  handId: string,
  updates: Partial<HandHistory>,
): Promise<void> {
  const existing = await db.hands.get(handId);
  if (!existing) return;

  const merged: HandRecord = {
    ...existing,
    ...updates,
    id: handId, // ensure id is never overwritten
  };

  // Re-derive flat index fields if relevant source changed
  if (updates.hero_position !== undefined) {
    merged.position = updates.hero_position;
  }
  if (updates.hero_result_bb !== undefined) {
    merged.result_bb = updates.hero_result_bb;
  }
  if (updates.actions !== undefined && updates.actions.length > 0) {
    merged.street_reached = updates.actions[updates.actions.length - 1].street;
  }
  if (updates.players !== undefined) {
    const hero = updates.players.find((p) => !p.is_bot);
    merged.hero_hand_json = hero?.hole_cards ? JSON.stringify(hero.hole_cards) : null;
  }

  await db.hands.put(merged);
}

// ---------- Delete ----------

export async function deleteHand(handId: string): Promise<boolean> {
  const existing = await db.hands.get(handId);
  if (!existing) return false;
  await db.hands.delete(handId);
  return true;
}

export async function deleteSessionHands(sessionId: string): Promise<number> {
  return db.hands.where('session_id').equals(sessionId).delete();
}

// ---------- Aggregation helpers ----------

/** Get count of hands for a session */
export async function countSessionHands(sessionId: string): Promise<number> {
  return db.hands.where('session_id').equals(sessionId).count();
}

/** Get all hand records for a session (for stats computation) */
export async function getAllSessionHandRecords(sessionId: string): Promise<HandRecord[]> {
  return db.hands.where('session_id').equals(sessionId).toArray();
}

/** Get all hand records across all sessions (for global stats) */
export async function getAllHandRecords(): Promise<HandRecord[]> {
  return db.hands.toArray();
}

// ---------- Internal helpers ----------

function matchResult(resultBb: number, filter: HandResultFilter): boolean {
  switch (filter) {
    case 'win':
      return resultBb > 0;
    case 'lose':
      return resultBb < 0;
    case 'break_even':
      return resultBb === 0;
  }
}

function sortHandRecords(records: HandRecord[], sort: HandSortOrder): void {
  switch (sort) {
    case 'newest':
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
    case 'oldest':
      records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
    case 'biggest_win':
      records.sort((a, b) => b.result_bb - a.result_bb);
      break;
    case 'biggest_loss':
      records.sort((a, b) => a.result_bb - b.result_bb);
      break;
  }
}

/** Strip the extra index fields to return a clean HandHistory */
function stripIndexFields(record: HandRecord): HandHistory {
  const {
    position: _position,
    result_bb: _resultBb,
    street_reached: _streetReached,
    has_deviation: _hasDeviation,
    max_deviation_severity: _maxSeverity,
    hero_hand_json: _heroHandJson,
    ...handHistory
  } = record;
  return handHistory;
}
