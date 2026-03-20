import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

interface StreetNavigatorProps {
  currentStreet: Street;
  availableStreets: Street[];
  streetStartIndices: Record<string, number>;
  onJump: (street: Street) => void;
}

const STREET_CONFIG: Record<Street, { label: string; icon: string }> = {
  preflop: { label: 'Preflop', icon: '🂠' },
  flop: { label: 'Flop', icon: '🃏' },
  turn: { label: 'Turn', icon: '🃁' },
  river: { label: 'River', icon: '🂡' },
};

const ALL_STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

export const StreetNavigator: React.FC<StreetNavigatorProps> = ({
  currentStreet,
  availableStreets,
  streetStartIndices,
  onJump,
}) => {
  return (
    <nav className="flex items-center gap-1 bg-gray-800 rounded-xl p-1.5 border border-gray-600">
      {ALL_STREETS.map((street, index) => {
        const isAvailable = availableStreets.includes(street);
        const isCurrent = currentStreet === street;
        const config = STREET_CONFIG[street];
        const stepIndex = streetStartIndices[street];

        return (
          <React.Fragment key={street}>
            {index > 0 && (
              <div
                className={`w-6 h-0.5 ${
                  availableStreets.includes(ALL_STREETS[index - 1]) && isAvailable
                    ? 'bg-emerald-600'
                    : 'bg-gray-600'
                }`}
              />
            )}
            <button
              onClick={() => isAvailable && onJump(street)}
              disabled={!isAvailable}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : isAvailable
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                }
              `}
              title={
                isAvailable
                  ? `Jump to ${config.label} (step ${stepIndex})`
                  : `${config.label} not reached`
              }
            >
              <span className="text-base">{config.icon}</span>
              <span>{config.label}</span>
              {isCurrent && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-emerald-400 rounded-full" />
              )}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default StreetNavigator;