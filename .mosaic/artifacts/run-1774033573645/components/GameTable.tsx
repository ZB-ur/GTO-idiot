'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Child component imports (to be implemented separately)
import { PokerTable } from './PokerTable';
import { ActionPanel } from './ActionPanel';
import { BetTimeline } from './BetTimeline';
import { ShowdownOverlay } from './ShowdownOverlay';
import { SessionPauseModal } from './SessionPauseModal';
import { SessionSummaryModal } from './SessionSummaryModal';

// Types derived from API spec
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface PotInfo {
  mainPot: number;
  sidePots?: { amount: number; eligiblePlayers: number[] }[];
}

interface Player {
  seatIndex: number;
  name: string;
  chips: number;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  isHuman: boolean;
  isActive: boolean;
  isBusted?: boolean;
  botStyle?: 'TAG' | 'LAG' | 'Nit' | 'Fish' | 'GTO';
  holeCards?: Card[];
  currentBet?: number;
}

interface Action {
  playerSeatIndex: number;
  playerName?: string;
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  potAfter?: number;
  timestamp: string;
}

interface AvailableAction {
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  minAmount?: number;
  maxAmount?: number;
}

interface HandResult {
  winners: { seatIndex: number; amount: number; potType?: string }[];
  handRankings: { seatIndex: number; handName: string; cards: Card[] }[];
  showdown?: boolean;
}

interface GameState {
  handId: string;
  sessionId: string;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  players: Player[];
  pot: PotInfo;
  communityCards: Card[];
  actions: Action[];
  currentPlayerSeatIndex: number;
  dealerSeatIndex: number;
  availableActions?: AvailableAction[];
  isHandComplete?: boolean;
  result?: HandResult;
}

interface BotActionEvent {
  seatIndex: number;
  name: string;
  botStyle?: string;
  actionType: string;
  amount?: number;
  thinkTimeMs: number;
}

interface Session {
  id: string;
  status: 'active' | 'paused' | 'completed';
  stackDepthBB: number;
  players: Player[];
  handCount: number;
  profitLossBB: number;
  dealerSeatIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionSummary {
  sessionId: string;
  handCount: number;
  profitLossBB: number;
  durationMinutes?: number;
  profitCurve: { handNumber: number; profitBB: number }[];
  keyStats: {
    vpip?: number;
    pfr?: number;
    aggression?: number;
    wtsd?: number;
    avgEvLossPerHand?: number;
  };
}

interface GameTableProps {
  sessionId: string;
}

type ModalState = 'none' | 'pause' | 'summary';

export const GameTable: React.FC<GameTableProps> = ({ sessionId }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session data on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) throw new Error('Failed to load session');
        const data: Session = await res.json();
        setSession(data);

        // If session is active, load current game state
        if (data.status === 'active') {
          const gameRes = await fetch(`/api/sessions/${sessionId}/hands/current`);
          if (gameRes.ok) {
            const gameData: GameState = await gameRes.json();
            setGameState(gameData);
          } else {
            // No current hand, deal a new one
            await dealNewHand();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const dealNewHand = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/hands/deal`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to deal hand');
      const data: GameState = await res.json();
      setGameState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deal');
    }
  }, [sessionId]);

  const handlePlayerAction = useCallback(
    async (actionType: string, amount?: number) => {
      if (!gameState || isAnimating) return;

      try {
        const res = await fetch(`/api/sessions/${sessionId}/hands/current/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionType, amount }),
        });

        if (!res.ok) throw new Error('Action failed');
        const result: { gameState: GameState; botActions: BotActionEvent[] } =
          await res.json();

        // Animate bot actions sequentially
        if (result.botActions.length > 0) {
          setIsAnimating(true);
          for (const botAction of result.botActions) {
            await new Promise((resolve) => setTimeout(resolve, botAction.thinkTimeMs));
            // Update game state incrementally during animation
            setGameState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                actions: [
                  ...prev.actions,
                  {
                    playerSeatIndex: botAction.seatIndex,
                    playerName: botAction.name,
                    actionType: botAction.actionType as Action['actionType'],
                    amount: botAction.amount,
                    street: prev.street,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            });
          }
          setIsAnimating(false);
        }

        // Set final game state
        setGameState(result.gameState);

        // If hand is complete, auto-deal after delay
        if (result.gameState.isHandComplete) {
          setTimeout(() => {
            dealNewHand();
          }, 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
      }
    },
    [gameState, sessionId, isAnimating, dealNewHand]
  );

  const handlePause = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      });
      if (!res.ok) throw new Error('Failed to pause session');
      const data: Session = await res.json();
      setSession(data);
      setModalState('pause');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause');
    }
  }, [sessionId]);

  const handleResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (!res.ok) throw new Error('Failed to resume session');
      const data: Session = await res.json();
      setSession(data);
      setModalState('none');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume');
    }
  }, [sessionId]);

  const handleEndSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to end session');
      const data: SessionSummary = await res.json();
      setSessionSummary(data);
      setModalState('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    }
  }, [sessionId]);

  const isPlayerTurn =
    gameState?.currentPlayerSeatIndex !== undefined &&
    gameState?.currentPlayerSeatIndex >= 0 &&
    gameState?.players[gameState.currentPlayerSeatIndex]?.isHuman;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading table...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-gray-900 font-semibold">Something went wrong</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Bar — Session Info */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Hand #{session?.handCount ?? 0}
          </h1>
          <span className="text-sm text-gray-500">
            {session?.stackDepthBB ?? 100}BB Deep
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              (session?.profitLossBB ?? 0) >= 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {(session?.profitLossBB ?? 0) >= 0 ? '+' : ''}
            {(session?.profitLossBB ?? 0).toFixed(1)} BB
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePause}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Pause
          </button>
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center min-h-0">
        {/* Poker Table */}
        {gameState && (
          <div className="flex-1 flex items-center justify-center w-full px-4">
            <PokerTable
              players={gameState.players}
              communityCards={gameState.communityCards}
              pot={gameState.pot}
              dealerSeatIndex={gameState.dealerSeatIndex}
              currentPlayerSeatIndex={gameState.currentPlayerSeatIndex}
              street={gameState.street}
              isHandComplete={gameState.isHandComplete}
              result={gameState.result}
            />
          </div>
        )}

        {/* Bet Timeline — sticky bottom of table area */}
        {gameState && gameState.actions.length > 0 && (
          <div className="w-full max-w-4xl mx-auto px-4 pb-2 shrink-0">
            <BetTimeline
              actions={gameState.actions}
              street={gameState.street}
              players={gameState.players}
            />
          </div>
        )}
      </main>

      {/* Action Panel — fixed bottom */}
      {gameState && !gameState.isHandComplete && (
        <div className="shrink-0 border-t border-gray-200 bg-white">
          <ActionPanel
            availableActions={gameState.availableActions ?? []}
            isPlayerTurn={!!isPlayerTurn}
            isAnimating={isAnimating}
            pot={gameState.pot}
            playerChips={
              gameState.players.find((p) => p.isHuman)?.chips ?? 0
            }
            onAction={handlePlayerAction}
          />
        </div>
      )}

      {/* Showdown Overlay */}
      {gameState?.isHandComplete && gameState.result && (
        <ShowdownOverlay
          result={gameState.result}
          players={gameState.players}
          onDismiss={dealNewHand}
        />
      )}

      {/* Session Pause Modal */}
      {modalState === 'pause' && (
        <SessionPauseModal
          session={session!}
          onResume={handleResume}
          onEnd={handleEndSession}
          onClose={() => setModalState('none')}
        />
      )}

      {/* Session Summary Modal */}
      {modalState === 'summary' && sessionSummary && (
        <SessionSummaryModal
          summary={sessionSummary}
          onClose={() => setModalState('none')}
        />
      )}
    </div>
  );
};

export default GameTable;