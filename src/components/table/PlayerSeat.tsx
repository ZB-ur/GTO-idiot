/**
 * PlayerSeat — renders a single player's seat around the poker table.
 * Shows avatar, name, position, chip stack, hole cards (if visible),
 * current bet, and status indicators (folded, all-in, dealer, active turn).
 */

import React from 'react';
import type { Player } from '../../types';
import { CardComponent } from './CardComponent';
import { DealerButton } from './DealerButton';

interface PlayerSeatProps {
  player: Player;
  isHuman: boolean;
  isCurrentTurn: boolean;
  showCards: boolean;
  className?: string;
}

/** Position-based styling for the 6-seat oval layout */
const POSITION_LABELS: Record<string, string> = {
  UTG: 'UTG',
  HJ: 'HJ',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isHuman,
  isCurrentTurn,
  showCards,
  className = '',
}) => {
  const { name, position, chipStack, isActive, holeCards, currentBet, isFolded, isAllIn, isDealer } = player;

  const isBusted = chipStack <= 0 && !isActive;

  // Determine border/glow based on state
  let borderClass = 'border-gray-700';
  let glowClass = '';
  if (isFolded) {
    borderClass = 'border-gray-800';
  } else if (isCurrentTurn) {
    borderClass = 'border-yellow-400';
    glowClass = 'shadow-lg shadow-yellow-400/30';
  } else if (isAllIn) {
    borderClass = 'border-red-500';
    glowClass = 'shadow-md shadow-red-500/20';
  } else if (isHuman) {
    borderClass = 'border-emerald-500/60';
  }

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${className}`}
    >
      {/* Dealer button */}
      {isDealer && (
        <DealerButton className="absolute -top-2 -right-2 z-10" />
      )}

      {/* Main seat card */}
      <div
        className={`relative flex flex-col items-center rounded-xl border-2
          ${borderClass} ${glowClass}
          bg-gray-900/80 backdrop-blur-sm px-3 py-2 min-w-[80px]
          transition-all duration-300
          ${isFolded ? 'opacity-40' : ''}
          ${isBusted ? 'opacity-20' : ''}`}
      >
        {/* Position badge */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span
            className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full
              ${isHuman ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {POSITION_LABELS[position] ?? position}
          </span>
        </div>

        {/* Player name */}
        <div className="mt-1 text-xs font-medium text-gray-200 truncate max-w-[72px]">
          {isHuman ? '👤 You' : name}
        </div>

        {/* Hole cards */}
        <div className="flex gap-0.5 my-1">
          {showCards && holeCards ? (
            <>
              <CardComponent card={holeCards[0]} size="sm" />
              <CardComponent card={holeCards[1]} size="sm" animationDelay={50} />
            </>
          ) : isActive && !isFolded ? (
            <>
              <CardComponent faceDown size="sm" />
              <CardComponent faceDown size="sm" animationDelay={50} />
            </>
          ) : null}
        </div>

        {/* Chip stack */}
        <div className="flex items-center gap-1">
          <span className="text-[0.65rem] text-gray-400">💰</span>
          <span
            className={`text-xs font-bold tabular-nums
              ${chipStack > 50 ? 'text-white' : chipStack > 20 ? 'text-yellow-400' : 'text-red-400'}`}
          >
            {chipStack.toFixed(0)} BB
          </span>
        </div>

        {/* Status badges */}
        {isAllIn && (
          <span className="text-[0.6rem] font-bold text-red-400 uppercase tracking-wider animate-pulse">
            All In
          </span>
        )}
        {isFolded && (
          <span className="text-[0.6rem] font-semibold text-gray-500 uppercase tracking-wider">
            Fold
          </span>
        )}

        {/* Turn indicator */}
        {isCurrentTurn && !isFolded && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        )}
      </div>

      {/* Current bet (shown outside the seat card) */}
      {currentBet > 0 && !isFolded && (
        <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-red-500" />
          <span className="text-[0.65rem] font-bold text-yellow-300 tabular-nums">
            {currentBet.toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;
