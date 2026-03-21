// ============================================================
// useGameLoop — React hook orchestrating the game lifecycle
// Manages hand start, player actions, bot turns, settlement
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  HandState,
  AvailableActions,
  PlayerAction,
  HandSettlement,
  Session,
} from '../../types';
import {
  startHand,
  getAvailableActions,
  submitAction,
  requestBotAction,
  settleHand,
} from '../../services';
import { TIMING } from './animations';

export type GameLoopPhase =
  | 'idle'          // No hand in progress
  | 'dealing'       // Cards being dealt
  | 'player_turn'   // Waiting for human input
  | 'bot_thinking'  // Bot is computing
  | 'settling'      // Hand is being settled
  | 'settled';      // Settlement shown, waiting before next hand

export interface GameLoopState {
  phase: GameLoopPhase;
  handState: HandState | null;
  availableActions: AvailableActions | null;
  settlement: HandSettlement | null;
  error: string | null;
  handCount: number;
}

export interface GameLoopActions {
  startNewHand: () => Promise<void>;
  submitPlayerAction: (action: PlayerAction) => Promise<void>;
  reset: () => void;
}

export function useGameLoop(session: Session | null): GameLoopState & GameLoopActions {
  const [phase, setPhase] = useState<GameLoopPhase>('idle');
  const [handState, setHandState] = useState<HandState | null>(null);
  const [availableActions, setAvailableActions] = useState<AvailableActions | null>(null);
  const [settlement, setSettlement] = useState<HandSettlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handCount, setHandCount] = useState(0);

  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Helper: find if human is the acting player
  const isHumanTurn = useCallback(
    (state: HandState): boolean => {
      if (!session || state.currentActingSeat === null) return false;
      const humanPlayer = session.players.find((p) => p.isHuman);
      return humanPlayer?.seat === state.currentActingSeat;
    },
    [session],
  );

  // Process bot turns in sequence until it's the human's turn or hand ends
  const processBotTurns = useCallback(
    async (currentState: HandState): Promise<HandState> => {
      let state = currentState;

      while (
        mountedRef.current &&
        state.currentActingSeat !== null &&
        !isHumanTurn(state) &&
        state.phase !== 'showdown' &&
        state.phase !== 'settled'
      ) {
        setPhase('bot_thinking');

        // Short delay for bot "thinking" animation
        await new Promise((resolve) => setTimeout(resolve, TIMING.BOT_THINK));

        if (!mountedRef.current) break;

        try {
          const result = await requestBotAction(state.id);
          state = result.handState;
          setHandState(state);

          if (result.isHandComplete) {
            break;
          }
        } catch (err) {
          console.error('Bot action error:', err);
          break;
        }
      }

      return state;
    },
    [isHumanTurn],
  );

  // Settle the hand and show results
  const handleSettle = useCallback(
    async (state: HandState) => {
      setPhase('settling');
      await new Promise((resolve) => setTimeout(resolve, TIMING.STREET_TRANSITION));

      if (!mountedRef.current) return;

      try {
        const result = await settleHand(state.id);
        setSettlement(result);
        setPhase('settled');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Settlement failed');
        setPhase('idle');
      }
    },
    [],
  );

  // After actions, check if hand is complete or route to next player
  const routeAfterAction = useCallback(
    async (state: HandState) => {
      // Hand complete → settle
      if (
        state.phase === 'showdown' ||
        state.phase === 'settled' ||
        state.currentActingSeat === null
      ) {
        await handleSettle(state);
        return;
      }

      // If it's human's turn, show actions
      if (isHumanTurn(state)) {
        try {
          const actions = getAvailableActions(state.id);
          setAvailableActions(actions);
          setPhase('player_turn');
        } catch {
          setPhase('idle');
        }
        return;
      }

      // Otherwise, process bot turns
      const afterBots = await processBotTurns(state);

      if (!mountedRef.current) return;

      if (
        afterBots.phase === 'showdown' ||
        afterBots.phase === 'settled' ||
        afterBots.currentActingSeat === null
      ) {
        await handleSettle(afterBots);
      } else if (isHumanTurn(afterBots)) {
        try {
          const actions = getAvailableActions(afterBots.id);
          setAvailableActions(actions);
          setPhase('player_turn');
        } catch {
          setPhase('idle');
        }
      }
    },
    [isHumanTurn, processBotTurns, handleSettle],
  );

  // Start a new hand
  const startNewHand = useCallback(async () => {
    if (!session || processingRef.current) return;
    processingRef.current = true;
    setError(null);
    setSettlement(null);
    setAvailableActions(null);

    try {
      setPhase('dealing');
      const state = await startHand(session.id);

      if (!mountedRef.current) return;

      setHandState(state);
      setHandCount((c) => c + 1);

      // Wait for deal animation
      await new Promise((resolve) => setTimeout(resolve, TIMING.DEAL_CARD * 3));

      if (!mountedRef.current) return;

      await routeAfterAction(state);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to start hand');
        setPhase('idle');
      }
    } finally {
      processingRef.current = false;
    }
  }, [session, routeAfterAction]);

  // Submit a player action
  const submitPlayerAction = useCallback(
    async (action: PlayerAction) => {
      if (!handState || processingRef.current) return;
      processingRef.current = true;
      setError(null);
      setAvailableActions(null);

      try {
        const result = await submitAction(handState.id, action);

        if (!mountedRef.current) return;

        setHandState(result.handState);

        if (result.isHandComplete) {
          await handleSettle(result.handState);
        } else {
          await routeAfterAction(result.handState);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Action failed');
          // Re-fetch available actions to allow retry
          if (handState) {
            try {
              const actions = getAvailableActions(handState.id);
              setAvailableActions(actions);
              setPhase('player_turn');
            } catch {
              setPhase('idle');
            }
          }
        }
      } finally {
        processingRef.current = false;
      }
    },
    [handState, routeAfterAction, handleSettle],
  );

  const reset = useCallback(() => {
    setPhase('idle');
    setHandState(null);
    setAvailableActions(null);
    setSettlement(null);
    setError(null);
    processingRef.current = false;
  }, []);

  return {
    phase,
    handState,
    availableActions,
    settlement,
    error,
    handCount,
    startNewHand,
    submitPlayerAction,
    reset,
  };
}
