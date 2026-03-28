import React from 'react';

interface PositionFilterChipProps {
  position: string;
  onClear: () => void;
}

export const PositionFilterChip: React.FC<PositionFilterChipProps> = ({
  position,
  onClear,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-sm font-medium text-amber-400">
      {position}
      <button
        onClick={onClear}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-amber-500/30 transition-colors text-amber-400/70 hover:text-amber-400"
        aria-label={`Clear ${position} filter`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};