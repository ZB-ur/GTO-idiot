
import { useGame } from '../../contexts/GameContext';
import { HomeScreen } from './HomeScreen';
import { PokerTable } from '../table/PokerTable';
import { ActionPanel } from '../action/ActionPanel';
import { Spinner } from '../shared/Spinner';
import { toast } from '../shared/Toast';

export function AppShell() {
  const { state, dealHand, stopGame } = useGame();
  const { session, hand, isLoading, error } = state;

  // No active session — show home screen
  if (!session) {
    return <HomeScreen />;
  }

  const isHandComplete = hand?.phase === 'complete';

  return (
    <div className="flex h-screen flex-col bg-felt-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">
            GTO <span className="text-felt-400">Idiot</span>
          </h1>
          {hand && (
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              Hand #{hand.handNumber ?? session.handsPlayed}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session.status === 'active' && (
            <button
              onClick={() => {
                stopGame();
                toast('Game ended', 'info');
              }}
              className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600"
            >
              End Game
            </button>
          )}
        </div>
      </header>

      {/* Main table area */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-900/40 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {hand ? (
          <PokerTable />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-400">Ready to play</p>
            <button onClick={dealHand} disabled={isLoading} className="btn-primary px-8 py-3 text-base font-bold">
              {isLoading ? <Spinner size="sm" /> : 'Deal First Hand'}
            </button>
          </div>
        )}
      </main>

      {/* Bottom action area */}
      <footer className="border-t border-gray-800 py-3">
        {isHandComplete ? (
          <div className="flex flex-col items-center gap-2">
            {hand?.winners && hand.winners.length > 0 && (
              <div className="text-sm text-gray-300">
                {hand.winners.map((w) => (
                  <span key={w.playerId}>
                    <span className="font-bold text-yellow-400">{w.playerName}</span>{' '}
                    wins {w.amount.toFixed(1)} BB
                    {w.handRank ? ` with ${w.handRank}` : ''}
                  </span>
                ))}
              </div>
            )}
            <button onClick={dealHand} disabled={isLoading} className="btn-primary px-6 py-2.5 text-sm font-bold">
              {isLoading ? <Spinner size="sm" /> : 'Deal Next Hand'}
            </button>
          </div>
        ) : (
          <ActionPanel />
        )}
      </footer>
    </div>
  );
}
