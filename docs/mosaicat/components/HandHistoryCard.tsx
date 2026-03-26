import React from 'react';

export interface HandHistoryListItem {
  handId: string;
  timestamp: string;
  userPosition: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  result: 'win' | 'lose' | 'tie';
  profitLoss: number;
  handSummary: string;
  sessionId?: string;
}

export interface HandHistoryCardProps {
  hand: HandHistoryListItem;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (handId: string, selected: boolean) => void;
  onClick: (handId: string) => void;
}

const resultConfig: Record<string, { label: string; bg: string; text: string }> = {
  win: { label: '胜', bg: 'bg-green-50', text: 'text-green-600' },
  lose: { label: '负', bg: 'bg-red-50', text: 'text-red-600' },
  tie: { label: '平', bg: 'bg-amber-50', text: 'text-amber-600' },
};

const positionColors: Record<string, string> = {
  BTN: 'bg-blue-100 text-blue-700',
  CO: 'bg-indigo-100 text-indigo-700',
  MP: 'bg-violet-100 text-violet-700',
  UTG: 'bg-purple-100 text-purple-700',
  SB: 'bg-cyan-100 text-cyan-700',
  BB: 'bg-teal-100 text-teal-700',
};

function formatProfitLoss(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export const HandHistoryCard: React.FC<HandHistoryCardProps> = ({
  hand,
  selectionMode = false,
  selected = false,
  onSelect,
  onClick,
}) => {
  const result = resultConfig[hand.result] ?? resultConfig.lose;
  const posClass = positionColors[hand.userPosition] ?? 'bg-gray-100 text-gray-700';
  const plColor =
    hand.profitLoss > 0
      ? 'text-green-500'
      : hand.profitLoss < 0
        ? 'text-red-500'
        : 'text-gray-600';

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect?.(hand.handId, !selected);
    } else {
      onClick(hand.handId);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(hand.handId, !selected);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`
        group relative flex items-center gap-3 rounded-xl border bg-white p-4
        transition-all duration-150 cursor-pointer
        ${selected ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/20' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      {/* Checkbox area */}
      {selectionMode && (
        <div
          onClick={handleCheckboxClick}
          className="flex-shrink-0 flex items-center justify-center"
        >
          <div
            className={`
              w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
              ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-gray-400'}
            `}
          >
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Result badge */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${result.bg} ${result.text}`}
      >
        {result.label}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {hand.handSummary}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${posClass}`}
          >
            {hand.userPosition}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-gray-400">
          {formatTimestamp(hand.timestamp)}
        </div>
      </div>

      {/* Profit/Loss */}
      <div className={`flex-shrink-0 text-right font-mono text-sm font-semibold ${plColor}`}>
        {formatProfitLoss(hand.profitLoss)}
      </div>

      {/* Chevron (non-selection mode) */}
      {!selectionMode && (
        <svg
          className="flex-shrink-0 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
};

export default HandHistoryCard;