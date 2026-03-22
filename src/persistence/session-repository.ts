import { getDatabase } from './database';
import type { Session, SessionSummary, ListSessionsParams, ListSessionsResult } from '../types/session';
import type { AppError } from '../types/poker';

function createStorageError(message: string, details?: Record<string, unknown>): AppError {
  return { code: 'STORAGE_ERROR', message, details };
}

function createNotFoundError(id: string): AppError {
  return { code: 'NOT_FOUND', message: `Session not found: ${id}` };
}

export const sessionRepository = {
  /**
   * Create a new session record.
   */
  async create(session: Session): Promise<Session> {
    try {
      const db = await getDatabase();
      await db.put('sessions', session);
      return session;
    } catch (error) {
      throw createStorageError('Failed to create session', {
        sessionId: session.id,
        cause: String(error),
      });
    }
  },

  /**
   * Get a session by ID.
   */
  async getById(sessionId: string): Promise<Session> {
    try {
      const db = await getDatabase();
      const session = await db.get('sessions', sessionId);
      if (!session) {
        throw createNotFoundError(sessionId);
      }
      return session;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to get session', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Update an existing session.
   */
  async update(session: Session): Promise<Session> {
    try {
      const db = await getDatabase();
      const existing = await db.get('sessions', session.id);
      if (!existing) {
        throw createNotFoundError(session.id);
      }
      await db.put('sessions', session);
      return session;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to update session', {
        sessionId: session.id,
        cause: String(error),
      });
    }
  },

  /**
   * Delete a session and all associated hand histories and session state.
   */
  async delete(sessionId: string): Promise<void> {
    try {
      const db = await getDatabase();
      const existing = await db.get('sessions', sessionId);
      if (!existing) {
        throw createNotFoundError(sessionId);
      }

      const tx = db.transaction(['sessions', 'hands', 'sessionState'], 'readwrite');

      // Delete session
      await tx.objectStore('sessions').delete(sessionId);

      // Delete all hands for this session
      const handIndex = tx.objectStore('hands').index('by-sessionId');
      let cursor = await handIndex.openCursor(sessionId);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }

      // Delete session state if exists
      await tx.objectStore('sessionState').delete(sessionId);

      await tx.done;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to delete session', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * List sessions with pagination and sorting.
   * Computes summary stats by aggregating hand histories.
   */
  async list(params: ListSessionsParams = {}): Promise<ListSessionsResult> {
    const {
      offset = 0,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    try {
      const db = await getDatabase();
      const allSessions = await db.getAll('sessions');

      // Build summaries with computed stats
      const summaries: SessionSummary[] = await Promise.all(
        allSessions.map(async (session) => {
          const hands = await db.getAllFromIndex('hands', 'by-sessionId', session.id);

          let netProfitLossBB = 0;
          let gtoConformingCount = 0;
          let totalDecisions = 0;

          for (const hand of hands) {
            netProfitLossBB += hand.result.humanNetResult ?? 0;
            // Count decisions from streets for conformance approximation
            for (const street of hand.streets) {
              for (const action of street.actions) {
                if (action.playerId && !action.playerName.startsWith('BOT')) {
                  totalDecisions++;
                }
              }
            }
          }

          // If no decisions yet, conformance is 100%
          const gtoConformance = totalDecisions > 0
            ? (gtoConformingCount / totalDecisions) * 100
            : 100;

          return {
            id: session.id,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            status: session.status,
            handCount: session.handCount,
            netProfitLossBB,
            gtoConformance,
          };
        })
      );

      // Sort
      summaries.sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'date':
            cmp = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
            break;
          case 'hands':
            cmp = a.handCount - b.handCount;
            break;
          case 'profitLoss':
            cmp = a.netProfitLossBB - b.netProfitLossBB;
            break;
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });

      const total = summaries.length;
      const paginated = summaries.slice(offset, offset + limit);

      return { sessions: paginated, total };
    } catch (error) {
      throw createStorageError('Failed to list sessions', {
        cause: String(error),
      });
    }
  },

  /**
   * Check if a session exists.
   */
  async exists(sessionId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const key = await db.getKey('sessions', sessionId);
      return key !== undefined;
    } catch {
      return false;
    }
  },
};
