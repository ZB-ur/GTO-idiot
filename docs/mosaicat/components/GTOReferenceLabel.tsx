import React from 'react';

interface GTOReferenceLabelProps {
  className?: string;
}

export const GTOReferenceLabel: React.FC<GTOReferenceLabelProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        />
      </svg>
      <span className="text-xs text-gray-400 font-medium">
        GTO Reference <span className="text-gray-500">(simplified)</span>
      </span>
    </div>
  );
};