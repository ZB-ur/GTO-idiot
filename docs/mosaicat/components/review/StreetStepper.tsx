import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

interface StreetStepperProps {
  currentStreet: Street;
  availableStreets: Street[];
  onSelectStreet: (street: Street) => void;
}

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const ALL_STREETS: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

export const StreetStepper: React.FC<StreetStepperProps> = ({
  currentStreet,
  availableStreets,
  onSelectStreet,
}) => {
  return (
    <div className="flex items-center gap-0">
      {ALL_STREETS.map((street, index) => {
        const isAvailable = availableStreets.includes(street);
        const isCurrent = street === currentStreet;
        const currentIdx = ALL_STREETS.indexOf(currentStreet);
        const isPast = index < currentIdx && isAvailable;

        return (
          <React.Fragment key={street}>
            {index > 0 && (
              <div
                className={`h-0.5 w-8 ${
                  isPast || isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
            <button
              onClick={() => isAvailable && onSelectStreet(street)}
              disabled={!isAvailable}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors
                ${isCurrent
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isPast
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : isAvailable
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <span
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCurrent
                    ? 'bg-white/20 text-white'
                    : isPast
                      ? 'bg-blue-200 text-blue-700'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {index + 1}
              </span>
              {STREET_LABELS[street]}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StreetStepper;