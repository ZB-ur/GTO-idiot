import React from 'react';

interface GtoExplanationTextProps {
  explanation: string;
}

const GtoExplanationText: React.FC<GtoExplanationTextProps> = ({ explanation }) => {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <svg
          className="h-4 w-4 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-semibold text-blue-700">GTO 策略解释</span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{explanation}</p>
    </div>
  );
};

export default GtoExplanationText;