import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface RangeMatrixCellProps {
  handLabel: string;
  actions: Array<{ action: ActionType; frequency: number }>;
  isHighlighted?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}

const ACTION_COLORS: Record<ActionType, string> = {
  raise: '#fbbf24',  // amber-400
  bet: '#fbbf24',    // amber-400
  call: '#38bdf8',   // sky-400
  check: '#9ca3af',  // gray-400
  fold: '#6b7280',   // gray-500
  all_in: '#f87171', // red-400
};

export function RangeMatrixCell({
  handLabel,
  actions,
  isHighlighted = false,
  onClick,
  onHover,
}: RangeMatrixCellProps) {
  // Find dominant action (highest frequency)
  const sorted = [...actions].sort((a, b) => b.frequency - a.frequency);
  const dominant = sorted[0];

  // Build gradient background for multi-action cells
  const buildBackground = (): string => {
    if (actions.length === 0) return 'transparent';
    if (actions.length === 1) {
      const opacity = Math.max(0.15, actions[0].frequency / 100);
      return `${ACTION_COLORS[actions[0].action]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
    // Multi-action: use dominant color with frequency-based opacity
    const opacity = Math.max(0.2, (dominant?.frequency ?? 0) / 100);
    return `${ACTION_COLORS[dominant.action]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={`
        relative w-full aspect-square flex items-center justify-center
        text-xs font-bold rounded-sm transition-all duration-150
        ${isHighlighted
          ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-gray-950 z-10 scale-110'
          : 'hover:ring-1 hover:ring-gray-500'
        }
      `}
      style={{ backgroundColor: buildBackground() }}
    >
      <span
        className={`
          ${isHighlighted ? 'text-gray-50' : 'text-gray-300'}
          ${dominant && dominant.frequency > 50 ? 'text-gray-50' : ''}
        `}
      >
        {handLabel}
      </span>
      {/* Frequency indicator dots at bottom */}
      {actions.length > 1 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-px">
          {sorted.slice(0, 3).map((a, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: ACTION_COLORS[a.action] }}
            />
          ))}
        </div>
      )}
    </button>
  );
}