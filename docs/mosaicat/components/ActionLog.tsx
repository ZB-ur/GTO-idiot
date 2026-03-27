import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface ActionLogEntry {
  seatIndex: number;
  name: string;
  action: ActionType;
  amount?: number;
}

export interface ActionLogProps {
  actions: ActionLogEntry[];
}

const ACTION_COLORS: Record<ActionType, string> = {
  fold: 'text-gray-500',
  check: 'text-gray-400',
  call: 'text-sky-400',
  bet: 'text-amber-400',
  raise: 'text-amber-400',
  all_in: 'text-red-400',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

export function ActionLog({ actions }: ActionLogProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-50 tracking-wide uppercase">
          Action Log
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {actions.map((entry, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              entry.seatIndex === 0 ? 'bg-gray-800/60' : 'bg-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  entry.seatIndex === 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {entry.seatIndex === 0 ? 'U' : `B${entry.seatIndex}`}
              </span>
              <span className="text-gray-300 font-medium">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${ACTION_COLORS[entry.action]}`}>
                {ACTION_LABELS[entry.action]}
              </span>
              {entry.amount !== undefined && (
                <span className="text-gray-400 text-xs tabular-nums">
                  {entry.amount}
                </span>
              )}
            </div>
          </div>
        ))}
        {actions.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No actions yet
          </div>
        )}
      </div>
    </div>
  );
}