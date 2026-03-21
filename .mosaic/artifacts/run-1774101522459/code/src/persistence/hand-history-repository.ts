// ============================================================
// Hand history repository — CRUD + query for hand records
// ============================================================

import type { Position, Street } from '../types/game';
import type { HandHistory, HandHistorySummary, HandHistoryList } from '../types';
import { getDatabase, type HandHistoryRecord } from './database';

// ============================================================
// Helpers
// ============================================================

function buildSummary(hand: HandHistory): HandHistorySummary {
  // Find the human player's seat record
  const humanSeat = hand.seats.find((s) => s.isHuman);
  if (!humanSeat) {
    throw new Error(`Hand ${hand.id} has no human seat record`);
  }

  // Determine result from settlement
  const chipMove = hand.settlement.chipMovements.find(
    (cm) => cm.seat === humanSeat.seat,
  );
  const profitLossBB = chipMove?.changesBB ?? 0;

  // Check if user folded
  const userFolded = hand.actionSequence.some(
    (a) => a.seat === humanSeat.seat && a.action === 'fold',
  );

  let result: 'won' | 'lost' | 'folded';
  if (userFolded) {
    result = 'folded';
  } else if (profitLossBB > 0) {
    result = 'won';
  } else {
    result = 'lost';
  }

  // Determine the last street the user was active
  const userActions = hand.actionSequence.filter(
    (a) => a.seat === humanSeat.seat,
  );
  const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
  let reachedStreet: Street = 'preflop';
  for (const action of userActions) {
    if (streetOrder.indexOf(action.street) > streetOrder.indexOf(reachedStreet)) {
      reachedStreet = action.street;
    }
  }

  return {
    id: hand.id,
    sessionId: hand.sessionId,
    timestamp: hand.timestamp,
    handNumber: hand.handNumber,
    userPosition: humanSeat.position,
    userHoleCards: humanSeat.holeCards,
    communityCards: hand.communityCards,
    result,
    profitLossBB,
    reachedStreet,
  };
}

function toRecord(hand: HandHistory): HandHistoryRecord {
  const summary = buildSummary(hand);
  return {
    id: hand.id,
    sessionId: hand.sessionId,
    timestamp: hand.timestamp,
    handNumber: hand.handNumber,
    userPosition: summary.userPosition,
    reachedStreet: summary.reachedStreet,
    result: summary.result,
    profitLossBB: summary.profitLossBB,
    data: hand,
    summary,
  };
}

// ============================================================
// Repository
// ============================================================

export interface HandHistoryQuery {
  cursor?: string;
  limit?: number;
  sessionId?: string;
  position?: Position;
  street?: Street;
}

export const handHistoryRepository = {
  /**
   * Save a completed hand to history.
   */
  async save(hand: HandHistory): Promise<void> {
    const db = getDatabase();
    const record = toRecord(hand);
    await db.handHistories.put(record);
  },

  /**
   * Get full hand history by ID.
   */
  async getById(handId: string): Promise<HandHistory | undefined> {
    const db = getDatabase();
    const record = await db.handHistories.get(handId);
    return record?.data;
  },

  /**
   * List hand history with cursor-based pagination and optional filters.
   */
  async list(query: HandHistoryQuery = {}): Promise<HandHistoryList> {
    const db = getDatabase();
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);

    // Start with all records ordered by timestamp descending
    let collection = db.handHistories.orderBy('timestamp').reverse();

    // Get total count before filtering (for the specific filters)
    let allRecords = await collection.toArray();

    // Apply filters
    if (query.sessionId) {
      allRecords = allRecords.filter((r) => r.sessionId === query.sessionId);
    }
    if (query.position) {
      allRecords = allRecords.filter((r) => r.userPosition === query.position);
    }
    if (query.street) {
      allRecords = allRecords.filter((r) => r.reachedStreet === query.street);
    }

    const total = allRecords.length;

    // Apply cursor (skip records until we find the cursor ID)
    let startIdx = 0;
    if (query.cursor) {
      const cursorIdx = allRecords.findIndex((r) => r.id === query.cursor);
      if (cursorIdx >= 0) {
        startIdx = cursorIdx + 1;
      }
    }

    const page = allRecords.slice(startIdx, startIdx + limit);
    const hasMore = startIdx + limit < allRecords.length;

    return {
      hands: page.map((r) => r.summary),
      total,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  },

  /**
   * Delete a single hand history record.
   * Returns true if deleted, false if not found.
   */
  async delete(handId: string): Promise<boolean> {
    const db = getDatabase();
    const existing = await db.handHistories.get(handId);
    if (!existing) return false;
    await db.handHistories.delete(handId);
    return true;
  },

  /**
   * Delete all hand histories for a session.
   */
  async deleteBySession(sessionId: string): Promise<number> {
    const db = getDatabase();
    return db.handHistories.where('sessionId').equals(sessionId).delete();
  },

  /**
   * Get all hand history records for a session (for stats computation).
   */
  async getAllBySession(sessionId: string): Promise<HandHistoryRecord[]> {
    const db = getDatabase();
    return db.handHistories
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');
  },

  /**
   * Get all records ordered by timestamp (for global stats).
   */
  async getAll(): Promise<HandHistoryRecord[]> {
    const db = getDatabase();
    return db.handHistories.orderBy('timestamp').toArray();
  },

  /**
   * Count total hand history records, optionally filtered by session.
   */
  async count(sessionId?: string): Promise<number> {
    const db = getDatabase();
    if (sessionId) {
      return db.handHistories.where('sessionId').equals(sessionId).count();
    }
    return db.handHistories.count();
  },
};
