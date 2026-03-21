
import { useGame } from '../../contexts/GameContext';
import { SeatSelector } from './SeatSelector';

export function HomeScreen() {
  const { state, startGame } = useGame();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            GTO <span className="text-felt-400">Idiot</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Texas Hold'em GTO Trainer</p>
        </div>

        {/* Seat selector */}
        <div className="card-container">
          <SeatSelector
            onSelect={(position, stack) => startGame(position, stack)}
            isLoading={state.isLoading}
          />
        </div>

        {/* Error display */}
        {state.error && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}
