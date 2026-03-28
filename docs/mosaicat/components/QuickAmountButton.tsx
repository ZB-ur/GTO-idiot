import React, { useCallback } from 'react';

interface QuickAmountButtonProps {
  label: string;
  amount: number;
  onClick: (amount: number) => void;
  active?: boolean;
}

export const QuickAmountButton: React.FC<QuickAmountButtonProps> = ({
  label,
  amount,
  onClick,
  active = false,
}) => {
  const handleClick = useCallback(() => onClick(amount), [onClick, amount]);

  return (
    <button
      onClick={handleClick}
      className={`
        px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150
        border cursor-pointer
        ${active
          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-50'
        }
      `}
    >
      {label}
    </button>
  );
};