// ============================================================
// GTO Idiot — Player Seat Component
// Renders a single player at the poker table with cards, chips, status
// ============================================================

import type { PlayerState } from '../../types';
import { CardRow } from './CardDisplay';

interface PlayerSeatProps {
  player: PlayerState;
  isCurrentActor: boolean;
  isHero: boolean;
  dealerSeat: boolean;
  className?: string;
}

export default function PlayerSeat({
  player,
  isCurrentActor,
  isHero,
  dealerSeat,
  className = '',
}: PlayerSeatProps) {
  const isActive = player.is_active;
  const isFolded = !isActive;

  // Ring highlight for current actor
  const ringClass = isCurrentActor
    ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20'
    : '';

  // Opacity for folded players
  const opacityClass = isFolded ? 'opacity-40' : '';

  // Hero highlight
  const borderClass = isHero
    ? 'border-green-500/60'
    : 'border-gray-600';

  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-xl border bg-gray-800 p-2 transition-all ${borderClass} ${ringClass} ${opacityClass} ${className}`}
      style={{ minWidth: '100px' }}
    >
      {/* Dealer button */}
      {dealerSeat && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-gray-900 shadow">
          D
        </div>
      )}

      {/* Position badge */}
      <div className="flex items-center gap-1">
        <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300">
          {player.position}
        </span>
        {player.is_bot && (
          <span className="rounded bg-blue-900/50 px-1 py-0.5 text-[10px] text-blue-400">
            BOT
          </span>
        )}
      </div>

      {/* Player name */}
      <div className={`text-xs font-medium ${isHero ? 'text-green-400' : 'text-gray-200'}`}>
        {player.name}
      </div>

      {/* Hole cards */}
      <div className="flex items-center justify-center" style={{ minHeight: '32px' }}>
        {player.hole_cards && player.hole_cards.length > 0 ? (
          <CardRow cards={player.hole_cards} size="sm" />
        ) : isActive ? (
          <CardRow cards={[null, null]} faceDown size="sm" />
        ) : null}
      </div>

      {/* Stack */}
      <div className="text-xs font-mono text-gray-300">
        {player.is_all_in ? (
          <span className="font-bold text-red-400">ALL IN</span>
        ) : (
          <span>{formatChips(player.stack)}</span>
        )}
      </div>

      {/* Current bet */}
      {player.current_bet > 0 && (
        <div className="absolute -bottom-3 rounded-full bg-yellow-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          {formatChips(player.current_bet)}
        </div>
      )}

      {/* Last action */}
      {player.last_action && (
        <div className="mt-0.5 text-[10px] italic text-gray-400">
          {player.last_action}
        </div>
      )}
    </div>
  );
}

function formatChips(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toFixed(amount % 1 === 0 ? 0 : 1);
}
