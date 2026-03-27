import { useReducer } from 'react';
import type { GameState } from '../../../types';

type GameAction =
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'RESET' };

function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'RESET':
      return null;
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null);

  return {
    state,
    setState: (gs: GameState) => dispatch({ type: 'SET_STATE', payload: gs }),
    reset: () => dispatch({ type: 'RESET' }),
  };
}
