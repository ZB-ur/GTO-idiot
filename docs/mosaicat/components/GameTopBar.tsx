import React from 'react';

interface GameTopBarProps {
  handNumber: number;
  sessionProfit: number;
  onEndSession: () => void;
  onOpenSettings: () => void;
}

const formatProfit = (value: number): string => {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value}`;
};

export const GameTopBar: React.FC<GameTopBarProps> = ({
  handNumber,
  sessionProfit,
  onEndSession,
  onOpenSettings,
}) => {
  const profitColor = sessionProfit > 0
    ? 'text-emerald-400'
    : sessionProfit < 0
      ? 'text-red-400'
      : 'text-gray-400';

  return (
    <div className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-900/90 border-b border-gray-800 backdrop-blur-sm">
      {/* Left: Hand number */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Hand</span>
        <span className="text-sm font-bold text-gray-50 tabular-nums">#{handNumber}</span>
      </div>

      {/* Center: Session P/L */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Session</span>
        <span className={`text-sm font-bold tabular-nums ${profitColor}`}>
          {formatProfit(sessionProfit)} BB
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="
            p-2 rounded-lg text-gray-400
            hover:bg-gray-800 hover:text-gray-50
            transition-colors duration-150
          "
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          onClick={onEndSession}
          className="
            px-3 py-1.5 rounded-lg text-sm font-semibold
            bg-red-500/20 text-red-400 border border-red-500/30
            hover:bg-red-500/30 hover:text-red-300
            transition-colors duration-150
          "
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default GameTopBar;