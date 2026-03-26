import React from 'react';

interface ReplayNavButtonsProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ReplayNavButtons: React.FC<ReplayNavButtonsProps> = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}) => {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalCount - 1;

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={onPrevious}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-lg
          transition-colors duration-150
          ${hasPrevious
            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }
        `}
        aria-label="上一个决策点"
      >
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-center tabular-nums">
        {currentIndex + 1} / {totalCount}
      </span>

      <button
        type="button"
        disabled={!hasNext}
        onClick={onNext}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-lg
          transition-colors duration-150
          ${hasNext
            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }
        `}
        aria-label="下一个决策点"
      >
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ReplayNavButtons;