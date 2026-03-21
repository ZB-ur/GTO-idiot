// ============================================================
// GamePage — Full game page integrating PokerTable + useGameLoop
// Handles session loading, game lifecycle, and session controls
// ============================================================

import React, { useEffect, useCallback } from 'react';
import type { Session } from '../../types';
import { useSessionStore } from '../../stores/session-store';
import { useUIStore } from '../../stores/ui-store';
import { useGameLoop } from './useGameLoop';
import PokerTable from './PokerTable';

export interface GamePageProps {
  session: Session;
}

const GamePageInner: React.FC<GamePageProps> = ({ session }) => {
  const {
    phase,
    handState,
    availableActions,
    settlement,
    error,
    handCount,
    startNewHand,
    submitPlayerAction,
    reset,
  } = useGameLoop(session);

  const { pauseSession, endSession } = useSessionStore();
  const { showConfirmDialog, closeConfirmDialog, addToast, openSessionSummary } = useUIStore();

  // Auto-start the first hand when session begins
  useEffect(() => {
    if (phase === 'idle' && handCount === 0 && session.status === 'active') {
      const timer = setTimeout(() => {
        startNewHand();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, handCount, session.status, startNewHand]);

  const handlePauseSession = useCallback(() => {
    showConfirmDialog({
      title: 'Pause Session',
      message: 'Pause the current session? You can resume later from the dashboard.',
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await pauseSession();
          reset();
          addToast('info', 'Session paused');
        } catch {
          addToast('error', 'Failed to pause session');
        }
      },
      onCancel: closeConfirmDialog,
    });
  }, [showConfirmDialog, closeConfirmDialog, pauseSession, reset, addToast]);

  const handleEndSession = useCallback(() => {
    showConfirmDialog({
      title: 'End Session',
      message: `End this session after ${session.handCount + handCount} hands? Your stats will be saved.`,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await endSession();
          reset();
          openSessionSummary();
        } catch {
          addToast('error', 'Failed to end session');
        }
      },
      onCancel: closeConfirmDialog,
    });
  }, [
    showConfirmDialog, closeConfirmDialog, endSession, reset,
    openSessionSummary, addToast, session.handCount, handCount,
  ]);

  const humanPlayer = session.players.find((p) => p.isHuman);
  const stackBB = humanPlayer?.stackBB ?? 0;
  const isProcessing = phase === 'dealing' || phase === 'bot_thinking' || phase === 'settling';

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: session info + controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Active
          </span>
          <span className="text-gray-400">
            Hand <span className="text-white font-medium">#{session.handCount + handCount}</span>
          </span>
          <span className="text-gray-400">
            Stack <span className="text-white font-medium">{stackBB.toFixed(1)} BB</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePauseSession}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300
              hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={handleEndSession}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-800 text-red-200
              hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Poker table - centered */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <PokerTable
          session={session}
          handState={handState}
          availableActions={availableActions}
          settlement={settlement}
          phase={phase}
          onAction={submitPlayerAction}
          onStartHand={startNewHand}
          error={error}
          handCount={handCount}
        />
      </div>
    </div>
  );
};

/**
 * GamePage — top-level page that ensures a session is loaded before
 * rendering the game. Falls back to a "no session" message.
 */
const GamePage: React.FC = () => {
  const { currentSession, loadActiveSession, isLoading } = useSessionStore();

  useEffect(() => {
    if (!currentSession) {
      loadActiveSession();
    }
  }, [currentSession, loadActiveSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 animate-pulse">Loading session...</div>
      </div>
    );
  }

  if (!currentSession || currentSession.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400 text-lg">No active session</p>
        <p className="text-gray-500 text-sm">
          Start a new session from the dashboard to begin playing.
        </p>
      </div>
    );
  }

  return <GamePageInner session={currentSession} />;
};

export default GamePage;
