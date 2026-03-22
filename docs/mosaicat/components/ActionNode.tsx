import React from 'react';
import { DeviationBadge } from './DeviationBadge';

interface ActionNodeProps {
  playerName: string;
  position: string;
  action: string;
  amount?: number;
  isPlayer?: boolean;
  deviation?: 'match' | 'minor' | 'major';
  onClick?: () => void;
}

const actionColorMap: Record<string, string> = {
  fold: 'text-gray-400',
  check: 'text-gray-600',
  call: 'text-blue-600',
  raise: 'text-amber-600',
  all_in: 'text-red-500',
};

export const ActionNode: React.FC<ActionNodeProps> = ({
  playerName,
  position,
  action,
  amount,
  isPlayer = false,
  deviation,
  onClick,
}) => {
  const actionLabel = action === 'all_in' ? 'ALL-IN' : action.toUpperCase();
  const colorClass = actionColorMap[action] ?? 'text-gray-600';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left ${
        isPlayer
          ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
          : 'bg-white border border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase">
            {position}
          </span>
          <span
            className={`text-sm font-semibold truncate ${
              isPlayer ? 'text-blue-700' : 'text-gray-900'
            }`}
          >
            {playerName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-sm font-bold ${colorClass}`}>
            {actionLabel}
          </span>
          {amount !== undefined && (
            <span className="text-sm text-gray-500">
              ${amount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {deviation && <DeviationBadge deviation={deviation} />}
    </button>
  );
};