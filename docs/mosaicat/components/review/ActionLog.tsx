import React from 'react';

export interface ActionLogAction {
  seatIndex: number;
  name: string;
  position: string;
  type: string;
  amount?: number;
}

export interface ActionLogProps {
  actions: ActionLogAction[];
}

const actionColorMap: Record<string, { bg: string; text: string; label: string }> = {
  fold: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Fold' },
  check: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Check' },
  call: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Call' },
  raise: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Raise' },
  allin: { bg: 'bg-red-50', text: 'text-red-700', label: 'All-In' },
};

function getActionStyle(type: string) {
  return actionColorMap[type] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: type };
}

function formatAction(type: string, amount?: number): string {
  const style = getActionStyle(type);
  if (amount != null && (type === 'raise' || type === 'call' || type === 'allin')) {
    return `${style.label} ${amount}`;
  }
  return style.label;
}

export const ActionLog: React.FC<ActionLogProps> = ({ actions }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Action Log</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            No actions yet
          </div>
        ) : (
          actions.map((action, index) => {
            const style = getActionStyle(action.type);
            return (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <span className="flex-shrink-0 w-5 text-xs text-gray-400 text-right">
                  {index + 1}
                </span>
                <span className="flex-shrink-0 w-8 text-xs font-medium text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 text-center">
                  {action.position}
                </span>
                <span className="text-sm text-gray-900 truncate min-w-0 flex-1">
                  {action.name}
                </span>
                <span
                  className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-lg ${style.bg} ${style.text}`}
                >
                  {formatAction(action.type, action.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionLog;