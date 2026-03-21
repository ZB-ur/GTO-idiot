// ============================================================
// GTO Idiot — Session Store
// Manages active session state and session list cache
// ============================================================

import { create } from 'zustand';
import type {
  Session,
  CreateSessionRequest,
  BotDifficulty,
} from '../types';
import {
  createSession,
  getSession,
  listSessions,
  updateSession,
  recoverSession,
} from '../services/session-service';

// ---------- Types ----------

export interface SessionState {
  // Active session
  currentSession: Session | null;
  isSessionActive: boolean;

  // Session list (for history)
  sessions: Session[];
  sessionsTotal: number;
  sessionsLoading: boolean;

  // Recovery
  recoverableSession: Session | null;
  recoveryChecked: boolean;

  // Loading states
  creatingSession: boolean;
  updatingSession: boolean;
}

export interface SessionActions {
  // Session lifecycle
  createNewSession: (request: CreateSessionRequest) => Promise<Session>;
  loadSession: (sessionId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  clearCurrentSession: () => void;

  // Update current session in-place (e.g., after hand completes)
  patchCurrentSession: (patch: Partial<Session>) => void;

  // Session list
  fetchSessions: (options?: { status?: string; limit?: number; offset?: number }) => Promise<void>;

  // Recovery
  checkRecovery: () => Promise<void>;
  dismissRecovery: () => void;
  recoverExistingSession: () => Promise<void>;
}

// ---------- Store ----------

export const useSessionStore = create<SessionState & SessionActions>((set, get) => ({
  // Initial state
  currentSession: null,
  isSessionActive: false,
  sessions: [],
  sessionsTotal: 0,
  sessionsLoading: false,
  recoverableSession: null,
  recoveryChecked: false,
  creatingSession: false,
  updatingSession: false,

  // Session lifecycle
  createNewSession: async (request) => {
    set({ creatingSession: true });
    try {
      const session = await createSession(request);
      set({
        currentSession: session,
        isSessionActive: true,
        creatingSession: false,
      });
      return session;
    } catch (error) {
      set({ creatingSession: false });
      throw error;
    }
  },

  loadSession: async (sessionId) => {
    const session = await getSession(sessionId);
    set({
      currentSession: session,
      isSessionActive: session.status === 'active',
    });
  },

  pauseSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({ updatingSession: true });
    try {
      const updated = await updateSession(currentSession.id, { action: 'pause' });
      set({
        currentSession: updated,
        isSessionActive: false,
        updatingSession: false,
      });
    } catch (error) {
      set({ updatingSession: false });
      throw error;
    }
  },

  resumeSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({ updatingSession: true });
    try {
      const updated = await updateSession(currentSession.id, { action: 'resume' });
      set({
        currentSession: updated,
        isSessionActive: true,
        updatingSession: false,
      });
    } catch (error) {
      set({ updatingSession: false });
      throw error;
    }
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({ updatingSession: true });
    try {
      const updated = await updateSession(currentSession.id, { action: 'end' });
      set({
        currentSession: updated,
        isSessionActive: false,
        updatingSession: false,
      });
    } catch (error) {
      set({ updatingSession: false });
      throw error;
    }
  },

  clearCurrentSession: () => {
    set({
      currentSession: null,
      isSessionActive: false,
    });
  },

  patchCurrentSession: (patch) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({
      currentSession: { ...currentSession, ...patch },
      isSessionActive: patch.status ? patch.status === 'active' : get().isSessionActive,
    });
  },

  // Session list
  fetchSessions: async (options = {}) => {
    set({ sessionsLoading: true });
    try {
      const result = await listSessions(options as Parameters<typeof listSessions>[0]);
      set({
        sessions: result.sessions,
        sessionsTotal: result.total,
        sessionsLoading: false,
      });
    } catch (error) {
      set({ sessionsLoading: false });
      throw error;
    }
  },

  // Recovery
  checkRecovery: async () => {
    try {
      const result = await recoverSession();
      set({
        recoverableSession: result.has_unfinished ? result.session : null,
        recoveryChecked: true,
      });
    } catch {
      set({ recoveryChecked: true });
    }
  },

  dismissRecovery: () => {
    set({ recoverableSession: null });
  },

  recoverExistingSession: async () => {
    const { recoverableSession } = get();
    if (!recoverableSession) return;

    set({
      currentSession: recoverableSession,
      isSessionActive: recoverableSession.status === 'active',
      recoverableSession: null,
    });
  },
}));

// ---------- Selectors ----------

export const selectDefaultSessionConfig = (): CreateSessionRequest => ({
  bots: [
    { name: 'BOT-1', difficulty: 'regular' as BotDifficulty },
    { name: 'BOT-2', difficulty: 'fish' as BotDifficulty },
    { name: 'BOT-3', difficulty: 'regular' as BotDifficulty },
    { name: 'BOT-4', difficulty: 'fish' as BotDifficulty },
    { name: 'BOT-5', difficulty: 'gto' as BotDifficulty },
  ],
  blinds: { small_blind: 1, big_blind: 2 },
});
