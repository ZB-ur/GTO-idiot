import React from 'react';

type GtoRating = 'green' | 'yellow' | 'red' | 'gray';

interface CardData {
  rank: string;
  suit: string;
}

interface HandHistoryCardProps {
  handId: string;
  handNumber: number;
  timestamp: string;
  userPosition: string;
  userHoleCards: CardData[];
  netResult: number;
  gtoConformance: number;
  gtoRating: GtoRating;
  isComplete: boolean;
  onClick: (handId: string) => void;
  className?: string;
}

const suitSymbols: Record<string, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-100',
  spades: 'text-gray-100',
};

const gtoConfig: Record<GtoRating, { bg: string; text: string; label: string; border: string }> = {
  green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'GTO', border: 'border-emerald-500/30' },
  yellow: { bg: 'bg-amber-400/20', text: 'text-amber-400', label: 'OK', border: 'border-amber-400/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Leak', border: 'border-red-500/30' },
  gray: { bg: 'bg-gray-600/20', text: 'text-gray-400', label: 'N/A', border: 'border-gray-600/30' },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const HandHistoryCard: React.FC<HandHistoryCardProps> = ({
  handId,
  handNumber,
  timestamp,
  userPosition,
  userHoleCards,
  netResult,
  gtoConformance,
  gtoRating,
  isComplete,
  onClick,
  className = '',
}) => {
  const gto = gtoConfig[gtoRating];
  const resultColor = netResult >= 0 ? 'text-emerald-400' : 'text-red-400';
  const resultSign = netResult >= 0 ? '+' : '';

  return (
    <div
      onClick={() => onClick(handId)}
      className={`
        flex items-center justify-between p-4
        bg-[#1e293b] border border-gray-700 rounded-xl
        hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5
        cursor-pointer transition-all duration-150
        ${!isComplete ? 'opacity-60' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Hand # + timestamp */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-100">#{handNumber}</span>
          <span className="text-[10px] text-gray-500">{formatTimestamp(timestamp)}</span>
        </div>

        {/* Position badge */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {userPosition}
        </span>

        {/* Hole cards */}
        <div className="flex gap-1">
          {userHoleCards.map((card, i) => (
            <div
              key={i}
              className="w-9 h-12 bg-white rounded-md border border-gray-300 flex flex-col items-center justify-center shadow-sm"
            >
              <span className={`text-xs font-bold ${suitColors[card.suit] || 'text-gray-900'}`}>
                {card.rank}
              </span>
              <span className={`text-sm leading-none ${suitColors[card.suit] || 'text-gray-900'}`}>
                {suitSymbols[card.suit] || '?'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* GTO badge */}
        <div className="flex flex-col items-center">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${gto.bg} ${gto.text} border ${gto.border}`}>
            {gto.label}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">{gtoConformance.toFixed(0)}%</span>
        </div>

        {/* Net result */}
        <span className={`text-sm font-bold tabular-nums ${resultColor}`}>
          {resultSign}{netResult.toFixed(1)} BB
        </span>

        {/* Chevron */}
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default HandHistoryCard;