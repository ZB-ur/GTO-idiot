import React from 'react';

interface AllInButtonProps {
  amount: number;
  onClick: () => void;
  disabled?: boolean;
}

const AllInButton: React.FC<AllInButtonProps> = ({ amount, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3 rounded-xl font-bold text-base text-white uppercase tracking-wide
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-amber-300 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 shadow-sm hover:shadow-md'
        }
      `}
    >
      All-In {amount.toLocaleString()}
    </button>
  );
};

export default AllInButton;