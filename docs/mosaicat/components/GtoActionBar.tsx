import React from 'react';

interface GtoAction {
  action: string;
  frequency: number;
}

interface GtoActionBarProps {
  actions: GtoAction[];
  userAction?: string;
  className?: string;
}

const actionColors: Record<string, string> = {
  fold: 'bg-red-500',
  call: 'bg-emerald-500',
  raise: 'bg-amber-500',
  check: 'bg-blue-500',
  bet: 'bg-amber-400',
  'all-in': 'bg-purple-500',
};

const actionTextColors: Record<string, string> = {
  fold: 'text-red-500',
  call: 'text-emerald-500',
  raise: 'text-amber-500',
  check: 'text-blue-500',
  bet: 'text-amber-400',
  'all-in': 'text-purple-500',
};

export const GtoActionBar: React.FC<GtoActionBarProps> = ({
  actions,
  userAction,
  className = '',
}) => {
  const total = actions.reduce((sum, a) => sum + a.frequency, 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Stacked bar */}
      <div className="flex h-6 rounded-lg overflow-hidden bg-gray-800">
        {actions.map((a) => {
          const pct = total > 0 ? (a.frequency / total) * 100 : 0;
          if (pct < 1) return null;
          const color = actionColors[a.action.toLowerCase()] || 'bg-gray-500';
          const isUser = userAction?.toLowerCase() === a.action.toLowerCase();
          return (
            <div
              key={a.action}
              className={`${color} flex items-center justify-center text-xs font-semibold text-gray-950 transition-all ${isUser ? 'ring-2 ring-amber-400 ring-inset' : ''}`}
              style={{ width: `${pct}%` }}
              title={`${a.action}: ${pct.toFixed(1)}%`}
            >
              {pct >= 10 && `${pct.toFixed(0)}%`}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-3 text-xs text-gray-400">
        {actions.map((a) => {
          const pct = total > 0 ? (a.frequency / total) * 100 : 0;
          const textColor = actionTextColors[a.action.toLowerCase()] || 'text-gray-400';
          const isUser = userAction?.toLowerCase() === a.action.toLowerCase();
          return (
            <span key={a.action} className={`${textColor} ${isUser ? 'font-bold underline decoration-amber-400' : ''}`}>
              {a.action} {pct.toFixed(0)}%
            </span>
          );
        })}
      </div>
    </div>
  );
};