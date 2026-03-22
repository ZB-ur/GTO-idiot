import React from 'react';

export interface CardData {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  chips: number;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  holeCards?: [CardData, CardData];
  currentBet?: number;
  status: 'active' | 'folded' | 'all_in' | 'sitting_out';
  isDealer?: boolean;
  handStrength?: 'nuts' | 'strong' | 'medium' | 'weak' | 'air';
}

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  isCurrentPlayer: boolean;
  showCards: boolean;
  seatIndex: number;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-emerald-700',
  spades: 'text-gray-900',
};

const strengthColors: Record<string, string> = {
  nuts: 'bg-amber-400 text-amber-900',
  strong: 'bg-green-500 text-white',
  medium: 'bg-blue-500 text-white',
  weak: 'bg-orange-400 text-orange-900',
  air: 'bg-gray-400 text-white',
};

const strengthLabels: Record<string, string> = {
  nuts: 'Nuts',
  strong: 'Strong',
  medium: 'Medium',
  weak: 'Weak',
  air: 'Air',
};

function CardComponent({ card, faceDown }: { card?: CardData; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-sm flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-0">
      <span className={`text-xs font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
      <span className={`text-sm leading-none ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
    </div>
  );
}

function DealerButton() {
  return (
    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow flex items-center justify-center z-10">
      <span className="text-[10px] font-black text-yellow-900">D</span>
    </div>
  );
}

function BetChips({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="w-4 h-4 rounded-full bg-gradient-to-b from-red-400 to-red-600 border border-red-700 shadow-sm" />
      <span className="text-xs font-semibold text-emerald-100">{amount} BB</span>
    </div>
  );
}

function HandStrengthIndicator({ strength }: { strength: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${strengthColors[strength]}`}>
      {strengthLabels[strength]}
    </span>
  );
}

function Badge({ label, variant }: { label: string; variant: 'position' | 'status' }) {
  const classes =
    variant === 'position'
      ? 'bg-emerald-600 text-emerald-50'
      : 'bg-gray-500 text-gray-50';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${classes}`}>
      {label}
    </span>
  );
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isActive,
  isCurrentPlayer,
  showCards,
  seatIndex,
}) => {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'all_in';

  return (
    <div
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300
        ${isActive ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-emerald-800' : ''}
        ${isCurrentPlayer ? 'bg-emerald-700/80 shadow-lg shadow-emerald-900/50' : 'bg-emerald-900/60'}
        ${isFolded ? 'opacity-50' : 'opacity-100'}
      `}
      data-seat={seatIndex}
    >
      {player.isDealer && <DealerButton />}

      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden
            ${isActive ? 'border-yellow-400' : 'border-emerald-600'}
          `}
        >
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{player.name[0]}</span>
            </div>
          )}
        </div>
        {isAllIn && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
            ALL IN
          </div>
        )}
      </div>

      {/* Name + Position */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-white truncate max-w-[80px]">{player.name}</span>
        <Badge label={player.position} variant="position" />
      </div>

      {/* Chips */}
      <span className="text-xs text-emerald-200 font-medium">{player.chips.toLocaleString()} BB</span>

      {/* Hole Cards */}
      {player.holeCards && (
        <div className="flex gap-1 mt-1">
          <CardComponent card={showCards ? player.holeCards[0] : undefined} faceDown={!showCards} />
          <CardComponent card={showCards ? player.holeCards[1] : undefined} faceDown={!showCards} />
        </div>
      )}

      {/* Hand Strength */}
      {showCards && player.handStrength && (
        <HandStrengthIndicator strength={player.handStrength} />
      )}

      {/* Current Bet */}
      {player.currentBet != null && player.currentBet > 0 && (
        <BetChips amount={player.currentBet} />
      )}
    </div>
  );
};

export default PlayerSeat;