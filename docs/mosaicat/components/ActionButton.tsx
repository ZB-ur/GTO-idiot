import React from 'react';

interface ActionButtonProps {
  label: string;
  variant: 'fold' | 'check' | 'call' | 'raise' | 'allin';
  disabled?: boolean;
  shortcutKey?: string;
  onClick: () => void;
}

const variantStyles: Record<string, { base: string; hover: string; active: string }> = {
  fold: {
    base: 'bg-gray-500 text-white',
    hover: 'hover:bg-gray-600',
    active: 'active:bg-gray-700',
  },
  check: {
    base: 'bg-emerald-500 text-white',
    hover: 'hover:bg-emerald-600',
    active: 'active:bg-emerald-700',
  },
  call: {
    base: 'bg-blue-600 text-white',
    hover: 'hover:bg-blue-700',
    active: 'active:bg-blue-800',
  },
  raise: {
    base: 'bg-amber-500 text-white',
    hover: 'hover:bg-amber-600',
    active: 'active:bg-amber-700',
  },
  allin: {
    base: 'bg-red-500 text-white',
    hover: 'hover:bg-red-600',
    active: 'active:bg-red-700',
  },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant,
  disabled = false,
  shortcutKey,
  onClick,
}) => {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        min-w-[80px] px-5 py-3 rounded-lg font-semibold text-base
        transition-all duration-150 select-none
        ${styles.base}
        ${disabled ? 'opacity-40 cursor-not-allowed' : `${styles.hover} ${styles.active} cursor-pointer shadow-md hover:shadow-lg`}
      `}
    >
      <span>{label}</span>
      {shortcutKey && (
        <span className="mt-0.5 text-[10px] font-normal opacity-70 uppercase tracking-wider">
          {shortcutKey}
        </span>
      )}
    </button>
  );
};

export default ActionButton;