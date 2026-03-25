import React from 'react';

interface TimelineDotProps {
  index: number;
  isActive: boolean;
  isHero: boolean;
  street: string;
  onClick: (index: number) => void;
}

const streetColors: Record<string, { active: string; ring: string }> = {
  preflop: { active: 'bg-blue-600', ring: 'ring-blue-300' },
  flop: { active: 'bg-emerald-600', ring: 'ring-emerald-300' },
  turn: { active: 'bg-amber-500', ring: 'ring-amber-300' },
  river: { active: 'bg-red-500', ring: 'ring-red-300' },
};

export const TimelineDot: React.FC<TimelineDotProps> = ({
  index,
  isActive,
  isHero,
  street,
  onClick,
}) => {
  const colors = streetColors[street] ?? streetColors.preflop;

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      aria-label={`Decision ${index + 1} – ${street}${isHero ? ' (hero)' : ''}`}
      className={[
        'relative flex items-center justify-center rounded-full transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        colors.ring,
        isActive ? `${colors.active} scale-125` : 'bg-gray-300 hover:bg-gray-400',
        isHero ? 'w-5 h-5' : 'w-3.5 h-3.5',
      ].join(' ')}
    >
      {isHero && (
        <span
          className={[
            'absolute inset-0 rounded-full border-2',
            isActive ? 'border-white' : 'border-gray-500',
          ].join(' ')}
        />
      )}
      {isActive && (
        <span
          className={`absolute -inset-1 rounded-full ${colors.active} opacity-25 animate-ping`}
        />
      )}
    </button>
  );
};

export default TimelineDot;