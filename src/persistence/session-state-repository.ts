import { getDatabase } from './database';
import type { SessionState } from '../types/session';
import type { AppError } from '../types/poker';

function createStorageError(message: string, details?: Record<string, unknown>): AppError {
  return { code: 'STORAGE_ERROR', message, details };
}

function createNotFoundError(sessionId: string): AppError {
  return { code: 'NOT_FOUND', message: `Session state not found: ${sessionId}` };
}

export const sessionStateRepository = {
  /**
   * Save or update session state for crash recovery.
   * Called on every action to ensure recoverability.
   */
  async save(state: SessionState): Promise<SessionState> {
    try {
      const db = await getDatabase();
      await db.put('sessionState', state);
      return state;
    } catch (error) {
      throw createStorageError('Failed to save session state', {
        sessionId: state.sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Get session state for crash recovery.
   */
  async getBySessionId(sessionId: string): Promise<SessionState> {
    try {
      const db = await getDatabase();
      const state = await db.get('sessionState', sessionId);
      if (!state) {
        throw createNotFoundError(sessionId);
      }
      return state;
    } catch (error) {
      if ((error as AppError).code === 'NOT_FOUND') throw error;
      throw createStorageError('Failed to get session state', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Delete session state (called when session ends).
   */
  async delete(sessionId: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.delete('sessionState', sessionId);
    } catch (error) {
      throw createStorageError('Failed to delete session state', {
        sessionId,
        cause: String(error),
      });
    }
  },

  /**
   * Check if there's a recoverable session state.
   */
  async exists(sessionId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const key = await db.getKey('sessionState', sessionId);
      return key !== undefined;
    } catch {
      return false;
    }
  },

  /**
   * Find any active session state (for app startup recovery).
   * Returns the first active session state found, or null.
   */
  async findActive(): Promise<SessionState | null> {
    try {
      const db = await getDatabase();
      const allStates = await db.getAll('sessionState');
      return allStates.find((s) => s.status === 'active') ?? null;
    } catch {
      return null;
    }
  },
};
