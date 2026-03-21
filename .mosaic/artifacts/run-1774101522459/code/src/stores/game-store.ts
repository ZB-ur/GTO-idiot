// ============================================================
// Game Store — Zustand store for active hand/game state
// ============================================================

import { create } from 'zustand';
import type {
  HandState,
  AvailableActions,
  PlayerAction,
  ActionResult,
  BotActionResult,
  HandSettlement,
  ActionLogEntry,
} from '../types';
import * as handService from '../services/hand-service';

// ============================================================
// Types
// ============================================================

export interface GameState {
  /** Current hand state, null if no hand in progress */
  handState: HandState | null;
  /** Available actions for the current player */
  availableActions: AvailableActions | null;
  /** Settlement result for the last hand */
  settlement: HandSettlement | null;
  /** Action log for the current hand */
  actionLog: ActionLogEntry[];
  /** Whether the game is processing an action */
  isProcessing: boolean;
  /** Whether the hand is complete */
  isHandComplete: boolean;
  /** Whether the next actor is a bot */
  nextActorIsBot: boolean;
  /** Error message if any */
  error: string | null;
}

export interface GameActions {
  /** Start a new hand */
  startHand: (sessionId: string) => Promise<void>;
  /** Submit a player action */
  submitAction: (handId: string, action: PlayerAction) => Promise<ActionResult>;
  /** Request bot action */
  requestBotAction: (handId: string) => Promise<BotActionResult>;
  /** Settle the current hand */
  settleHand: (handId: string) => Promise<HandSettlement>;
  /** Process all bot actions until it's the human's turn or hand completes */
  processBotsUntilHuman: (handId: string) => Promise<void>;
  /** Clear the current hand state */
  clearHand: () => void;
  /** Clear error */
  clearError: () => void;
  /** Reset the entire store */
  reset: () => void;
}

export type GameStore = GameState & GameActions;

// ============================================================
// Initial state
// ============================================================

const initialState: GameState = {
  handState: null,
  availableActions: null,
  settlement: null,
  actionLog: [],
  isProcessing: false,
  isHandComplete: false,
  nextActorIsBot: false,
  error: null,
};

// ============================================================
// Store
// ============================================================

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startHand: async (sessionId: string) => {
    set({ isProcessing: true, error: null, settlement: null, actionLog: [], isHandComplete: false });
    try {
      const handState = await handService.startHand(sessionId);
      const availableActions = handService.getAvailableActions(handState.id);

      // Check if first actor is a bot
      const nextActorIsBot = isNextActorBot(handState);

      set({
        handState,
        availableActions,
        isProcessing: false,
        nextActorIsBot,
      });
    } catch (err) {
      set({ isProcessing: false, error: errorMessage(err) });
    }
  },

  submitAction: async (handId: string, action: PlayerAction) => {
    set({ isProcessing: true, error: null });
    try {
      const result = await handService.submitAction(handId, action);
      const newLog = [...get().actionLog, result.actionLog];

      let availableActions: AvailableActions | null = null;
      if (!result.isHandComplete) {
        availableActions = handService.getAvailableActions(handId);
      }

      set({
        handState: result.handState,
        availableActions,
        actionLog: newLog,
        isProcessing: false,
        isHandComplete: result.isHandComplete,
        nextActorIsBot: result.nextActorIsBot,
      });

      return result;
    } catch (err) {
      set({ isProcessing: false, error: errorMessage(err) });
      throw err;
    }
  },

  requestBotAction: async (handId: string) => {
    set({ isProcessing: true, error: null });
    try {
      const result = await handService.requestBotAction(handId);
      const newLog = [...get().actionLog, result.actionLog];

      let availableActions: AvailableActions | null = null;
      if (!result.isHandComplete) {
        availableActions = handService.getAvailableActions(handId);
      }

      set({
        handState: result.handState,
        availableActions,
        actionLog: newLog,
        isProcessing: false,
        isHandComplete: result.isHandComplete,
        nextActorIsBot: result.nextActorIsBot,
      });

      return result;
    } catch (err) {
      set({ isProcessing: false, error: errorMessage(err) });
      throw err;
    }
  },

  settleHand: async (handId: string) => {
    set({ isProcessing: true, error: null });
    try {
      const settlement = await handService.settleHand(handId);
      set({
        settlement,
        isProcessing: false,
        isHandComplete: true,
        nextActorIsBot: false,
        availableActions: null,
      });
      return settlement;
    } catch (err) {
      set({ isProcessing: false, error: errorMessage(err) });
      throw err;
    }
  },

  processBotsUntilHuman: async (handId: string) => {
    const MAX_BOT_ACTIONS = 20; // Safety limit
    let count = 0;

    while (get().nextActorIsBot && !get().isHandComplete && count < MAX_BOT_ACTIONS) {
      count++;
      // Small delay for animation
      await new Promise((resolve) => setTimeout(resolve, 400));
      await get().requestBotAction(handId);
    }
  },

  clearHand: () => {
    set({
      handState: null,
      availableActions: null,
      settlement: null,
      actionLog: [],
      isHandComplete: false,
      nextActorIsBot: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

// ============================================================
// Helpers
// ============================================================

function isNextActorBot(state: HandState): boolean {
  if (state.currentActingSeat === null) return false;
  const player = state.players.find((p) => p.seat === state.currentActingSeat);
  // If the player's name starts with 'BOT', it's a bot
  return player?.name.startsWith('BOT') ?? false;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
