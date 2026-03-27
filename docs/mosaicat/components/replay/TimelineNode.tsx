import React from 'react';

export interface TimelineNodeProps {
  label: string;
  state: 'active' | 'visited' | 'disabled';
  onClick: () => void;
}

const stateStyles: Record<TimelineNodeProps['state'], string> = {
  active:
    'bg-amber-500 text-gray-950 border-amber-400 shadow-lg shadow-amber-500/30 cursor-pointer hover:bg-amber-400',
  visited:
    'bg-gray-800 text-gray-50 border-gray-700 cursor-pointer hover:border-amber-500/50',
  disabled:
    'bg-gray-900 text-gray-500 border-gray-800 cursor-not-allowed opacity-50',
};

export const TimelineNode: React.FC<TimelineNodeProps> = ({
  label,
  state,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={state !== 'disabled' ? onClick : undefined}
      disabled={state === 'disabled'}
      className={`
        inline-flex items-center justify-center
        min-w-[56px] px-3 py-1.5
        text-sm font-semibold
        border-2 rounded-full
        transition-all duration-200
        ${stateStyles[state]}
      `}
    >
      {label}
    </button>
  );
};