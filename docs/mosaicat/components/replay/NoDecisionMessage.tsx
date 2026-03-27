import React from 'react';

interface NoDecisionMessageProps {
  message: string;
  onNextHand?: () => void;
}

export const NoDecisionMessage: React.FC<NoDecisionMessageProps> = ({
  message,
  onNextHand,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-700 bg-gray-900 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800">
        <svg
          className="h-7 w-7 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400">{message}</p>
      {onNextHand && (
        <button
          type="button"
          onClick={onNextHand}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
        >
          查看下一手
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NoDecisionMessage;