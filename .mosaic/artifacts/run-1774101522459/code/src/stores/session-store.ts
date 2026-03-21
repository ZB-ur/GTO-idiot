// ============================================================
// Session Store — Zustand store for session lifecycle state
// ============================================================

import { create } from 'zustand';
import type {
  Session,
  SessionSummary,
  SessionEndSummary,
  CreateSessionRequest,
} from '../types';
import * as sessionService from '../services/session-service';

// ============================================================
// Types
// ============================================================

export interface SessionState {
  /** Current active session */
  currentSession: Session | null;
  /** List of all sessions (summaries) */
  sessionList: SessionSummary[];
  /** Total number of sessions */
  totalSessions: number;
  /** Session end summary (after ending a session) */
  endSummary: SessionEndSummary | null;
  /** Whether session operations are in progress */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

export interface SessionActions {
  /** Create a new session */
  createSession: (request: CreateSessionRequest) => Promise<Session>;
  /** Load the currently active session */
  loadActiveSession: () => Promise<Session | null>;
  /** Load a session by ID */
  loadSession: (sessionId: string) => Promise<void>;
  /** Pause the current session */
  pauseSession: () => Promise<void>;
  /** Resume a session */
  resumeSession: (sessionId: string) => Promise<void>;
  /** End the current session */
  endSession: () => Promise<SessionEndSummary>;
  /** Refresh the session list */
  refreshSessionList: () => Promise<void>;
  /** Update the current session in store (e.g., after hand count change) */
  updateCurrentSession: (session: Session) => void;
  /** Clear end summary */
  clearEndSummary: () => void;
  /** Clear error */
  clearError: () => void;
  /** Reset the store */
  reset: () => void;
}

export type SessionStore = SessionState & SessionActions;

// ============================================================
// Initial state
// ============================================================

const initialState: SessionState = {
  currentSession: null,
  sessionList: [],
  totalSessions: 0,
  endSummary: null,
  isLoading: false,
  error: null,
};

// ============================================================
// Store
// ============================================================

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  createSession: async (request: CreateSessionRequest) => {
    set({ isLoading: true, error: null, endSummary: null });
    try {
      const session = await sessionService.createSession(request);
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  loadActiveSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await sessionService.getActiveSession();
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      return null;
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sessionService.getSession(sessionId);
      set({ currentSession: session, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
    }
  },

  pauseSession: async () => {
    const session = get().currentSession;
    if (!session) {
      set({ error: 'No active session to pause' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const updated = await sessionService.pauseSession(session.id);
      set({ currentSession: updated, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
    }
  },

  resumeSession: async (sessionId: string) => {
    set({ isLoading: true, error: null, endSummary: null });
    try {
      const session = await sessionService.resumeSession(sessionId);
      set({ currentSession: session, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
    }
  },

  endSession: async () => {
    const session = get().currentSession;
    if (!session) {
      throw new Error('No active session to end');
    }
    set({ isLoading: true, error: null });
    try {
      const summary = await sessionService.endSession(session.id);
      set({
        currentSession: null,
        endSummary: summary,
        isLoading: false,
      });
      return summary;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  refreshSessionList: async () => {
    try {
      const { sessions, total } = await sessionService.listSessions();
      set({ sessionList: sessions, totalSessions: total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
    }
  },

  updateCurrentSession: (session: Session) => {
    set({ currentSession: session });
  },

  clearEndSummary: () => set({ endSummary: null }),
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
