import React from 'react';

/** Poker table seat positions */
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SeatOptionProps {
  /** Seat position label (e.g. BTN, SB) */
  position: Position;
  /** Seat index 0-5 */
  seatIndex: number;
  /** Whether this seat is currently selected */
  isSelected: boolean;
  /** Click handler — receives seatIndex */
  onClick: (seatIndex: number) => void;
}

/** Position descriptions for tooltip / accessibility */
const positionDescriptions: Record<Position, string> = {
  UTG: 'Under the Gun',
  MP: 'Middle Position',
  CO: 'Cut Off',
  BTN: 'Button (Dealer)',
  SB: 'Small Blind',
  BB: 'Big Blind',
};

export const SeatOption: React.FC<SeatOptionProps> = ({
  position,
  seatIndex,
  isSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(seatIndex)}
      title={positionDescriptions[position]}
      aria-pressed={isSelected}
      className={`
        relative flex flex-col items-center justify-center
        w-20 h-20 rounded-xl border-2 transition-all duration-200
        cursor-pointer select-none
        ${
          isSelected
            ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/30'
            : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm'
        }
      `}
    >
      {/* Position label */}
      <span
        className={`text-lg font-bold tracking-wide ${
          isSelected ? 'text-blue-600' : 'text-gray-900'
        }`}
      >
        {position}
      </span>

      {/* Seat index subtitle */}
      <span
        className={`text-xs mt-0.5 ${
          isSelected ? 'text-blue-500' : 'text-gray-400'
        }`}
      >
        Seat {seatIndex + 1}
      </span>

      {/* Selected indicator dot */}
      {isSelected && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
};

export default SeatOption;