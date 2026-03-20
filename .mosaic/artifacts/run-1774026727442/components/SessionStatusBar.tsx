import React from 'react';

interface SessionStatusBarProps {
  handCount: number;
  totalProfit: number;
  chipCount: number;
  onPause: () => void;
  onEnd: () => void;
}

const SessionStatusBar: React.FC<SessionStatusBarProps> = ({
  handCount,
  totalProfit,
  chipCount,
  onPause,
  onEnd,
}) => {
  const profitColor =
    totalProfit > 0
      ? 'text-green-400'
      : totalProfit < 0
        ? 'text-red-400'
        : 'text-gray-300';

  const profitPrefix = totalProfit > 0 ? '+' : '';

  return (
    <div className="flex items-center justify-between bg-gray-800 border-b border-gray-600 px-4 py-2">
      {/* Left: Session Stats */}
      <div className="flex items-center gap-6">
        {/* Hand Count */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
            Hands
          </span>
          <span className="text-white text-sm font-semibold tabular-nums">
            {handCount}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600" />

        {/* Total Profit */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
            Profit
          </span>
          <span className={`text-sm font-semibold tabular-nums ${profitColor}`}>
            {profitPrefix}
            {totalProfit.toFixed(1)} BB
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600" />

        {/* Chip Count */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
            Chips
          </span>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-sm">●</span>
            <span className="text-white text-sm font-semibold tabular-nums">
              {chipCount.toFixed(1)} BB
            </span>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm5 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z"
              clipRule="evenodd"
            />
          </svg>
          Pause
        </button>
        <button
          onClick={onEnd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4z"
              clipRule="evenodd"
            />
          </svg>
          End
        </button>
      </div>
    </div>
  );
};

export default SessionStatusBar;