import React from 'react';

interface SkipButtonProps {
  onClick: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 font-medium"
    >
      Skip Tutorial →
    </button>
  );
};

export default SkipButton;