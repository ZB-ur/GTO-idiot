import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface HandHistoryRowProps {
  handNumber: number;
  holeCards: Card[];
  result: number;
  timestamp: string;
  onClick: () => void;
}

const suitSymbols: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<string, string> = { s: 'text-gray-900', h: 'text-red-500', d: 'text-blue-500', c: 'text-green-600' };

export const HandHistoryRow: React.FC<HandHistoryRowProps> = ({
  handNumber,
  holeCards,
  result,
  timestamp,
  onClick,
}) => {
  const isWin = result > 0;
  const isLoss = result < 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Hand Number */}
      <div className="text-sm text-gray-400 font-mono w-10 text-right">#{handNumber}</div>

      {/* Mini cards */}
      <div className="flex gap-0.5">
        {holeCards.map((card, i) => (
          <div key={i} className="flex items-center text-sm font-bold">
            <span className={suitColors[card.suit]}>{card.rank}{suitSymbols[card.suit]}</span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Result */}
      <div
        className={`text-sm font-bold font-mono ${
          isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-gray-400'
        }`}
      >
        {isWin ? '+' : ''}{result} BB
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-400 w-16 text-right">{timestamp}</div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default HandHistoryRow;