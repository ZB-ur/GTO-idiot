import React from 'react';

interface ContinueButtonProps {
  onClick: () => void;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full px-6 py-3 text-base font-semibold text-white
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        rounded-lg shadow-sm
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
      "
    >
      继续下一手
    </button>
  );
};

export default ContinueButton;