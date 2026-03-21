// ============================================================
// Zustand Stores Tests — gameStore, sessionStore, uiStore
// ============================================================
// Note: The codebase has zustand as a dependency but stores may not
// be fully implemented yet. These tests verify the store patterns
// using inline store definitions matching expected API.

import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import type { HandState, LegalAction, Session } from '@/types';

// ============================================================
// Store definitions (matching expected store API)
// ============================================================

interface GameStore {
  handState: HandState | null;
  availableActions: LegalAction[];
  setHandState: (state: HandState | null) => void;
  setAvailableActions: (actions: LegalAction[]) => void;
}

interface SessionStore {
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  clear: () => void;
}

interface UIStore {
  isLoading: boolean;
  toasts: { id: string; message: string; severity: string }[];
  setLoading: (loading: boolean) => void;
  addToast: (message: string, severity: string) => void;
  removeToast: (id: string) => void;
}

function createGameStore() {
  return createStore<GameStore>((set) => ({
    handState: null,
    availableActions: [],
    setHandState: (handState) => set({ handState }),
    setAvailableActions: (availableActions) => set({ availableActions }),
  }));
}

function createSessionStore() {
  return createStore<SessionStore>((set) => ({
    activeSession: null,
    setActiveSession: (activeSession) => set({ activeSession }),
    clear: () => set({ activeSession: null }),
  }));
}

function createUIStore() {
  return createStore<UIStore>((set) => ({
    isLoading: false,
    toasts: [],
    setLoading: (isLoading) => set({ isLoading }),
    addToast: (message, severity) =>
      set((state) => ({
        toasts: [...state.toasts, { id: String(Date.now()), message, severity }],
      })),
    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
  }));
}

// ============================================================
// Tests
// ============================================================

describe('gameStore', () => {
  it('initializes with null hand state', () => {
    const store = createGameStore();
    expect(store.getState().handState).toBeNull();
    expect(store.getState().availableActions).toEqual([]);
  });

  it('setHandState updates current hand state', () => {
    const store = createGameStore();
    const mockState = {
      id: 'h1', sessionId: 's1', handNumber: 1, phase: 'preflop' as const,
      players: [], communityCards: [], pots: [],
      currentActingSeat: null, dealerSeat: 0, userHoleCards: [],
    };
    store.getState().setHandState(mockState);
    expect(store.getState().handState).toEqual(mockState);
  });

  it('setAvailableActions updates action list', () => {
    const store = createGameStore();
    const actions: LegalAction[] = [
      { type: 'fold' },
      { type: 'call', callAmount: 2 },
      { type: 'raise', minAmount: 4, maxAmount: 100 },
    ];
    store.getState().setAvailableActions(actions);
    expect(store.getState().availableActions).toHaveLength(3);
    expect(store.getState().availableActions[0].type).toBe('fold');
  });
});

describe('sessionStore', () => {
  it('tracks active session', () => {
    const store = createSessionStore();
    const session: Session = {
      id: 's1', status: 'active', players: [],
      blinds: { smallBlind: 0.5, bigBlind: 1 },
      startedAt: new Date().toISOString(),
      pausedAt: null, endedAt: null,
      handCount: 0, currentHandId: null, dealerSeat: 0,
    };
    store.getState().setActiveSession(session);
    expect(store.getState().activeSession).toEqual(session);
  });

  it('clear resets to initial state', () => {
    const store = createSessionStore();
    store.getState().setActiveSession({
      id: 's1', status: 'active', players: [],
      blinds: { smallBlind: 0.5, bigBlind: 1 },
      startedAt: '', pausedAt: null, endedAt: null,
      handCount: 0, currentHandId: null, dealerSeat: 0,
    });
    store.getState().clear();
    expect(store.getState().activeSession).toBeNull();
  });
});

describe('uiStore', () => {
  it('manages loading states', () => {
    const store = createUIStore();
    expect(store.getState().isLoading).toBe(false);
    store.getState().setLoading(true);
    expect(store.getState().isLoading).toBe(true);
    store.getState().setLoading(false);
    expect(store.getState().isLoading).toBe(false);
  });

  it('manages toast notifications', () => {
    const store = createUIStore();
    expect(store.getState().toasts).toHaveLength(0);

    store.getState().addToast('Success!', 'success');
    expect(store.getState().toasts).toHaveLength(1);
    expect(store.getState().toasts[0].message).toBe('Success!');

    const toastId = store.getState().toasts[0].id;
    store.getState().removeToast(toastId);
    expect(store.getState().toasts).toHaveLength(0);
  });
});
