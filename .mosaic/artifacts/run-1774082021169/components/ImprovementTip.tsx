'use client';

import { useState } from 'react';

interface ImprovementTipProps {
  suggestion: string;
  expanded?: boolean;
}

export default function ImprovementTip({
  suggestion,
  expanded: initialExpanded = false,
}: ImprovementTipProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-500/10 transition-colors"
      >
        <svg
          className={`w-4 h-4 text-blue-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-blue-400 text-xs font-semibold">Improvement Tip</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
        </div>
      )}
    </div>
  );
}