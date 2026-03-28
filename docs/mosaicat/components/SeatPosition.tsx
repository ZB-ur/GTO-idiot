import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface Player {
  seatIndex: number;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  name: string;
  chipCount: number;
  status: 'active' | 'folded' | 'all-in' | 'sitting-out';
  isUser: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
  lastActionAmount?: number | null;
  isDealer?: boolean;
}

interface SeatPositionProps {
  player: Player;
  isActive?: boolean;
  seatAngle?: number;
}

const suitSymbol: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColor: Record<string, string> = {
  s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900',
};

const statusLabel: Record<string, string> = {
  folded: '已弃牌',
  'all-in': 'ALL-IN',
  'sitting-out': '离座',
};

const actionLabel: Record<string, string> = {
  fold: '弃牌', check: '过牌', call: '跟注', bet: '下注',
  raise: '加注', 'all-in': 'All-in', 'post-blind': '盲注',
};

const formatChips = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return n.toString();
};

export const SeatPosition: React.FC<SeatPositionProps> = ({
  player,
  isActive = false,
}) => {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'all-in';

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${isFolded ? 'opacity-50' : ''}`}
    >
      {/* Dealer button */}
      {player.isDealer && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10">
          D
        </div>
      )}

      {/* Avatar / seat area */}
      <div
        className={`relative w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-300'
            : 'border-gray-200 bg-white shadow-sm'
        } ${isAllIn ? 'border-amber-400 bg-amber-50' : ''}`}
      >
        {/* Position badge */}
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded mb-0.5">
          {player.position}
        </span>
        {/* Name */}
        <span className={`text-xs font-semibold truncate max-w-[72px] ${player.isUser ? 'text-blue-700' : 'text-gray-900'}`}>
          {player.name}
        </span>
        {/* Chips */}
        <span className="text-[10px] text-gray-500">
          {formatChips(player.chipCount)}
        </span>
      </div>

      {/* Hole cards */}
      {player.holeCards && player.holeCards.length === 2 && (
        <div className="flex gap-0.5">
          {player.holeCards.map((card, i) => (
            <div
              key={i}
              className="w-8 h-11 bg-white border border-gray-200 rounded-md flex flex-col items-center justify-center shadow-sm"
            >
              <span className={`text-xs font-bold ${suitColor[card.suit]}`}>
                {card.rank}
              </span>
              <span className={`text-[10px] ${suitColor[card.suit]}`}>
                {suitSymbol[card.suit]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Face-down cards */}
      {!player.holeCards && !isFolded && player.status !== 'sitting-out' && (
        <div className="flex gap-0.5">
          <div className="w-8 h-11 bg-blue-600 border border-blue-700 rounded-md shadow-sm" />
          <div className="w-8 h-11 bg-blue-600 border border-blue-700 rounded-md shadow-sm" />
        </div>
      )}

      {/* Action badge */}
      {player.lastAction && !isFolded && (
        <div className="px-2 py-0.5 bg-gray-900/80 text-white text-[10px] font-medium rounded-full">
          {actionLabel[player.lastAction] ?? player.lastAction}
          {player.lastActionAmount != null && player.lastActionAmount > 0 && (
            <span> {formatChips(player.lastActionAmount)}</span>
          )}
        </div>
      )}

      {/* Status overlay for folded/all-in/sitting-out */}
      {(isFolded || isAllIn || player.status === 'sitting-out') && (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isAllIn
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {statusLabel[player.status]}
        </span>
      )}

      {/* Current bet */}
      {player.currentBet > 0 && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {formatChips(player.currentBet)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SeatPosition;