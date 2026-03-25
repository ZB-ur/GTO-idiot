import React from 'react';

/** Table positions at a 6-max cash game */
export type Position = 'UTG' | 'UTG1' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface PositionBadgeProps {
  position: Position;
  showFullName?: boolean;
  size?: 'sm' | 'md';
}

const POSITION_CONFIG: Record<Position, { color: string; bg: string; border: string; fullName: string }> = {
  UTG:  { color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    fullName: '枪口位' },
  UTG1: { color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  fullName: '枪口+1' },
  MP:   { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   fullName: '中位' },
  CO:   { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', fullName: '关煞位' },
  BTN:  { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    fullName: '按钮位' },
  SB:   { color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200',  fullName: '小盲位' },
  BB:   { color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200',  fullName: '大盲位' },
};

/**
 * PositionBadge — displays a color-coded table position label.
 *
 * Used inside SeatWidget and review screens to identify player positions
 * with distinct colors for quick visual scanning.
 *
 * @covers F-010, F-012
 */
export const PositionBadge: React.FC<PositionBadgeProps> = ({
  position,
  showFullName = false,
  size = 'sm',
}) => {
  const config = POSITION_CONFIG[position];

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-lg border
        ${config.bg} ${config.color} ${config.border} ${sizeClasses}
      `}
      title={`${position} - ${config.fullName}`}
    >
      {position}
      {showFullName && (
        <span className="font-normal opacity-80">
          {config.fullName}
        </span>
      )}
    </span>
  );
};

export default PositionBadge;