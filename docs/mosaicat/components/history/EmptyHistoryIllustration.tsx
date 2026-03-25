import React from 'react';

interface EmptyHistoryIllustrationProps {
  onAction: () => void;
}

const EmptyHistoryIllustration: React.FC<EmptyHistoryIllustrationProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration: stylized card deck */}
      <div className="relative mb-6">
        <div className="w-16 h-22 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 absolute -left-3 -top-1 rotate-[-6deg]" />
        <div className="w-16 h-22 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 absolute -right-3 -top-1 rotate-[6deg]" />
        <div className="relative w-16 h-22 rounded-lg bg-white border-2 border-dashed border-gray-300 flex items-center justify-center z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">No hands played yet</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Start a session against a bot to see your hand history and review your decisions.
      </p>

      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm transition-colors hover:bg-blue-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Play a Hand
      </button>
    </div>
  );
};

export default EmptyHistoryIllustration;