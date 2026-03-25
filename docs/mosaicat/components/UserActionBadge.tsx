import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface ActionSummary {
  action: ActionType;
  amount?: number | null;
  displayText: string;
}

export interface UserActionBadgeProps {
  action: ActionSummary;
}

const actionColorMap: Record<ActionType, string> = {
  fold:  'bg-gray-100 text-gray-600 border-gray-200',
  check: 'bg-blue-50 text-blue-600 border-blue-200',
  call:  'bg-blue-100 text-blue-700 border-blue-200',
  bet:   'bg-orange-100 text-orange-700 border-orange-200',
  raise: 'bg-orange-100 text-orange-700 border-orange-200',
  allin: 'bg-red-100 text-red-700 border-red-200',
};

const actionIconMap: Record<ActionType, string> = {
  fold:  '✕',
  check: '✓',
  call:  '→',
  bet:   '↑',
  raise: '⬆',
  allin: '🔥',
};

export const UserActionBadge: React.FC<UserActionBadgeProps> = ({ action }) => {
  const colors = actionColorMap[action.action];
  const icon = actionIconMap[action.action];

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1
        text-sm font-medium rounded-lg border
        ${colors}
      `}
    >
      <span className="text-xs">{icon}</span>
      <span>{action.displayText}</span>
    </span>
  );
};

export default UserActionBadge;