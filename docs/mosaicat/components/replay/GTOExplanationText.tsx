import React from 'react';

export interface GTOExplanationTextProps {
  explanation: string;
}

export const GTOExplanationText: React.FC<GTOExplanationTextProps> = ({
  explanation,
}) => {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-gray-900 rounded-xl border border-gray-800">
      <div className="flex-shrink-0 mt-0.5">
        <svg
          className="w-4 h-4 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
};