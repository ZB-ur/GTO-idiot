/**
 * StreetStepper — horizontal step indicator for navigating poker streets.
 * Highlights the active street and shows completion state.
 */

import React from 'react';
import type { Street } from '../../types/poker';

interface StreetStepperProps {
  streets: Street[];
  activeStreet: Street;
  onSelectStreet: (street: Street) => void;
  /** Map of street → has deviation */
  deviationStreets?: Set<Street>;
  className?: string;
}

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

export const StreetStepper: React.FC<StreetStepperProps> = ({
  streets,
  activeStreet,
  onSelectStreet,
  deviationStreets,
  className = '',
}) => {
  const activeIdx = STREET_ORDER.indexOf(activeStreet);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {STREET_ORDER.filter((s) => streets.includes(s)).map((street, idx) => {
        const streetIdx = STREET_ORDER.indexOf(street);
        const isActive = street === activeStreet;
        const isPast = streetIdx < activeIdx;
        const hasDeviation = deviationStreets?.has(street) ?? false;

        return (
          <React.Fragment key={street}>
            {idx > 0 && (
              <div
                className={`h-0.5 w-4 sm:w-6 ${
                  isPast || isActive ? 'bg-felt-500' : 'bg-gray-700'
                }`}
              />
            )}
            <button
              onClick={() => onSelectStreet(street)}
              className={`relative px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                ${isActive
                  ? 'bg-felt-600 text-white shadow-md shadow-felt-600/30'
                  : isPast
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-400'
                }`}
            >
              {STREET_LABELS[street]}
              {hasDeviation && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StreetStepper;
