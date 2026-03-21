// ============================================================
// PlayerSeat — Individual player seat on the poker table
// Shows avatar, name, stack, position badge, hole cards, bet, action
// ============================================================

import React from 'react';
import type { HandPlayer, ActionType } from '../../types';
import type { Card as CardType } from '../../types';
import Card from './Card';
import { winnerPulseStyle } from './animations';

export interface PlayerSeatProps {
  player: HandPlayer;
  /** Whether this is the human player's seat */
  isHuman: boolean;
  /** Whether it's this player's turn to act */
  isActing: boolean;
  /** Whether this player won the pot */
  isWinner: boolean;
  /** The seat index of the dealer */
  dealerSeat: number;
  /** Hole cards to display (human only during play, all at showdown) */
  holeCards: CardType[] | null;
  /** Whether to show cards face up */
  showCards: boolean;
  /** Whether to animate deal */
  animateDeal: boolean;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-In',
};

const ACTION_COLORS: Record<ActionType, string> = {
  fold: 'bg-gray-600',
  check: 'bg-green-700',
  call: 'bg-blue-700',
  bet: 'bg-yellow-700',
  raise: 'bg-orange-700',
  all_in: 'bg-red-700',
};

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isHuman,
  isActing,
  isWinner,
  dealerSeat,
  holeCards,
  showCards,
  animateDeal,
}) => {
  const isDealer = player.seat === dealerSeat;
  const isFolded = !player.isActive;

  return (
    <div
      className={`
        relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300
        ${isActing ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-felt-dark' : ''}
        ${isFolded ? 'opacity-50' : ''}
        ${isHuman ? 'bg-felt-dark/80' : 'bg-felt-dark/60'}
      `}
      style={isWinner ? winnerPulseStyle() : undefined}
    >
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center shadow-md z-10">
          D
        </div>
      )}

      {/* Position badge */}
      <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300 z-10">
        {player.position}
      </div>

      {/* Hole cards */}
      <div className="flex gap-0.5 h-[48px] items-center">
        {holeCards && holeCards.length === 2 ? (
          holeCards.map((card, i) => (
            <Card
              key={`${card.rank}${card.suit}`}
              card={card}
              faceUp={showCards}
              size="sm"
              animate={animateDeal}
              dealIndex={i}
              className={animateDeal ? '' : ''}
            />
          ))
        ) : (
          // Empty card placeholders
          <>
            <div className="w-[40px] h-[48px]" />
            <div className="w-[40px] h-[48px]" />
          </>
        )}
      </div>

      {/* Player name + stack */}
      <div className="text-center min-w-[80px]">
        <div className={`text-xs font-semibold truncate ${isHuman ? 'text-yellow-300' : 'text-white'}`}>
          {player.name}
        </div>
        <div className="text-xs text-gray-300 font-mono">
          {player.stackBB.toFixed(1)} BB
        </div>
      </div>

      {/* Last action badge */}
      {player.lastAction && (
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${ACTION_COLORS[player.lastAction]}`}
        >
          {ACTION_LABELS[player.lastAction]}
          {player.lastAction !== 'fold' && player.lastAction !== 'check' && player.currentBet > 0
            ? ` ${player.currentBet.toFixed(1)}`
            : ''}
        </div>
      )}

      {/* Current bet display */}
      {player.currentBet > 0 && !player.lastAction && (
        <div className="text-xs text-yellow-400 font-mono">
          {player.currentBet.toFixed(1)} BB
        </div>
      )}

      {/* All-in indicator */}
      {player.isAllIn && (
        <div className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-600 animate-pulse">
          ALL-IN
        </div>
      )}

      {/* Acting indicator */}
      {isActing && !isFolded && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
      )}
    </div>
  );
};

export default React.memo(PlayerSeat);
