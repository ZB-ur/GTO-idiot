import { useState } from 'react';
import type { GameState } from '../../../types';

export interface UseGameSessionReturn {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  dealNextHand: () => Promise<void>;
  submitAction: (actionType: string, amount?: number) => Promise<void>;
}

export function useGameSession(_sessionId: string): UseGameSessionReturn {
  const [gameState] = useState<GameState | null>(null);

  return {
    gameState,
    isLoading: false,
    error: null,
    dealNextHand: async () => {},
    submitAction: async () => {},
  };
}
