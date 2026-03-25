import React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

interface StartGameButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative w-full flex items-center justify-center gap-2
        px-6 py-3 rounded-xl text-lg font-bold
        text-white shadow-sm
        transition-all duration-150 ease-in-out
        ${
          isDisabled
            ? 'bg-blue-400 cursor-not-allowed opacity-70'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer'
        }
      `}
    >
      {isLoading && <Spinner className="w-5 h-5 text-white" />}
      <span>{isLoading ? 'Shuffling…' : 'Deal Me In!'}</span>
    </button>
  );
};

export { Spinner };
export default StartGameButton;