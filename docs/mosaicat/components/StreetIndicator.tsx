import React from 'react';

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

interface StreetIndicatorProps {
  street: Street;
}

const STREET_CONFIG: Record<Street, { label: string; color: string; dotColor: string }> = {
  preflop:  { label: 'Preflop',  color: 'text-gray-400',    dotColor: 'bg-gray-400' },
  flop:     { label: 'Flop',     color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  turn:     { label: 'Turn',     color: 'text-amber-400',   dotColor: 'bg-amber-400' },
  river:    { label: 'River',    color: 'text-sky-400',     dotColor: 'bg-sky-400' },
  showdown: { label: 'Showdown', color: 'text-red-400',     dotColor: 'bg-red-400' },
};

const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

export const StreetIndicator: React.FC<StreetIndicatorProps> = ({ street }) => {
  const currentIndex = STREETS.indexOf(street);

  return (
    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 backdrop-blur-sm">
      {STREETS.map((s, i) => {
        const config = STREET_CONFIG[s];
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;

        return (
          <React.Fragment key={s}>
            {i > 0 && (
              <div
                className={`w-3 h-px ${isPast || isActive ? 'bg-gray-500' : 'bg-gray-700'}`}
              />
            )}
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isActive ? `${config.dotColor} shadow-sm` : isPast ? 'bg-gray-500' : 'bg-gray-700'
                }`}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  isActive ? config.color : isPast ? 'text-gray-500' : 'text-gray-600'
                }`}
              >
                {config.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StreetIndicator;