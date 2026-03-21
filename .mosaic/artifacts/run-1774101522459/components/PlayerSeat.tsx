import React from 'react';
import PlayingCard, { Rank, Suit } from './PlayingCard';

type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';
type BotStyle = 'TAG' | 'LAG' | 'TP' | 'LP' | 'GTO';

interface PlayerSeatProps {
  seat: number;
  name: string;
  isHuman: boolean;
  botStyle?: BotStyle;
  stackBB: number;
  position: Position;
  holeCards?: Array<{ rank: Rank; suit: Suit }>;
  isActive: boolean;
  isActing?: boolean;
  isDealer?: boolean;
  lastAction?: string;
  currentBet?: number;
  className?: string;
}

const botStyleColors: Record<BotStyle, string> = {
  TAG: 'bg-blue-50 text-blue-700 border-blue-200',
  LAG: 'bg-red-50 text-red-700 border-red-200',
  TP: 'bg-gray-50 text-gray-600 border-gray-200',
  LP: 'bg-amber-50 text-amber-700 border-amber-200',
  GTO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const positionColors: Record<Position, string> = {
  BTN: 'bg-yellow-100 text-yellow-800',
  SB: 'bg-purple-100 text-purple-800',
  BB: 'bg-indigo-100 text-indigo-800',
  UTG: 'bg-red-100 text-red-800',
  MP: 'bg-cyan-100 text-cyan-800',
  CO: 'bg-emerald-100 text-emerald-800',
};

function formatStack(bb: number): string {
  if (bb >= 1000) return `${(bb / 1000).toFixed(1)}K BB`;
  return `${bb.toFixed(1)} BB`;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  seat,
  name,
  isHuman,
  botStyle,
  stackBB,
  position,
  holeCards,
  isActive,
  isActing = false,
  isDealer = false,
  lastAction,
  currentBet,
  className = '',
}) => {
  return (
    <div
      className={`
        relative flex flex-col items-center gap-1.5 p-3
        rounded-xl border-2 shadow-sm bg-white
        transition-all duration-200
        ${isActing ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100' : 'border-gray-200'}
        ${!isActive ? 'opacity-50' : ''}
        ${className}
      `}
      style={{ minWidth: '120px' }}
    >
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center text-[10px] font-bold text-gray-900">
          D
        </div>
      )}

      {/* Position badge */}
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${positionColors[position]}`}>
        {position}
      </span>

      {/* Name + bot style */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">{name}</span>
        {!isHuman && botStyle && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${botStyleColors[botStyle]}`}>
            {botStyle}
          </span>
        )}
      </div>

      {/* Hole cards */}
      <div className="flex gap-1">
        {holeCards && holeCards.length === 2 ? (
          holeCards.map((card, i) => (
            <PlayingCard key={i} rank={card.rank} suit={card.suit} size="sm" />
          ))
        ) : (
          <>
            <PlayingCard faceDown size="sm" />
            <PlayingCard faceDown size="sm" />
          </>
        )}
      </div>

      {/* Stack */}
      <span className="text-xs font-semibold text-gray-600">{formatStack(stackBB)}</span>

      {/* Last action */}
      {lastAction && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
          {lastAction}
        </span>
      )}

      {/* Current bet */}
      {currentBet !== undefined && currentBet > 0 && (
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
          Bet: {currentBet} BB
        </span>
      )}
    </div>
  );
};

export default PlayerSeat;