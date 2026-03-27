import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface RangeMatrixTooltipProps {
  handLabel: string;
  actions: Array<{ action: ActionType; frequency: number }>;
  position: { x: number; y: number };
  pinned?: boolean;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

const ACTION_BAR_COLORS: Record<ActionType, string> = {
  raise: 'bg-amber-400',
  bet: 'bg-amber-400',
  call: 'bg-sky-400',
  check: 'bg-gray-400',
  fold: 'bg-gray-500',
  all_in: 'bg-red-400',
};

const ACTION_TEXT_COLORS: Record<ActionType, string> = {
  raise: 'text-amber-400',
  bet: 'text-amber-400',
  call: 'text-sky-400',
  check: 'text-gray-400',
  fold: 'text-gray-500',
  all_in: 'text-red-400',
};

export function RangeMatrixTooltip({
  handLabel,
  actions,
  position,
  pinned = false,
}: RangeMatrixTooltipProps) {
  const sorted = [...actions].sort((a, b) => b.frequency - a.frequency);
  const dominant = sorted[0];

  return (
    <div
      className={`
        absolute z-50 min-w-[180px]
        bg-gray-800 border rounded-xl p-4 shadow-xl
        ${pinned ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-gray-700'}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
    >
      {/* Arrow */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          border-t-[6px] ${pinned ? 'border-t-emerald-500/50' : 'border-t-gray-700'}
        `}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gray-50">{handLabel}</span>
        {pinned && (
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
            Pinned
          </span>
        )}
      </div>

      {/* Action breakdown */}
      <div className="space-y-2">
        {sorted.map((entry) => (
          <div key={entry.action} className="flex items-center gap-2.5">
            <span className={`text-xs font-medium w-12 shrink-0 ${ACTION_TEXT_COLORS[entry.action]}`}>
              {ACTION_LABELS[entry.action]}
            </span>
            <div className="flex-1 h-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                className={`h-full rounded-md ${ACTION_BAR_COLORS[entry.action]} ${
                  entry.action === dominant?.action ? 'opacity-100' : 'opacity-50'
                }`}
                style={{ width: `${entry.frequency}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums font-medium">
              {entry.frequency}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}