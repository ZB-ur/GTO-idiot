/**
 * Session Store — manages session lifecycle state.
 *
 * Wraps the sessionService async operations and exposes reactive state
 * for React components via useSyncExternalStore.
 */

import type {
  Session,
  SessionSummary,
  SessionEndSummary,
  SessionState,
  BlindStructure,
  Player,
} from '../types';
import { sessionService } from '../services/session-service';

// ─── State shape ─────────────────────────────────────────────────

export interface SessionStoreState {
  /** The currently active session (null when no session is in progress). */
  currentSession: Session | null;
  /** List of past session summaries for the session list view. */
  sessionList: SessionSummary[];
  /** Total number of sessions (for pagination). */
  sessionTotal: number;
  /** End-of-session summary (shown after ending a session). */
  endSummary: SessionEndSummary | null;
  /** Whether an async operation is in progress. */
  isLoading: boolean;
  /** Last error message. */
  error: string | null;
}

type Listener = () => void;

const initialState: SessionStoreState = {
  currentSession: null,
  sessionList: [],
  sessionTotal: 0,
  endSummary: null,
  isLoading: false,
  error: null,
};

// ─── Store implementation ────────────────────────────────────────

let state: SessionStoreState = { ...initialState };
const listeners = new Set<Listener>();

function setState(partial: Partial<SessionStoreState>): void {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function getState(): SessionStoreState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Async actions ───────────────────────────────────────────────

/**
 * Create a new session and set it as the current session.
 */
async function createSession(blinds?: BlindStructure): Promise<Session> {
  setState({ isLoading: true, error: null, endSummary: null });
  try {
    const session = await sessionService.createSession(blinds);
    setState({ currentSession: session, isLoading: false });
    return session;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create session';
    setState({ isLoading: false, error: message });
    throw err;
  }
}

/**
 * End the current session.
 */
async function endSession(): Promise<SessionEndSummary> {
  const session = state.currentSession;
  if (!session) {
    const err = 'No active session to end';
    setState({ error: err });
    throw new Error(err);
  }

  setState({ isLoading: true, error: null });
  try {
    const summary = await sessionService.endSession(session.id);
    setState({
      currentSession: null,
      endSummary: summary,
      isLoading: false,
    });
    return summary;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to end session';
    setState({ isLoading: false, error: message });
    throw err;
  }
}

/**
 * Load the list of past sessions.
 */
async function loadSessionList(
  offset = 0,
  limit = 20,
): Promise<void> {
  setState({ isLoading: true, error: null });
  try {
    const result = await sessionService.listSessions({ offset, limit });
    setState({
      sessionList: result.sessions,
      sessionTotal: result.total,
      isLoading: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load sessions';
    setState({ isLoading: false, error: message });
  }
}

/**
 * Load a specific session by ID and set it as current.
 */
async function loadSession(sessionId: string): Promise<Session> {
  setState({ isLoading: true, error: null });
  try {
    const session = await sessionService.getSession(sessionId);
    setState({ currentSession: session, isLoading: false });
    return session;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load session';
    setState({ isLoading: false, error: message });
    throw err;
  }
}

/**
 * Delete a session and refresh the session list.
 */
async function deleteSession(sessionId: string): Promise<void> {
  setState({ isLoading: true, error: null });
  try {
    await sessionService.deleteSession(sessionId);
    // Remove from local list without re-fetching
    setState({
      sessionList: state.sessionList.filter((s) => s.id !== sessionId),
      sessionTotal: Math.max(0, state.sessionTotal - 1),
      isLoading: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete session';
    setState({ isLoading: false, error: message });
  }
}

/**
 * Try to recover an active session after a crash/reload.
 */
async function tryRecoverSession(): Promise<Session | null> {
  try {
    const activeState = await sessionService.findRecoverableSession();
    if (!activeState) return null;

    const recovered = await sessionService.recoverSession(activeState.sessionId);
    if (!recovered) return null;

    setState({ currentSession: recovered.session });
    return recovered.session;
  } catch {
    // Recovery is best-effort; don't surface errors
    return null;
  }
}

/**
 * Advance the session after a hand completes (increment hand count, rotate dealer).
 */
async function advanceSession(): Promise<Session> {
  const session = state.currentSession;
  if (!session) throw new Error('No active session');

  const updated = await sessionService.advanceSession(session.id);
  setState({ currentSession: updated });
  return updated;
}

/**
 * Update player chip stacks in the session after a hand.
 */
async function updatePlayerStacks(players: Player[]): Promise<void> {
  const session = state.currentSession;
  if (!session) return;

  await sessionService.updatePlayerStacks(session.id, players);
  // Update local state
  setState({
    currentSession: {
      ...session,
      players: players.map((p) => ({
        ...p,
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
        isActive: p.chipStack > 0,
      })),
    },
  });
}

/**
 * Save session state for crash recovery.
 */
async function saveSessionState(sessionState: SessionState): Promise<void> {
  await sessionService.saveSessionState(sessionState);
}

/**
 * Clear the end summary (after user has seen it).
 */
function dismissEndSummary(): void {
  setState({ endSummary: null });
}

/**
 * Clear the current error.
 */
function clearError(): void {
  setState({ error: null });
}

/**
 * Reset the entire store (e.g., on logout or full reset).
 */
function reset(): void {
  state = { ...initialState };
  listeners.forEach((l) => l());
}

// ─── Public API ──────────────────────────────────────────────────

export const sessionStore = {
  getState,
  subscribe,
  createSession,
  endSession,
  loadSessionList,
  loadSession,
  deleteSession,
  tryRecoverSession,
  advanceSession,
  updatePlayerStacks,
  saveSessionState,
  dismissEndSummary,
  clearError,
  reset,
};

// ─── React hook ──────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';

export function useSessionStore(): SessionStoreState;
export function useSessionStore<T>(selector: (s: SessionStoreState) => T): T;
export function useSessionStore<T>(selector?: (s: SessionStoreState) => T): T | SessionStoreState {
  const snap = useSyncExternalStore(subscribe, getState, getState);
  return selector ? selector(snap) : snap;
}
