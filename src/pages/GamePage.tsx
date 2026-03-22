import React, { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/game-store';
import PokerTable from '../ui/table/PokerTable';
import ActionPanel from '../ui/actions/ActionPanel';
import type { PlayerAction, AvailableActions, CreateGameRequest } from '../types';
import { gameService } from '../services/game-service';

const GamePage: React.FC = () => {
  const { gameState, isLoading, error, createGame, submitAction, dealNextHand, endGame } = useGameStore();
  const [availableActions, setAvailableActions] = useState<AvailableActions | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch available actions when it's the player's turn
  useEffect(() => {
    if (!gameState?.currentHand?.isPlayerTurn || !gameState.gameId) {
      setAvailableActions(null);
      return;
    }

    let cancelled = false;
    gameService.getAvailableActions(gameState.gameId).then((actions) => {
      if (!cancelled) setAvailableActions(actions);
    });

    return () => { cancelled = true; };
  }, [gameState?.gameId, gameState?.currentHand?.isPlayerTurn, gameState?.currentHand?.street, gameState?.currentHand?.handId]);

  const handleAction = useCallback(async (action: PlayerAction) => {
    setActionLoading(true);
    try {
      await submitAction(action);
    } finally {
      setActionLoading(false);
    }
  }, [submitAction]);

  const handleDealNext = useCallback(async () => {
    setActionLoading(true);
    try {
      await dealNextHand();
    } finally {
      setActionLoading(false);
    }
  }, [dealNextHand]);

  const handleNewGame = useCallback(async (config: CreateGameRequest) => {
    await createGame(config);
  }, [createGame]);

  const handleEndGame = useCallback(async () => {
    await endGame();
  }, [endGame]);

  // ── No active game: show start screen ──
  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <div className="flex flex-col items-center gap-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">GTO Trainer</h1>
            <p className="text-slate-400">Practice Texas Hold&apos;em with GTO strategy feedback</p>
          </div>

          <NewGameForm onStart={handleNewGame} isLoading={isLoading} />

          {error && (
            <div className="w-full bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const hand = gameState.currentHand;
  const isHandOver = hand?.status === 'showdown' || hand?.status === 'concluded';
  const isPlayerTurn = hand?.isPlayerTurn && hand.status === 'in_progress';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-300">
            Blinds: <span className="text-yellow-300">{gameState.blindLevel}</span>
          </span>
          <span className="text-sm text-slate-400">
            Hand #{gameState.handCount}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`text-sm font-bold ${
              gameState.sessionProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {gameState.sessionProfit >= 0 ? '+' : ''}
            {gameState.sessionProfit.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={handleEndGame}
            className="
              px-3 py-1 text-xs font-semibold rounded-md
              bg-slate-700 text-slate-300 hover:bg-slate-600
              border border-slate-600
              transition-colors
            "
          >
            End Game
          </button>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <PokerTable gameState={gameState} />
      </div>

      {/* Loading overlay */}
      {(isLoading || actionLoading) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Action area */}
      <div className="relative z-20">
        {isPlayerTurn && availableActions && (
          <ActionPanel
            availableActions={availableActions}
            onAction={handleAction}
            disabled={actionLoading}
          />
        )}

        {isHandOver && (
          <div className="w-full max-w-2xl mx-auto px-4 py-3 flex flex-col items-center gap-2">
            {hand?.result && (
              <div
                className={`text-sm font-semibold ${
                  hand.result.playerProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {hand.result.playerProfit >= 0 ? 'Won' : 'Lost'}{' '}
                {Math.abs(hand.result.playerProfit).toLocaleString()} chips
              </div>
            )}
            <button
              type="button"
              onClick={handleDealNext}
              disabled={actionLoading}
              className="
                px-8 py-3 text-base font-bold rounded-lg
                bg-gradient-to-b from-green-600 to-green-700 text-white
                hover:from-green-500 hover:to-green-600
                shadow-lg border border-green-500/30
                transition-all duration-150
                active:scale-95
                disabled:opacity-40
              "
            >
              Deal Next Hand
            </button>
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-900/90 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-200 shadow-xl max-w-sm">
          {error}
        </div>
      )}
    </div>
  );
};

// ── New Game Form ──

interface NewGameFormProps {
  onStart: (config: CreateGameRequest) => void;
  isLoading: boolean;
}

const NewGameForm: React.FC<NewGameFormProps> = ({ onStart, isLoading }) => {
  const [blindLevel, setBlindLevel] = useState<'1/2' | '2/5' | '5/10'>('1/2');
  const [stackSize, setStackSize] = useState(100);
  const [speed, setSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ blindLevel, startingStackBB: stackSize, speed });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* Blind level */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-300">Blind Level</label>
        <div className="flex gap-2">
          {(['1/2', '2/5', '5/10'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setBlindLevel(level)}
              className={`
                flex-1 py-2 rounded-lg text-sm font-bold transition-colors border
                ${blindLevel === level
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Stack size */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-300">
          Starting Stack: <span className="text-yellow-300">{stackSize} BB</span>
        </label>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={stackSize}
          onChange={(e) => setStackSize(Number(e.target.value))}
          className="w-full accent-yellow-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>50 BB</span>
          <span>200 BB</span>
        </div>
      </div>

      {/* Speed */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-300">Game Speed</label>
        <div className="flex gap-2">
          {(['fast', 'normal', 'slow'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`
                flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors border
                ${speed === s
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full py-3 mt-2 text-lg font-bold rounded-lg
          bg-gradient-to-b from-green-600 to-green-700 text-white
          hover:from-green-500 hover:to-green-600
          shadow-lg border border-green-500/30
          transition-all duration-150
          active:scale-[0.98]
          disabled:opacity-50
        "
      >
        {isLoading ? 'Starting...' : 'Start Game'}
      </button>
    </form>
  );
};

export default GamePage;
