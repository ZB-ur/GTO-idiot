import React from 'react';

export interface HandHistoryItem {
  id: string;
  date: string;
  handNumber: number;
  profitLoss: number;
  position: string;
  holeCards?: string;
  result: string;
  keyDecisions: number;
}

export interface HistoryListItemProps {
  hand: HandHistoryItem;
  onClick: (handId: string) => void;
}

const HistoryListItem: React.FC<HistoryListItemProps> = ({ hand, onClick }) => {
  const isProfit = hand.profitLoss >= 0;

  return (
    <button
      onClick={() => onClick(hand.id)}
      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3
        hover:border-gray-600 hover:bg-gray-750 transition-colors
        flex items-center gap-3 text-left group"
    >
      {/* Hand number */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <span className="text-gray-500 text-[10px] uppercase">Hand</span>
        <span className="text-white text-sm font-bold tabular-nums">#{hand.handNumber}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-700" />

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate">{hand.result}</span>
          {hand.holeCards && (
            <span className="text-gray-400 text-xs bg-gray-700 px-1.5 py-0.5 rounded font-mono">
              {hand.holeCards}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{hand.date}</span>
          <span>·</span>
          <span>{hand.position}</span>
          <span>·</span>
          <span>{hand.keyDecisions} 决策</span>
        </div>
      </div>

      {/* P/L */}
      <div className="shrink-0 text-right">
        <span
          className={`text-sm font-bold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {isProfit ? '+' : ''}{hand.profitLoss.toFixed(1)} BB
        </span>
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default HistoryListItem;