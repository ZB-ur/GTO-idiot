import React from 'react';

interface MixedStrategyNoteProps {
  note: string;
}

export const MixedStrategyNote: React.FC<MixedStrategyNoteProps> = ({ note }) => {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 017.072 0"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-amber-400 mb-1">混合策略说明</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{note}</p>
      </div>
    </div>
  );
};

export default MixedStrategyNote;