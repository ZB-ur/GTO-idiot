import React from 'react';

interface ActionFrequency {
  type: string;
  frequency: number;
}

interface HandTooltipProps {
  hand: string;
  handLabel: string;
  actions: ActionFrequency[];
  position?: { x: number; y: number };
}

const actionDisplayMap: Record<string, { label: string; color: string }> = {
  raise: { label: 'Raise', color: 'bg-red-500' },
  call: { label: 'Call', color: 'bg-emerald-500' },
  fold: { label: 'Fold', color: 'bg-blue-500' },
  '3bet': { label: '3-Bet', color: 'bg-amber-500' },
  allin: { label: 'All-in', color: 'bg-purple-600' },
  check: { label: 'Check', color: 'bg-sky-400' },
};

export const HandTooltip: React.FC<HandTooltipProps> = ({
  hand,
  handLabel,
  actions,
  position,
}) => {
  const style: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, transform: 'translate(-50%, -100%) translateY(-8px)' }
    : {};

  return (
    <div
      className="z-50 bg-gray-900 text-white rounded-lg shadow-md px-3 py-2 min-w-[140px] pointer-events-none"
      style={style}
      role="tooltip"
    >
      <p className="text-xs font-bold mb-1.5">{handLabel}</p>

      {/* Frequency bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-2">
        {actions.map((a, i) => {
          const display = actionDisplayMap[a.type];
          return (
            <div
              key={i}
              className={display?.color ?? 'bg-gray-400'}
              style={{ width: `${a.frequency * 100}%` }}
            />
          );
        })}
      </div>

      {/* Action list */}
      <div className="space-y-0.5">
        {actions.map((a, i) => {
          const display = actionDisplayMap[a.type] ?? { label: a.type, color: 'bg-gray-400' };
          return (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${display.color}`} />
                {display.label}
              </span>
              <span className="font-mono text-gray-300">
                {Math.round(a.frequency * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
    </div>
  );
};

export default HandTooltip;