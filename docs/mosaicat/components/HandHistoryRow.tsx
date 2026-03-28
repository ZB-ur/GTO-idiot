import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface HandHistorySummary {
  handId: string;
  timestamp: number;
  userPosition: string;
  userPnl: number;
  isKeyHand: boolean;
  keyHandReason?: 'big_pnl' | 'gto_deviation' | 'manual' | null;
  summary: string;
  lastStreetReached: string;
  userHoleCards?: Card[];
}

interface HandHistoryRowProps {
  hand: HandHistorySummary;
  onSelect: (handId: string) => void;
  onToggleMark: (handId: string) => void;
}

const suitSymbols: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-500',
  d: 'text-blue-400',
  c: 'text-emerald-500',
};

function formatCards(cards?: Card[]): React.ReactNode {
  if (!cards || cards.length === 0) return null;
  return (
    <span className="inline-flex gap-0.5 font-mono text-sm">
      {cards.map((c, i) => (
        <span key={i} className={suitColors[c.suit]}>
          {c.rank}{suitSymbols[c.suit]}
        </span>
      ))}
    </span>
  );
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const HandHistoryRow: React.FC<HandHistoryRowProps> = ({ hand, onSelect, onToggleMark }) => {
  const pnlColor = hand.userPnl > 0
    ? 'text-emerald-500'
    : hand.userPnl < 0
      ? 'text-red-500'
      : 'text-gray-400';

  const pnlText = hand.userPnl > 0
    ? `+${hand.userPnl.toFixed(1)}`
    : hand.userPnl.toFixed(1);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl cursor-pointer transition-colors"
      onClick={() => onSelect(hand.handId)}
    >
      {/* Star / Key Hand Toggle */}
      <button
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMark(hand.handId);
        }}
        aria-label={hand.isKeyHand ? 'Unmark key hand' : 'Mark as key hand'}
      >
        <svg
          className={`w-5 h-5 ${hand.isKeyHand ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          fill={hand.isKeyHand ? 'currentColor' : 'none'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      {/* Time */}
      <span className="flex-shrink-0 text-sm text-gray-500 w-14 font-mono">
        {formatTime(hand.timestamp)}
      </span>

      {/* Position Badge */}
      <span className="flex-shrink-0 w-10 text-center text-xs font-bold bg-gray-800 text-amber-400 border border-gray-700 rounded-lg py-0.5">
        {hand.userPosition}
      </span>

      {/* Hole Cards */}
      <span className="flex-shrink-0 w-14">
        {formatCards(hand.userHoleCards)}
      </span>

      {/* Summary */}
      <span className="flex-1 text-sm text-gray-300 truncate">
        {hand.summary}
      </span>

      {/* Street reached */}
      <span className="flex-shrink-0 text-xs text-gray-500 capitalize">
        {hand.lastStreetReached}
      </span>

      {/* PnL */}
      <span className={`flex-shrink-0 w-16 text-right text-sm font-semibold font-mono ${pnlColor}`}>
        {pnlText} BB
      </span>
    </div>
  );
};

export default HandHistoryRow;