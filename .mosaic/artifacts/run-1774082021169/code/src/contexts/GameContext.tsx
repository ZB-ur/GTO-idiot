import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type {
  GameSession,
  HandState,
  AvailableActions,
  PlayerAction,
  ActionResult,
  Position,
} from '../types/game';
import {
  createGame,
  dealNewHand,
  submitAction,
  getPlayerAvailableActions,
  endGame,
} from '../services/game-service';

// ─── State ──────────────────────────────────────────────────────────

export interface GameState {
  readonly session: GameSession | null;
  readonly hand: HandState | null;
  readonly availableActions: AvailableActions | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastActionResult: ActionResult | null;
}

const initialState: GameState = {
  session: null,
  hand: null,
  availableActions: null,
  isLoading: false,
  error: null,
  lastActionResult: null,
};

// ─── Actions ────────────────────────────────────────────────────────

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSION'; payload: GameSession }
  | { type: 'SET_HAND'; payload: HandState }
  | { type: 'SET_AVAILABLE_ACTIONS'; payload: AvailableActions | null }
  | { type: 'SET_ACTION_RESULT'; payload: ActionResult }
  | { type: 'CLEAR_SESSION' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SESSION':
      return { ...state, session: action.payload, error: null };
    case 'SET_HAND':
      return { ...state, hand: action.payload, error: null };
    case 'SET_AVAILABLE_ACTIONS':
      return { ...state, availableActions: action.payload };
    case 'SET_ACTION_RESULT':
      return {
        ...state,
        hand: action.payload.handState,
        lastActionResult: action.payload,
        isLoading: false,
      };
    case 'CLEAR_SESSION':
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────

interface GameContextValue {
  readonly state: GameState;
  readonly startGame: (seatPosition: Position, startingStack?: number) => Promise<void>;
  readonly dealHand: () => Promise<void>;
  readonly performAction: (action: PlayerAction) => Promise<void>;
  readonly stopGame: () => Promise<void>;
  readonly refreshAvailableActions: () => void;
  readonly clearError: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────

interface GameProviderProps {
  readonly children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(async (seatPosition: Position, startingStack = 100) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const session = await createGame({ seatPosition, startingStack });
      dispatch({ type: 'SET_SESSION', payload: session });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to create game' });
    }
  }, []);

  const dealHand = useCallback(async () => {
    if (!state.session) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const hand = await dealNewHand(state.session.id);
      dispatch({ type: 'SET_HAND', payload: hand });
      dispatch({ type: 'SET_LOADING', payload: false });

      // Fetch available actions if it's user's turn
      if (hand.isUserTurn) {
        const actions = getPlayerAvailableActions(state.session.id, hand.id);
        dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: actions });
      } else {
        dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to deal hand' });
    }
  }, [state.session]);

  const performAction = useCallback(async (action: PlayerAction) => {
    if (!state.session || !state.hand) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await submitAction(state.session.id, state.hand.id, action);
      dispatch({ type: 'SET_ACTION_RESULT', payload: result });

      // Refresh available actions
      if (result.handState.isUserTurn && !result.handComplete) {
        const actions = getPlayerAvailableActions(state.session.id, result.handState.id);
        dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: actions });
      } else {
        dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: null });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to submit action' });
    }
  }, [state.session, state.hand]);

  const stopGame = useCallback(async () => {
    if (!state.session) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await endGame(state.session.id);
      dispatch({ type: 'CLEAR_SESSION' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to end game' });
    }
  }, [state.session]);

  const refreshAvailableActions = useCallback(() => {
    if (!state.session || !state.hand || !state.hand.isUserTurn) {
      dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: null });
      return;
    }
    try {
      const actions = getPlayerAvailableActions(state.session.id, state.hand.id);
      dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: actions });
    } catch {
      dispatch({ type: 'SET_AVAILABLE_ACTIONS', payload: null });
    }
  }, [state.session, state.hand]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: GameContextValue = {
    state,
    startGame,
    dealHand,
    performAction,
    stopGame,
    refreshAvailableActions,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
