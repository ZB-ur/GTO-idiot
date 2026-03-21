import React from 'react';

interface FrequencyAction {
  action: string;
  frequency: number;
  ev: number;
  betSize?: string;
}

interface FrequencyBarProps {
  actions: FrequencyAction[];
  highlightAction?: string;
  showEV?: boolean;
  compact?: boolean;
}

const actionColors: Record<string, { bg: string; text: string }> = {
  fold: { bg: 'bg-blue-500', text: 'text-blue-400' },
  check: { bg: 'bg-green-500', text: 'text-green-400' },
  call: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  raise: { bg: 'bg-red-500', text: 'text-red-400' },
  all_in: { bg: 'bg-yellow-500', text: 'text-yellow-400' },
};

const actionLabels: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-in',
};

export const FrequencyBar: React.FC<FrequencyBarProps> = ({
  actions,
  highlightAction,
  showEV = false,
  compact = false,
}) => {
  const sorted = [...actions].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
      {/* Stacked bar */}
      <div className={`flex w-full overflow-hidden rounded-lg ${compact ? 'h-3' : 'h-5'}`}>
        {sorted.map((item) => {
          const color = actionColors[item.action] || actionColors.call;
          const pct = item.frequency * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={item.action}
              className={`${color.bg} ${
                highlightAction === item.action ? 'opacity-100' : highlightAction ? 'opacity-40' : 'opacity-100'
              } transition-opacity`}
              style={{ width: `${pct}%` }}
              title={`${actionLabels[item.action] || item.action}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend rows */}
      <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        {sorted.map((item) => {
          const color = actionColors[item.action] || actionColors.call;
          const pct = item.frequency * 100;
          const isHighlighted = highlightAction === item.action;
          return (
            <div
              key={item.action}
              className={`flex items-center justify-between ${
                highlightAction && !isHighlighted ? 'opacity-40' : ''
              } transition-opacity`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color.bg}`} />
                <span className="text-gray-50 font-medium">
                  {actionLabels[item.action] || item.action}
                  {item.betSize && (
                    <span className="text-gray-500 font-normal ml-1">({item.betSize})</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 tabular-nums">{pct.toFixed(1)}%</span>
                {showEV && (
                  <span
                    className={`tabular-nums font-mono ${
                      item.ev >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {item.ev >= 0 ? '+' : ''}
                    {item.ev.toFixed(2)} BB
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FrequencyBar;