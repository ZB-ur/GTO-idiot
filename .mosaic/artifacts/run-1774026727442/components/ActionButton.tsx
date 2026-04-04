import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface ActionButtonProps {
  actionType: ActionType;
  label: string;
  disabled?: boolean;
  amount?: number;
  variant?: 'primary' | 'danger' | 'default';
  onClick: () => void;
}

const variantStyles: Record<string, { base: string; hover: string; disabled: string }> = {
  primary: {
    base: 'bg-emerald-600 text-white border-emerald-500',
    hover: 'hover:bg-emerald-500',
    disabled: 'bg-emerald-600/30 text-emerald-400/40 border-emerald-600/20 cursor-not-allowed',
  },
  danger: {
    base: 'bg-red-500/20 text-red-400 border-red-500/40',
    hover: 'hover:bg-red-500/30',
    disabled: 'bg-red-500/10 text-red-400/30 border-red-500/10 cursor-not-allowed',
  },
  default: {
    base: 'bg-gray-700 text-white border-gray-600',
    hover: 'hover:bg-gray-600',
    disabled: 'bg-gray-700/30 text-gray-400/40 border-gray-600/20 cursor-not-allowed',
  },
};

const defaultVariants: Record<ActionType, 'primary' | 'danger' | 'default'> = {
  fold: 'danger',
  check: 'default',
  call: 'primary',
  bet: 'primary',
  raise: 'primary',
  allin: 'danger',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  actionType,
  label,
  disabled = false,
  amount,
  variant,
  onClick,
}) => {
  const v = variant ?? defaultVariants[actionType];
  const styles = variantStyles[v];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center justify-center
        px-5 py-3 rounded-lg border font-semibold
        transition-colors duration-150 select-none
        min-w-[80px]
        ${disabled ? styles.disabled : `${styles.base} ${styles.hover}`}
      `}
    >
      <span className="text-sm">{label}</span>
      {amount !== undefined && (
        <span className="text-xs opacity-70 mt-0.5">{amount.toFixed(1)} BB</span>
      )}
    </button>
  );
};

export default ActionButton;