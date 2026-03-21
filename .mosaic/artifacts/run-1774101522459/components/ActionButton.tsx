import React from 'react';

type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

interface ActionButtonProps {
  action: ActionType;
  amount?: number;
  disabled?: boolean;
  onClick: () => void;
}

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; hoverColor: string; activeColor: string }> = {
  fold: {
    label: 'Fold',
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
    activeColor: 'active:bg-gray-700',
  },
  check: {
    label: 'Check',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    activeColor: 'active:bg-blue-800',
  },
  call: {
    label: 'Call',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    activeColor: 'active:bg-green-700',
  },
  bet: {
    label: 'Bet',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    activeColor: 'active:bg-yellow-700',
  },
  raise: {
    label: 'Raise',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    activeColor: 'active:bg-orange-700',
  },
  all_in: {
    label: 'All In',
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    activeColor: 'active:bg-red-800',
  },
};

const formatAmount = (amount: number): string => {
  return amount % 1 === 0 ? `${amount}` : amount.toFixed(1);
};

export const ActionButton: React.FC<ActionButtonProps> = ({ action, amount, disabled = false, onClick }) => {
  const config = ACTION_CONFIG[action];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center justify-center
        min-w-[80px] px-5 py-3
        rounded-lg
        text-white font-semibold text-base
        transition-all duration-150 ease-in-out
        shadow-sm
        ${disabled
          ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-60 shadow-none'
          : `${config.color} ${config.hoverColor} ${config.activeColor} cursor-pointer shadow-md hover:shadow-lg active:scale-95`
        }
      `}
    >
      <span className="leading-tight">{config.label}</span>
      {amount !== undefined && (
        <span className="text-xs font-normal opacity-90 mt-0.5">
          {formatAmount(amount)} BB
        </span>
      )}
    </button>
  );
};

export default ActionButton;