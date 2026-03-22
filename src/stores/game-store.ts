/**
 * Game Store — manages the state of the current hand in progress.
 *
 * Uses a simple pub/sub store pattern (no external dependency).
 * React components subscribe via the useGameStore hook.
 */

import type {
  HandState,
  PlayerAction,
  ActionResult,
  AvailableActions,
  ActionRecord,
  Player,
  BlindStructure,
} from '../types';
import { DEFAULT_BLINDS } from '../types';
import { GameEngine } from '../engine/game-engine';


// ─── State shape ─────────────────────────────────────────────────

export interface GameStoreState {
  /** Current hand state (null when between hands). */
  handState: HandState | null;
  /** Available actions for the human player at the current decision point. */
  availableActions: AvailableActions | null;
  /** All actions processed during the current hand. */
  actionLog: ActionRecord[];
  /** Whether the game engine is processing an action. */
  isProcessing: boolean;
  /** Last error from a game action. */
  error: string | null;
}

type Listener = () => void;

const initialState: GameStoreState = {
  handState: null,
  availableActions: null,
  actionLog: [],
  isProcessing: false,
  error: null,
};

// ─── Store implementation ────────────────────────────────────────

let state: GameStoreState = { ...initialState };
let engine: GameEngine | null = null;
const listeners = new Set<Listener>();

function setState(partial: Partial<GameStoreState>): void {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function getState(): GameStoreState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Actions ─────────────────────────────────────────────────────

/**
 * Start a new hand. Creates a GameEngine instance, deals cards, and
 * runs BOT preflop actions up to the human's first decision point.
 */
function startHand(
  sessionId: string,
  handNumber: number,
  players: Player[],
  dealerIndex: number,
  humanPlayerIndex: number,
  blinds: BlindStructure = DEFAULT_BLINDS,
): HandState {
  engine = new GameEngine(
    sessionId,
    handNumber,
    players,
    dealerIndex,
    humanPlayerIndex,
    blinds,
  );

  const handState = engine.startHand();

  // If it's not the human's turn yet (BOTs act first in preflop),
  // the engine's startHand already dealt — but we need to let the
  // UI render the initial state. BOT actions will come via submitAction flow.
  const availableActions = handState.isHumanTurn
    ? engine.getAvailableActions()
    : null;

  setState({
    handState,
    availableActions,
    actionLog: handState.recentActions ? [...handState.recentActions] : [],
    isProcessing: false,
    error: null,
  });

  return handState;
}

/**
 * Submit the human player's action and process all subsequent BOT actions.
 */
function submitAction(action: PlayerAction): ActionResult {
  if (!engine) {
    const err = 'No active hand — call startHand first';
    setState({ error: err });
    throw new Error(err);
  }

  setState({ isProcessing: true, error: null });

  try {
    const result = engine.submitAction(action);

    const availableActions =
      result.handState.isHumanTurn && !result.handState.isHandComplete
        ? engine.getAvailableActions()
        : null;

    setState({
      handState: result.handState,
      availableActions,
      actionLog: [...state.actionLog, ...result.processedActions],
      isProcessing: false,
    });

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setState({ isProcessing: false, error: message });
    throw err;
  }
}

/**
 * Get the current GameEngine instance (for session-level operations
 * like building hand history after the hand completes).
 */
function getEngine(): GameEngine | null {
  return engine;
}

/**
 * Clear game state (between hands or when ending a session).
 */
function clearHand(): void {
  engine = null;
  setState({
    handState: null,
    availableActions: null,
    actionLog: [],
    isProcessing: false,
    error: null,
  });
}

/**
 * Dismiss the current error.
 */
function clearError(): void {
  setState({ error: null });
}

// ─── Public API ──────────────────────────────────────────────────

export const gameStore = {
  getState,
  subscribe,
  startHand,
  submitAction,
  getEngine,
  clearHand,
  clearError,
};

// ─── React hook ──────────────────────────────────────────────────

import { useSyncExternalStore } from 'react';

export function useGameStore(): GameStoreState;
export function useGameStore<T>(selector: (s: GameStoreState) => T): T;
export function useGameStore<T>(selector?: (s: GameStoreState) => T): T | GameStoreState {
  const snap = useSyncExternalStore(subscribe, getState, getState);
  return selector ? selector(snap) : snap;
}
