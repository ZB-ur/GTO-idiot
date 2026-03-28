import React from 'react';

interface TimelineDotProps {
  index: number;
  deviation?: 'match' | 'minor' | 'severe' | 'no_data';
  isUserDecision: boolean;
  active: boolean;
  onClick: (index: number) => void;
}

const deviationColors: Record<string, string> = {
  match: 'bg-emerald-500',
  minor: 'bg-yellow-500',
  severe: 'bg-red-500',
  no_data: 'bg-gray-600',
};

const deviationRingColors: Record<string, string> = {
  match: 'ring-emerald-500/40',
  minor: 'ring-yellow-500/40',
  severe: 'ring-red-500/40',
  no_data: 'ring-gray-600/40',
};

export const TimelineDot: React.FC<TimelineDotProps> = ({
  index,
  deviation = 'no_data',
  isUserDecision,
  active,
  onClick,
}) => {
  const dotColor = deviationColors[deviation];
  const ringColor = deviationRingColors[deviation];

  return (
    <button
      onClick={() => onClick(index)}
      className={`
        relative flex items-center justify-center
        w-8 h-8 rounded-full transition-all duration-200
        ${dotColor}
        ${active ? `ring-4 ${ringColor} scale-125` : 'hover:scale-110'}
        ${isUserDecision ? 'border-2 border-amber-400' : ''}
      `}
      aria-label={`Decision point ${index + 1}`}
    >
      {isUserDecision && (
        <span className="text-xs font-bold text-gray-950">U</span>
      )}
      {active && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
      )}
    </button>
  );
};