/**
 * useGameFlow — End-to-end game loop integration hook.
 *
 * Orchestrates the full lifecycle: session creation → hand dealing →
 * player action → hand completion → next hand → session end.
 * Coordinates between sessionStore, gameStore, uiStore, and persistence.
 */

import { useCallback, useRef } from 'react';
import { sessionStore, useSessionStore } from '../stores/session-store';
import { gameStore, useGameStore } from '../stores/game-store';
import { uiStore } from '../stores/ui-store';
import { handRepository } from '../persistence/hand-repository';
import type {
  BlindStructure,
  PlayerAction,
  HandState,
  ActionResult,
  SessionState,
  HandHistory,
  HandPlayerInfo,
  StreetRecord,
  HandResult,
  Player,
} from '../types';

// ─── Types ───────────────────────────────────────────────────────

export interface GameFlowActions {
  /** Start a brand-new session and navigate to the game view. */
  startNewSession: (blinds?: BlindStructure) => Promise<void>;
  /** Deal the next hand within the current session. */
  dealNextHand: () => void;
  /** Submit the human player's action. */
  submitAction: (action: PlayerAction) => Promise<ActionResult>;
  /** End the current session and navigate to session summary. */
  endSession: () => Promise<void>;
  /** Resume a session (after crash recovery or navigating back). */
  resumeSession: (sessionId: string) => Promise<void>;
  /** Whether an async operation is in progress. */
  isProcessing: boolean;
  /** Current error, if any. */
  error: string | null;
  /** Dismiss the current error. */
  clearError: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Build a HandHistory record from the completed hand state and engine data.
 */
function buildHandHistory(
  sessionId: string,
  handState: HandState,
  allActions: import('../types').ActionRecord[],
  players: Player[],
  humanPlayerIndex: number,
): HandHistory {
  const handPlayers: HandPlayerInfo[] = players.map((p) => ({
    playerId: p.id,
    name: p.name,
    position: p.position,
    startingStack: p.chipStack,
    holeCards: p.holeCards ?? ([{ rank: '2', suit: 'spades' }, { rank: '2', suit: 'clubs' }] as [import('../types').Card, import('../types').Card]),
    isBot: p.isBot,
  }));

  // Group actions by street
  const streetMap = new Map<string, StreetRecord>();
  for (const action of allActions) {
    const key = action.street;
    if (!streetMap.has(key)) {
      streetMap.set(key, {
        street: action.street,
        communityCards: [],
        actions: [],
      });
    }
    streetMap.get(key)!.actions.push(action);
  }

  // Assign community cards to appropriate streets
  const streets = Array.from(streetMap.values());
  const cc = handState.communityCards;
  for (const sr of streets) {
    if (sr.street === 'flop' && cc.length >= 3) {
      sr.communityCards = cc.slice(0, 3);
    } else if (sr.street === 'turn' && cc.length >= 4) {
      sr.communityCards = [cc[3]];
    } else if (sr.street === 'river' && cc.length >= 5) {
      sr.communityCards = [cc[4]];
    }
  }

  // Build result
  const winners = handState.winnerInfo?.winners ?? [];
  const humanPlayer = players[humanPlayerIndex];
  const humanWin = winners.find((w) => w.playerId === humanPlayer?.id);
  const humanBetTotal = allActions
    .filter((a) => a.playerId === humanPlayer?.id && a.amount)
    .reduce((sum, a) => sum + (a.amount ?? 0), 0);

  const humanNetResult = humanWin
    ? humanWin.amount - humanBetTotal
    : -humanBetTotal;

  const result: HandResult = {
    winners: winners.map((w) => ({
      playerId: w.playerId,
      amountWon: w.amount,
      handRank: w.handRank,
    })),
    potTotal: handState.pot.mainPot + (handState.pot.sidePots?.reduce((s, p) => s + p.amount, 0) ?? 0),
    humanNetResult,
    wentToShowdown: handState.street === 'showdown',
  };

  return {
    handId: handState.handId,
    sessionId,
    handNumber: handState.handNumber,
    startedAt: new Date().toISOString(),
    players: handPlayers,
    streets,
    result,
  };
}

// ─── Hook ────────────────────────────────────────────────────────

export function useGameFlow(): GameFlowActions {
  const { currentSession } = useSessionStore((s) => ({
    currentSession: s.currentSession,
  })) as { currentSession: import('../types').Session | null };

  const { isProcessing: gameProcessing } = useGameStore((s) => ({
    isProcessing: s.isProcessing,
  })) as { isProcessing: boolean };

  const { isLoading: sessionLoading, error: sessionError } = useSessionStore((s) => ({
    isLoading: s.isLoading,
    error: s.error,
  })) as { isLoading: boolean; error: string | null };

  const gameError = useGameStore((s) => s.error) as string | null;

  // Track starting stacks per hand for accurate P/L calculation
  const startingPlayersRef = useRef<Player[]>([]);

  // ── Start new session ──────────────────────────────────────────

  const startNewSession = useCallback(async (blinds?: BlindStructure) => {
    const session = await sessionStore.createSession(blinds);
    uiStore.navigateTo('game');
    uiStore.showToast('新牌局已开始，祝你好运！', 'success');

    // Auto-deal the first hand
    const { players, dealerIndex, humanPlayerIndex } = session;
    startingPlayersRef.current = players.map((p) => ({ ...p }));
    gameStore.startHand(
      session.id,
      1,
      players,
      dealerIndex,
      humanPlayerIndex,
      session.blinds,
    );
  }, []);

  // ── Deal next hand ─────────────────────────────────────────────

  const dealNextHand = useCallback(() => {
    if (!currentSession) {
      uiStore.showToast('没有活跃的牌局', 'error');
      return;
    }

    const { id, players, dealerIndex, humanPlayerIndex, handCount, blinds } = currentSession;
    startingPlayersRef.current = players.map((p) => ({ ...p }));

    gameStore.startHand(
      id,
      handCount + 1,
      players,
      dealerIndex,
      humanPlayerIndex,
      blinds,
    );
  }, [currentSession]);

  // ── Submit player action ───────────────────────────────────────

  const submitAction = useCallback(async (action: PlayerAction): Promise<ActionResult> => {
    const result = gameStore.submitAction(action);

    // If hand is complete, persist hand history and advance session
    if (result.handState.isHandComplete && currentSession) {
      try {
        // Collect all actions from the action log in the game store
        const gameState = gameStore.getState();
        const fullActionLog = gameState.actionLog;

        const handHistory = buildHandHistory(
          currentSession.id,
          result.handState,
          fullActionLog,
          startingPlayersRef.current.length > 0
            ? startingPlayersRef.current
            : currentSession.players,
          currentSession.humanPlayerIndex,
        );

        await handRepository.create(handHistory);

        // Update player stacks from the hand result
        await sessionStore.updatePlayerStacks(result.handState.players);

        // Advance session (increment hand count, rotate dealer)
        await sessionStore.advanceSession();

        // Save session state for crash recovery
        const sessionState: SessionState = {
          sessionId: currentSession.id,
          status: 'active',
          players: result.handState.players,
          currentHandState: null, // Hand is complete
        };
        await sessionStore.saveSessionState(sessionState);

        // Show hand result modal
        uiStore.openModal('hand-result', {
          handId: result.handState.handId,
          winnerInfo: result.handState.winnerInfo,
          humanHandStrength: result.handState.humanHandStrength,
        });
      } catch (err) {
        console.error('Failed to persist hand result:', err);
        uiStore.showToast('保存手牌记录失败', 'error');
      }
    } else if (currentSession) {
      // Save in-progress session state for crash recovery
      const sessionState: SessionState = {
        sessionId: currentSession.id,
        status: 'active',
        players: result.handState.players,
        currentHandState: result.handState,
      };
      sessionStore.saveSessionState(sessionState).catch((err) => {
        console.error('Failed to save session state:', err);
      });
    }

    return result;
  }, [currentSession]);

  // ── End session ────────────────────────────────────────────────

  const endSession = useCallback(async () => {
    // Clear any active hand first
    gameStore.clearHand();

    const summary = await sessionStore.endSession();
    uiStore.openModal('session-summary', {
      ...summary,
    });
    uiStore.navigateTo('home');
    uiStore.showToast(
      `牌局结束！共打了 ${summary.handsPlayed} 手牌`,
      'info',
    );
  }, []);

  // ── Resume session ─────────────────────────────────────────────

  const resumeSession = useCallback(async (sessionId: string) => {
    await sessionStore.loadSession(sessionId);
    uiStore.navigateTo('game');

    const session = sessionStore.getState().currentSession;
    if (!session) {
      uiStore.showToast('无法加载牌局', 'error');
      return;
    }

    if (session.status === 'completed') {
      uiStore.navigateTo('review');
      return;
    }

    uiStore.showToast('已恢复牌局', 'success');
  }, []);

  // ── Derived state ──────────────────────────────────────────────

  const clearError = useCallback(() => {
    sessionStore.clearError();
    gameStore.clearError();
  }, []);

  return {
    startNewSession,
    dealNextHand,
    submitAction,
    endSession,
    resumeSession,
    isProcessing: gameProcessing || sessionLoading,
    error: sessionError || gameError,
    clearError,
  };
}
