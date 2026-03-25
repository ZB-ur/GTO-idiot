import React from 'react';

type ActionVariant = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

interface ActionButtonProps {
  label: string;
  variant: ActionVariant;
  amount?: number;
  disabled?: boolean;
  onClick: () => void;
}

const variantStyles: Record<ActionVariant, { bg: string; hover: string; text: string; border: string }> = {
  fold: {
    bg: 'bg-gray-700',
    hover: 'hover:bg-gray-600',
    text: 'text-gray-300',
    border: 'border-gray-600',
  },
  check: {
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-500',
  },
  call: {
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-500',
    text: 'text-white',
    border: 'border-emerald-500',
  },
  bet: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-400',
    text: 'text-gray-900',
    border: 'border-amber-400',
  },
  raise: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-400',
    text: 'text-gray-900',
    border: 'border-amber-400',
  },
  allin: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-500',
    text: 'text-white',
    border: 'border-red-500',
  },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant,
  amount,
  disabled = false,
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.bg} ${styles.text} ${styles.border}
        ${disabled ? 'opacity-40 cursor-not-allowed' : `${styles.hover} cursor-pointer active:scale-95`}
        border rounded-lg px-5 py-2.5 font-semibold text-sm
        transition-all duration-150 select-none
        flex flex-col items-center gap-0.5 min-w-[80px]
      `}
    >
      <span>{label}</span>
      {amount !== undefined && (
        <span className="text-xs opacity-80">{amount.toLocaleString()}</span>
      )}
    </button>
  );
};

export default ActionButton;