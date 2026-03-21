// ============================================================
// GTO Idiot — Game Store
// Manages in-hand game state, GTO hints, and hand actions
// ============================================================

import { create } from 'zustand';
import type {
  HandState,
  ActionResult,
  HintResponse,
  ActionType,
  Card,
  ShowdownResult,
} from '../types';

// ---------- Types ----------

export interface GameState {
  // Current hand
  currentHand: HandState | null;
  handInProgress: boolean;

  // Action log for current hand
  actionLog: ActionLogEntry[];

  // GTO hints
  currentHint: HintResponse | null;
  hintLoading: boolean;
  hintVisible: boolean;

  // Showdown
  showdownResult: ShowdownResult | null;
  showingShowdown: boolean;

  // Hand result animation
  lastResult: { amount: number; isWin: boolean } | null;

  // Processing state
  processingAction: boolean;
  waitingForBot: boolean;
}

export interface ActionLogEntry {
  playerName: string;
  action: ActionType;
  amount: number | null;
  timestamp: number;
}

export interface GameActions {
  // Hand lifecycle
  setCurrentHand: (hand: HandState) => void;
  clearCurrentHand: () => void;

  // Actions
  setProcessingAction: (processing: boolean) => void;
  setWaitingForBot: (waiting: boolean) => void;
  applyActionResult: (result: ActionResult) => void;

  // Action log
  addActionLog: (entry: Omit<ActionLogEntry, 'timestamp'>) => void;
  clearActionLog: () => void;

  // GTO hints
  setHint: (hint: HintResponse) => void;
  setHintLoading: (loading: boolean) => void;
  toggleHintVisible: () => void;
  clearHint: () => void;

  // Showdown
  setShowdownResult: (result: ShowdownResult) => void;
  clearShowdown: () => void;

  // Result
  setLastResult: (result: { amount: number; isWin: boolean } | null) => void;
}

// ---------- Store ----------

export const useGameStore = create<GameState & GameActions>((set) => ({
  // Initial state
  currentHand: null,
  handInProgress: false,
  actionLog: [],
  currentHint: null,
  hintLoading: false,
  hintVisible: false,
  showdownResult: null,
  showingShowdown: false,
  lastResult: null,
  processingAction: false,
  waitingForBot: false,

  // Hand lifecycle
  setCurrentHand: (hand) =>
    set({
      currentHand: hand,
      handInProgress: hand.status === 'in_progress',
      showdownResult: null,
      showingShowdown: false,
      lastResult: null,
      currentHint: null,
      hintVisible: false,
    }),

  clearCurrentHand: () =>
    set({
      currentHand: null,
      handInProgress: false,
      actionLog: [],
      currentHint: null,
      hintLoading: false,
      hintVisible: false,
      showdownResult: null,
      showingShowdown: false,
      lastResult: null,
      processingAction: false,
      waitingForBot: false,
    }),

  // Actions
  setProcessingAction: (processing) =>
    set({ processingAction: processing }),

  setWaitingForBot: (waiting) =>
    set({ waitingForBot: waiting }),

  applyActionResult: (result) => {
    const { action_taken, hand_state, hand_complete, showdown, next_actions } = result;

    // Add the action to the log
    const logEntry: ActionLogEntry = {
      playerName: action_taken.player_name,
      action: action_taken.action,
      amount: action_taken.amount,
      timestamp: Date.now(),
    };

    // Also add any chained bot actions to the log
    const chainedEntries: ActionLogEntry[] = [];
    if (next_actions) {
      for (const na of next_actions) {
        chainedEntries.push({
          playerName: na.action_taken.player_name,
          action: na.action_taken.action,
          amount: na.action_taken.amount,
          timestamp: Date.now(),
        });
      }
    }

    // Use the latest hand state (from chained actions if present)
    const latestState = next_actions?.length
      ? next_actions[next_actions.length - 1].hand_state
      : hand_state;

    const latestShowdown = next_actions?.length
      ? next_actions[next_actions.length - 1].showdown ?? showdown
      : showdown;

    const isComplete = next_actions?.length
      ? next_actions[next_actions.length - 1].hand_complete
      : hand_complete;

    set((state) => ({
      currentHand: latestState,
      handInProgress: !isComplete,
      actionLog: [...state.actionLog, logEntry, ...chainedEntries],
      showdownResult: latestShowdown,
      showingShowdown: latestShowdown !== null,
      processingAction: false,
      waitingForBot: false,
    }));
  },

  // Action log
  addActionLog: (entry) =>
    set((state) => ({
      actionLog: [...state.actionLog, { ...entry, timestamp: Date.now() }],
    })),

  clearActionLog: () =>
    set({ actionLog: [] }),

  // GTO hints
  setHint: (hint) =>
    set({ currentHint: hint, hintLoading: false, hintVisible: true }),

  setHintLoading: (loading) =>
    set({ hintLoading: loading }),

  toggleHintVisible: () =>
    set((state) => ({ hintVisible: !state.hintVisible })),

  clearHint: () =>
    set({ currentHint: null, hintLoading: false, hintVisible: false }),

  // Showdown
  setShowdownResult: (result) =>
    set({ showdownResult: result, showingShowdown: true }),

  clearShowdown: () =>
    set({ showdownResult: null, showingShowdown: false }),

  // Result
  setLastResult: (result) =>
    set({ lastResult: result }),
}));

// ---------- Selectors ----------

export const selectIsUserTurn = (state: GameState): boolean =>
  state.currentHand?.is_user_turn ?? false;

export const selectAvailableActions = (state: GameState) =>
  state.currentHand?.available_actions ?? [];

export const selectCommunityCards = (state: GameState): Card[] =>
  state.currentHand?.community_cards ?? [];

export const selectPot = (state: GameState): number =>
  state.currentHand?.pot ?? 0;

export const selectCurrentStreet = (state: GameState) =>
  state.currentHand?.street ?? 'preflop';
