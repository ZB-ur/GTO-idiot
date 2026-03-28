import React from 'react';

interface ActionButtonProps {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

const actionConfig: Record<
  string,
  { label: string; bg: string; bgHover: string; bgDisabled: string; ring: string }
> = {
  fold: {
    label: 'Fold',
    bg: 'bg-gray-600',
    bgHover: 'hover:bg-gray-700',
    bgDisabled: 'bg-gray-300',
    ring: 'focus:ring-gray-400',
  },
  check: {
    label: 'Check',
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    bgDisabled: 'bg-green-200',
    ring: 'focus:ring-green-400',
  },
  call: {
    label: 'Call',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgDisabled: 'bg-blue-200',
    ring: 'focus:ring-blue-400',
  },
  raise: {
    label: 'Raise',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    bgDisabled: 'bg-amber-200',
    ring: 'focus:ring-amber-400',
  },
  all_in: {
    label: 'All In',
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    bgDisabled: 'bg-red-200',
    ring: 'focus:ring-red-400',
  },
};

function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return amount.toString();
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  amount,
  disabled = false,
  onClick,
  className = '',
}) => {
  const config = actionConfig[action];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center justify-center
        min-w-[72px] px-4 py-2.5 rounded-lg
        text-white font-semibold text-sm
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.ring}
        ${disabled ? `${config.bgDisabled} cursor-not-allowed opacity-60` : `${config.bg} ${config.bgHover} cursor-pointer active:scale-95`}
        ${className}
      `}
    >
      <span>{config.label}</span>
      {amount !== undefined && (
        <span className={`text-xs mt-0.5 ${disabled ? 'text-white/50' : 'text-white/80'}`}>
          {formatAmount(amount)} BB
        </span>
      )}
    </button>
  );
};

export default ActionButton;