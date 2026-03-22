import { getDatabase } from './database';
import type { HandHistory, HandSummary, AppError } from '../types/poker';
import type { ListHandsParams } from '../types/session';

function createStorageError(message: string, details?: Record<string, unknown>): AppError {
  return { code: 'STORAGE_ERROR', message, details };
}

function createNotFoundError(handId: string): AppError {
  return { code: 'NOT_FOUND', message: `Hand not found: ${handId}` };
}

export const handRepository = {
  /**
   * Save a completed hand history.
   */
  async create(hand: HandHistory): Promise<HandHistory> {
    try {
      const db = await getDatabase();
      await db.put('hands', hand);
      return hand;
    } catch (error) {
      throw createStorageError('Failed to save hand history', {
        handId: hand.handId,
        cause: String(error),
      });
    }
  },

  /**
   * Get a hand history by ID.
   */
  async getById(handId: string): Promise<HandHistory> {
    try {
      const db = await getDatabase();
      const hand = await db.get('hands', handId);
      if (!hand) {
        throw createNotFoundError(handId);
      }
      return hand;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to get hand history', {
        handId,
        cause: String(error),
      });
    }
  },

  /**
   * List hands for a session with pagination.
   * Returns hand summaries sorted by hand number ascending.
   */
  async listBySession(
    sessionId: string,
    params: ListHandsParams = {}
  ): Promise<{ hands: HandSummary[]; total: number }> {
    const { offset = 0, limit = 50 } = params;

    try {
      const db = await getDatabase();
      const allHands = await db.getAllFromIndex('hands', 'by-sessionId', sessionId);

      // Sort by hand number ascending
      allHands.sort((a, b) => a.handNumber - b.handNumber);

      const total = allHands.length;
      const paginated = allHands.slice(offset, offset + limit);

      const summaries: HandSummary[] = paginated.map((hand) => {
        const humanPlayer = hand.players.find((p) => !p.isBot);
        const humanPosition = humanPlayer?.position ?? 'UTG';
        const humanHoleCards = humanPlayer?.holeCards;

        return {
          handId: hand.handId,
          handNumber: hand.handNumber,
          humanPosition,
          humanHoleCards,
          humanResult: hand.result.humanNetResult ?? 0,
          gtoConformance: 'conforming' as const, // Will be enriched by review module
        };
      });

      return { hands: summaries, total };
    } catch (error) {
      throw createStorageError('Failed to list hands', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Get all hand histories for a session (for stats/review computation).
   */
  async getAllBySession(sessionId: string): Promise<HandHistory[]> {
    try {
      const db = await getDatabase();
      const hands = await db.getAllFromIndex('hands', 'by-sessionId', sessionId);
      hands.sort((a, b) => a.handNumber - b.handNumber);
      return hands;
    } catch (error) {
      throw createStorageError('Failed to get all hands for session', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Get a specific hand by session and hand number.
   */
  async getBySessionAndNumber(sessionId: string, handNumber: number): Promise<HandHistory> {
    try {
      const db = await getDatabase();
      const hand = await db.getFromIndex(
        'hands',
        'by-sessionId-handNumber',
        [sessionId, handNumber]
      );
      if (!hand) {
        throw createNotFoundError(`${sessionId}#${handNumber}`);
      }
      return hand;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to get hand by session and number', {
        sessionId,
        handNumber,
        cause: String(error),
      });
    }
  },

  /**
   * Delete all hands for a session. Used when deleting a session.
   */
  async deleteBySession(sessionId: string): Promise<number> {
    try {
      const db = await getDatabase();
      const tx = db.transaction('hands', 'readwrite');
      const index = tx.store.index('by-sessionId');
      let cursor = await index.openCursor(sessionId);
      let count = 0;
      while (cursor) {
        await cursor.delete();
        count++;
        cursor = await cursor.continue();
      }
      await tx.done;
      return count;
    } catch (error) {
      throw createStorageError('Failed to delete hands for session', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Count hands in a session.
   */
  async countBySession(sessionId: string): Promise<number> {
    try {
      const db = await getDatabase();
      const hands = await db.getAllKeysFromIndex('hands', 'by-sessionId', sessionId);
      return hands.length;
    } catch (error) {
      throw createStorageError('Failed to count hands', {
        sessionId,
        cause: String(error),
      });
    }
  },
};
