import { useGame } from '../contexts/GameContext';
import { PokerTable } from '../components/table/PokerTable';
import { ActionPanel } from '../components/action/ActionPanel';
import { Spinner } from '../components/shared/Spinner';

/**
 * Main game play page. Integrates the poker table with the action panel.
 * Handles the hand lifecycle: deal → play → next hand.
 */
export function PlayPage() {
  const { state, dealHand } = useGame();
  const { session, hand, isLoading } = state;

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">No active game session</p>
      </div>
    );
  }

  const handComplete = hand?.phase === 'complete';

  return (
    <div className="flex h-full flex-col">
      {/* Table area */}
      <div className="flex-1 relative min-h-0 p-4">
        {hand ? (
          <PokerTable />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-300">Ready to play</p>
            <button
              onClick={dealHand}
              disabled={isLoading}
              className="rounded-lg bg-felt-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-felt-500 disabled:opacity-50"
            >
              {isLoading ? <Spinner size="sm" /> : 'Deal First Hand'}
            </button>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="shrink-0 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        {hand && !handComplete && (
          <ActionPanel />
        )}

        {handComplete && (
          <div className="flex items-center justify-center gap-4 p-4">
            {/* Show result */}
            <div className="text-center">
              {hand.winners && hand.winners.length > 0 && (
                <p className="text-sm text-gray-400">
                  {hand.winners.map(w => (
                    <span key={w.playerId}>
                      <span className="font-semibold text-white">{w.playerName}</span>
                      {' wins '}
                      <span className="font-semibold text-chip-gold">{w.amount.toFixed(1)} BB</span>
                      {w.handRank && <span className="text-gray-500"> ({w.handRank})</span>}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <button
              onClick={dealHand}
              disabled={isLoading}
              className="rounded-lg bg-felt-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-felt-500 disabled:opacity-50"
            >
              {isLoading ? <Spinner size="sm" /> : 'Next Hand'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
