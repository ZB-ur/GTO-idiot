import React from 'react';

interface SkipButtonProps {
  onClick: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full px-6 py-3 text-base font-semibold text-gray-600
        bg-white hover:bg-slate-50 active:bg-slate-100
        border border-gray-200 rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
      "
    >
      跳过复盘
    </button>
  );
};

export default SkipButton;