import { create } from 'zustand';
import type { GameState, PlayerAction, CreateGameRequest } from '../types';
import { gameService } from '../services/game-service';

interface GameStore {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  createGame: (config: CreateGameRequest) => Promise<void>;
  submitAction: (action: PlayerAction) => Promise<void>;
  dealNextHand: () => Promise<void>;
  endGame: () => Promise<void>;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isLoading: false,
  error: null,

  createGame: async (config: CreateGameRequest) => {
    set({ isLoading: true, error: null });
    try {
      const gameState = await gameService.createGame(config);
      set({ gameState, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create game';
      set({ isLoading: false, error: message });
    }
  },

  submitAction: async (action: PlayerAction) => {
    const { gameState } = get();
    if (!gameState) {
      set({ error: 'No active game' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await gameService.submitAction(gameState.gameId, action);
      set({ gameState: result.gameState, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit action';
      set({ isLoading: false, error: message });
    }
  },

  dealNextHand: async () => {
    const { gameState } = get();
    if (!gameState) {
      set({ error: 'No active game' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const handState = await gameService.dealNextHand(gameState.gameId);
      if (handState) {
        set({
          gameState: { ...gameState, currentHand: handState },
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: 'Could not deal next hand' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deal next hand';
      set({ isLoading: false, error: message });
    }
  },

  endGame: async () => {
    const { gameState } = get();
    if (!gameState) {
      set({ gameState: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await gameService.endGame(gameState.gameId);
      set({ gameState: null, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end game';
      set({ isLoading: false, error: message });
    }
  },

  reset: () => {
    set({ gameState: null, isLoading: false, error: null });
  },
}));
