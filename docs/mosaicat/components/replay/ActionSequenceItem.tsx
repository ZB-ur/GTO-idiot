import React from 'react';

export interface StreetAction {
  player: string;
  actionType: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  position?: string;
}

export interface ActionSequenceItemProps {
  action: StreetAction;
  isUserAction: boolean;
  isSelected: boolean;
  onClick?: () => void;
}

const actionColorMap: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-emerald-500',
  call: 'text-sky-400',
  bet: 'text-amber-500',
  raise: 'text-amber-500',
  'all-in': 'text-red-500',
};

const actionLabelMap: Record<string, string> = {
  fold: '弃牌',
  check: '过牌',
  call: '跟注',
  bet: '下注',
  raise: '加注',
  'all-in': 'All-In',
};

export const ActionSequenceItem: React.FC<ActionSequenceItemProps> = ({
  action,
  isUserAction,
  isSelected,
  onClick,
}) => {
  const colorClass = actionColorMap[action.actionType] ?? 'text-gray-400';
  const label = actionLabelMap[action.actionType] ?? action.actionType;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-3 py-2 rounded-lg
        text-sm transition-all duration-150
        ${isSelected ? 'bg-gray-800 ring-1 ring-amber-500/60' : 'bg-gray-900 hover:bg-gray-800'}
        ${isUserAction ? 'border-l-2 border-amber-500' : 'border-l-2 border-transparent'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div class="flex items-center gap-2">
        <span className="text-gray-400 text-xs font-mono w-8">
          {action.position ?? ''}
        </span>
        <span className="text-gray-50 font-medium">
          {action.player}
        </span>
        {isUserAction && (
          <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-medium">
            你
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${colorClass}`}>{label}</span>
        {action.amount != null && (
          <span className="text-gray-400 text-xs font-mono">
            {action.amount} BB
          </span>
        )}
      </div>
    </button>
  );
};