import React from 'react';
import PlayingCard, { Rank, Suit } from './PlayingCard';

interface HandHistoryItemProps {
  id: string;
  timestamp: string;
  userPosition: string;
  userHoleCards: Array<{ rank: Rank; suit: Suit }>;
  result: 'won' | 'lost' | 'folded';
  profitLossBB: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const resultConfig: Record<string, { bg: string; text: string; label: string }> = {
  won: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Won' },
  lost: { bg: 'bg-red-50', text: 'text-red-700', label: 'Lost' },
  folded: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Folded' },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const HandHistoryItem: React.FC<HandHistoryItemProps> = ({
  id,
  timestamp,
  userPosition,
  userHoleCards,
  result,
  profitLossBB,
  onSelect,
  onDelete,
  className = '',
}) => {
  const rc = resultConfig[result];
  const plColor = profitLossBB >= 0 ? 'text-emerald-600' : 'text-red-500';
  const plSign = profitLossBB >= 0 ? '+' : '';

  return (
    <div
      onClick={() => onSelect(id)}
      className={`
        flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm
        hover:border-blue-300 hover:shadow-md cursor-pointer transition-all
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Time */}
        <span className="text-xs text-gray-400 font-medium w-12">{formatTimestamp(timestamp)}</span>

        {/* Position badge */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
          {userPosition}
        </span>

        {/* Hole cards */}
        <div className="flex gap-1">
          {userHoleCards.map((card, i) => (
            <PlayingCard key={i} rank={card.rank} suit={card.suit} size="sm" />
          ))}
        </div>

        {/* Result badge */}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${rc.bg} ${rc.text}`}>
          {rc.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* P/L */}
        <span className={`text-sm font-bold ${plColor}`}>
          {plSign}{profitLossBB.toFixed(1)} BB
        </span>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Delete hand"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HandHistoryItem;