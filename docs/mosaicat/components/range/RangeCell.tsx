import React from 'react';

interface ActionFrequency {
  type: string;
  frequency: number;
}

interface RangeCellProps {
  hand: string;
  handLabel: string;
  comboType: string;
  actions: ActionFrequency[];
  primaryAction: string;
  isHighlighted?: boolean;
  onHover?: (hand: string) => void;
  onClick?: (hand: string) => void;
}

const actionColorMap: Record<string, string> = {
  raise: 'bg-red-500',
  call: 'bg-emerald-500',
  fold: 'bg-blue-500',
  '3bet': 'bg-amber-500',
  allin: 'bg-purple-600',
  check: 'bg-sky-400',
};

const actionBgMap: Record<string, string> = {
  raise: 'bg-red-500/90',
  call: 'bg-emerald-500/90',
  fold: 'bg-blue-500/20',
  '3bet': 'bg-amber-500/90',
  allin: 'bg-purple-600/90',
  check: 'bg-sky-400/40',
};

const comboTypeLabel: Record<string, string> = {
  pair: '',
  suited: 's',
  offsuit: 'o',
};

export const RangeCell: React.FC<RangeCellProps> = ({
  hand,
  handLabel,
  comboType,
  actions,
  primaryAction,
  isHighlighted = false,
  onHover,
  onClick,
}) => {
  const isMixed = actions.length > 1 && actions[0].frequency < 1;
  const bgClass = actionBgMap[primaryAction] ?? 'bg-gray-200';
  const isFold = primaryAction === 'fold';

  return (
    <button
      type="button"
      className={[
        'relative w-full aspect-square flex flex-col items-center justify-center',
        'text-[10px] leading-tight font-medium transition-all duration-100',
        'rounded-sm overflow-hidden',
        bgClass,
        isFold ? 'text-gray-500' : 'text-white',
        isHighlighted ? 'ring-2 ring-amber-400 ring-offset-1 z-10' : '',
        'hover:brightness-110 cursor-pointer',
      ].join(' ')}
      onMouseEnter={() => onHover?.(hand)}
      onMouseLeave={() => onHover?.('')}
      onClick={() => onClick?.(hand)}
      aria-label={`${handLabel} – ${primaryAction}`}
    >
      {/* Mixed-action gradient bar at bottom */}
      {isMixed && (
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          {actions.map((a, i) => (
            <div
              key={i}
              className={actionColorMap[a.type] ?? 'bg-gray-400'}
              style={{ width: `${a.frequency * 100}%` }}
            />
          ))}
        </div>
      )}
      <span className="relative z-[1]">{handLabel}</span>
    </button>
  );
};

export default RangeCell;