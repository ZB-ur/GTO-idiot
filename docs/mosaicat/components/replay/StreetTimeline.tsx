import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

const STREET_LABELS: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

interface StreetTimelineProps {
  activeStreet: Street;
  availableStreets: Street[];
  onSelectStreet: (street: Street) => void;
}

export const StreetTimeline: React.FC<StreetTimelineProps> = ({
  activeStreet,
  availableStreets,
  onSelectStreet,
}) => {
  return (
    <div className="flex items-center justify-center gap-0 py-4 px-6">
      {STREET_ORDER.map((street, index) => {
        const isAvailable = availableStreets.includes(street);
        const isActive = street === activeStreet;
        const activeIdx = STREET_ORDER.indexOf(activeStreet);
        const isPast = STREET_ORDER.indexOf(street) < activeIdx && isAvailable;

        return (
          <React.Fragment key={street}>
            {/* Node */}
            <button
              onClick={() => isAvailable && onSelectStreet(street)}
              disabled={!isAvailable}
              className={`
                relative flex flex-col items-center gap-1.5 group
                ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/30 scale-110'
                    : isPast
                      ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50'
                      : isAvailable
                        ? 'bg-gray-800 text-gray-400 border-2 border-gray-700 group-hover:border-amber-500/50 group-hover:text-gray-200'
                        : 'bg-gray-900 text-gray-600 border-2 border-gray-800'
                  }
                `}
              >
                {index + 1}
              </div>
              <span
                className={`
                  text-xs font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? 'text-amber-400'
                    : isPast
                      ? 'text-gray-400'
                      : isAvailable
                        ? 'text-gray-500 group-hover:text-gray-300'
                        : 'text-gray-600'
                  }
                `}
              >
                {STREET_LABELS[street]}
              </span>
            </button>

            {/* Connector line */}
            {index < STREET_ORDER.length - 1 && (
              <div className="flex-1 min-w-8 max-w-16 h-0.5 mt-[-18px] mx-1">
                <div
                  className={`
                    h-full rounded-full transition-colors
                    ${isPast || (isActive && index < activeIdx)
                      ? 'bg-amber-500/50'
                      : 'bg-gray-700'
                    }
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};