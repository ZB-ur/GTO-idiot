import React from 'react';

export interface FrequencyItem {
  action: string;
  frequency: number;
}

export interface FrequencyBarProps {
  frequencies: FrequencyItem[];
  highlightedAction?: string;
  className?: string;
}

const ACTION_COLORS: Record<string, string> = {
  fold: 'bg-gray-500',
  check: 'bg-blue-400',
  call: 'bg-emerald-400',
  bet: 'bg-amber-400',
  raise: 'bg-red-400',
  'all-in': 'bg-red-500',
};

const DEFAULT_COLOR = 'bg-gray-400';

export const FrequencyBar: React.FC<FrequencyBarProps> = ({
  frequencies,
  highlightedAction,
  className = '',
}) => {
  const total = frequencies.reduce((sum, f) => sum + f.frequency, 0);

  return (
    <div className={`w-full ${className}`}>
      {/* Bar */}
      <div className="flex h-6 rounded-lg overflow-hidden w-full">
        {frequencies.map((item) => {
          const pct = total > 0 ? (item.frequency / total) * 100 : 0;
          if (pct === 0) return null;
          const color = ACTION_COLORS[item.action.toLowerCase()] ?? DEFAULT_COLOR;
          const isHighlighted = highlightedAction === item.action;
          const opacity = highlightedAction && !isHighlighted ? 'opacity-40' : 'opacity-100';

          return (
            <div
              key={item.action}
              className={`${color} ${opacity} flex items-center justify-center transition-opacity duration-200`}
              style={{ width: `${pct}%` }}
              title={`${item.action}: ${pct.toFixed(1)}%`}
            >
              {pct >= 12 && (
                <span className="text-xs font-medium text-gray-950 truncate px-1">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {frequencies.map((item) => {
          const color = ACTION_COLORS[item.action.toLowerCase()] ?? DEFAULT_COLOR;
          const pct = total > 0 ? (item.frequency / total) * 100 : 0;
          const isHighlighted = highlightedAction === item.action;
          const opacity = highlightedAction && !isHighlighted ? 'opacity-40' : '';

          return (
            <span key={item.action} className={`flex items-center gap-1.5 text-xs text-gray-400 ${opacity}`}>
              <span className={`w-2 h-2 rounded-sm ${color}`} />
              {item.action} {pct.toFixed(0)}%
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default FrequencyBar;