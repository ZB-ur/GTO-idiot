import React from 'react';

// Types from API spec
interface Card {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

interface PlayerState {
  seat: number;
  name: string;
  position: Position;
  stack: number;
  hole_cards?: Card[] | null;
  is_active: boolean;
  is_all_in?: boolean;
  is_bot: boolean;
  current_bet?: number;
  total_invested?: number;
  last_action?: string | null;
}

type SeatPosition = 'top-left' | 'top-right' | 'right' | 'bottom-right' | 'bottom-left' | 'left';

interface PlayerSeatProps {
  player: PlayerState;
  isActive?: boolean;
  isCurrentActor?: boolean;
  isDealer?: boolean;
  showCards?: boolean;
  position: SeatPosition;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

function CardDisplay({ card, faceDown }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-emerald-500/40 bg-emerald-800" />
      </div>
    );
  }

  const color = suitColors[card.suit];
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col items-center justify-center gap-0">
      <span className={`text-sm font-bold leading-none ${color}`}>{card.rank}</span>
      <span className={`text-base leading-none ${color}`}>{suitSymbols[card.suit]}</span>
    </div>
  );
}

export default function PlayerSeat({
  player,
  isActive = true,
  isCurrentActor = false,
  isDealer = false,
  showCards = false,
  position,
}: PlayerSeatProps) {
  const isFolded = !player.is_active;
  const isAllIn = player.is_all_in ?? false;

  // Status badge
  const getStatusBadge = () => {
    if (isAllIn) return { label: 'ALL IN', classes: 'bg-yellow-500 text-gray-900' };
    if (isFolded) return { label: 'FOLD', classes: 'bg-gray-600 text-gray-300' };
    if (isCurrentActor) return { label: 'ACTING', classes: 'bg-emerald-500 text-white animate-pulse' };
    return null;
  };

  const statusBadge = getStatusBadge();

  // Ring glow for current actor
  const ringClass = isCurrentActor
    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-950'
    : '';

  // Opacity for folded players
  const opacityClass = isFolded ? 'opacity-50' : '';

  return (
    <div className={`relative flex flex-col items-center gap-1 ${opacityClass}`}>
      {/* Dealer chip */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-yellow-400 text-gray-900 text-xs font-black flex items-center justify-center shadow-lg border-2 border-yellow-300">
          D
        </div>
      )}

      {/* Card area */}
      <div className="flex gap-1 mb-1">
        {showCards && player.hole_cards && player.hole_cards.length === 2 ? (
          <>
            <CardDisplay card={player.hole_cards[0]} />
            <CardDisplay card={player.hole_cards[1]} />
          </>
        ) : isActive && !isFolded ? (
          <>
            <CardDisplay faceDown />
            <CardDisplay faceDown />
          </>
        ) : null}
      </div>

      {/* Player info box */}
      <div
        className={`relative rounded-xl bg-gray-800 border border-gray-700 px-4 py-2 min-w-[100px] text-center shadow-lg ${ringClass}`}
      >
        {/* Name + position */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-gray-50 text-sm font-semibold truncate max-w-[80px]">
            {player.name}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            {player.position}
          </span>
        </div>

        {/* Stack */}
        <div className="text-gray-400 text-xs mt-0.5 font-mono">
          {player.stack.toLocaleString()} BB
        </div>

        {/* Last action */}
        {player.last_action && !isFolded && (
          <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wide">
            {player.last_action}
          </div>
        )}

        {/* Status badge */}
        {statusBadge && (
          <div
            className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadge.classes}`}
          >
            {statusBadge.label}
          </div>
        )}
      </div>

      {/* Current bet */}
      {player.current_bet != null && player.current_bet > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow" />
          <span className="text-yellow-400 text-xs font-mono font-bold">
            {player.current_bet}
          </span>
        </div>
      )}
    </div>
  );
}