'use client';

import type { ActionType } from '@/engine/types';

interface GTORecommendation {
  action: ActionType;
  frequency: number;
  betSize?: string;
  betAmount?: number;
  ev?: number;
}

interface GTOFrequencyBarProps {
  recommendations: GTORecommendation[];
  highlightedAction?: ActionType;
}

const ACTION_COLORS: Record<ActionType, string> = {
  fold: '#6b7280',
  check: '#22c55e',
  call: '#3b82f6',
  raise: '#eab308',
  all_in: '#ef4444',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All In',
};

export default function GTOFrequencyBar({
  recommendations,
  highlightedAction,
}: GTOFrequencyBarProps) {
  const sorted = [...recommendations].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="w-full h-6 rounded-lg overflow-hidden flex">
        {sorted.map((rec) => {
          if (rec.frequency <= 0) return null;
          const isHighlighted = rec.action === highlightedAction;
          return (
            <div
              key={rec.action}
              className={`relative transition-all ${isHighlighted ? 'ring-2 ring-white ring-inset' : ''}`}
              style={{
                width: `${rec.frequency * 100}%`,
                backgroundColor: ACTION_COLORS[rec.action],
                opacity: highlightedAction && !isHighlighted ? 0.4 : 1,
              }}
              title={`${ACTION_LABELS[rec.action]}: ${(rec.frequency * 100).toFixed(0)}%`}
            >
              {rec.frequency >= 0.1 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  {(rec.frequency * 100).toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {sorted.map((rec) => {
          if (rec.frequency <= 0) return null;
          const isHighlighted = rec.action === highlightedAction;
          return (
            <div
              key={rec.action}
              className={`flex items-center gap-1 ${isHighlighted ? 'opacity-100' : highlightedAction ? 'opacity-50' : 'opacity-100'}`}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: ACTION_COLORS[rec.action] }}
              />
              <span className="text-gray-300 text-xs">
                {ACTION_LABELS[rec.action]} {(rec.frequency * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}