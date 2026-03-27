import React from 'react';

export interface UserChoiceAction {
  actionType: string;
  amount?: number;
  label: string;
}

export interface UserChoiceColumnProps {
  action: UserChoiceAction;
}

const actionColorMap: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-emerald-500',
  call: 'text-sky-400',
  bet: 'text-amber-500',
  raise: 'text-amber-500',
  'all-in': 'text-red-500',
};

export const UserChoiceColumn: React.FC<UserChoiceColumnProps> = ({
  action,
}) => {
  const colorClass = actionColorMap[action.actionType] ?? 'text-gray-400';

  return (
    <div className="flex-1 flex flex-col items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        你的选择
      </div>

      {/* Action display */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xl font-bold ${colorClass}`}>
          {action.label}
        </span>
        {action.amount != null && (
          <span className="text-sm text-gray-400 font-mono">
            {action.amount} BB
          </span>
        )}
      </div>
    </div>
  );
};