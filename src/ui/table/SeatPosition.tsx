import React from 'react';
import type { PlayerInfo, HandPlayerState, Card } from '../../types';
import PlayingCard from '../components/PlayingCard';
import ChipStack from './ChipStack';

export interface SeatPositionProps {
  player: PlayerInfo;
  handPlayer?: HandPlayerState;
  isDealer?: boolean;
  isActive?: boolean;
  lastAction?: string;
}

function formatChips(amount: number): string {
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

const SeatPosition: React.FC<SeatPositionProps> = ({
  player,
  handPlayer,
  isDealer,
  isActive,
  lastAction,
}) => {
  const isFolded = handPlayer?.isFolded ?? false;
  const isAllIn = handPlayer?.isAllIn ?? false;
  const holeCards: Card[] | undefined = handPlayer?.holeCards;
  const currentBet = handPlayer?.bet ?? 0;
  const isHuman = player.isHuman;

  return (
    <div
      className={`
        relative flex flex-col items-center gap-1
        transition-all duration-300
        ${isFolded ? 'opacity-40' : 'opacity-100'}
        ${isActive ? 'scale-105' : 'scale-100'}
      `}
      aria-label={`${player.name} - ${player.position}`}
    >
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-lg z-10">
          <span className="text-[10px] font-black text-yellow-900">D</span>
        </div>
      )}

      {/* Active indicator ring */}
      {isActive && (
        <div className="absolute inset-0 -m-1 rounded-xl border-2 border-yellow-400 animate-pulse pointer-events-none" />
      )}

      {/* Hole cards */}
      <div className="flex gap-0.5 h-14">
        {holeCards && holeCards.length === 2 ? (
          holeCards.map((card) => (
            <PlayingCard key={`${card.rank}${card.suit}`} card={card} size="sm" />
          ))
        ) : handPlayer && !isFolded ? (
          <>
            <PlayingCard faceDown size="sm" />
            <PlayingCard faceDown size="sm" />
          </>
        ) : (
          <div className="h-14" /> /* spacer when folded */
        )}
      </div>

      {/* Player info card */}
      <div
        className={`
          flex flex-col items-center rounded-lg px-3 py-1.5 min-w-[80px]
          ${isHuman
            ? 'bg-gradient-to-b from-blue-800 to-blue-900 border border-blue-500/50'
            : 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-500/30'
          }
          shadow-lg
        `}
      >
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {player.position}
        </span>
        <span className={`text-sm font-bold truncate max-w-[80px] ${isHuman ? 'text-blue-200' : 'text-slate-200'}`}>
          {player.name}
        </span>
        <span className="text-xs font-mono text-yellow-300">
          {formatChips(player.chipStack)}
        </span>
      </div>

      {/* All-in badge */}
      {isAllIn && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
          All-In
        </div>
      )}

      {/* Last action label */}
      {lastAction && !isAllIn && (
        <div className="bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shadow-md">
          {lastAction}
        </div>
      )}

      {/* Current bet (shown away from the seat, toward the center) */}
      {currentBet > 0 && (
        <div className="mt-1">
          <ChipStack amount={currentBet} size="sm" />
        </div>
      )}
    </div>
  );
};

export default SeatPosition;
