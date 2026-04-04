import React from 'react';

export type SeatPosition = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SeatSelectorProps {
  selectedSeat: SeatPosition | null;
  onSelect: (position: SeatPosition) => void;
}

interface SeatConfig {
  position: SeatPosition;
  label: string;
  // Percentage-based positioning around the oval table
  top: string;
  left: string;
}

const SEATS: SeatConfig[] = [
  { position: 'BTN', label: 'BTN', top: '78%', left: '75%' },
  { position: 'SB',  label: 'SB',  top: '78%', left: '25%' },
  { position: 'BB',  label: 'BB',  top: '50%', left: '4%' },
  { position: 'UTG', label: 'UTG', top: '18%', left: '25%' },
  { position: 'MP',  label: 'MP',  top: '18%', left: '75%' },
  { position: 'CO',  label: 'CO',  top: '50%', left: '96%' },
];

const POSITION_DESCRIPTIONS: Record<SeatPosition, string> = {
  UTG: 'Under the Gun',
  MP: 'Middle Position',
  CO: 'Cut Off',
  BTN: 'Button (Dealer)',
  SB: 'Small Blind',
  BB: 'Big Blind',
};

export const SeatSelector: React.FC<SeatSelectorProps> = ({ selectedSeat, onSelect }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-300 font-medium">选择你的座位</div>

      {/* Mini Table Container */}
      <div className="relative w-72 h-48">
        {/* Table felt (oval) */}
        <div className="absolute inset-6 rounded-[50%] bg-emerald-800 border-4 border-amber-900 shadow-inner" />
        {/* Inner felt highlight */}
        <div className="absolute inset-9 rounded-[50%] bg-emerald-700/30 border border-emerald-600/20" />

        {/* Seats */}
        {SEATS.map((seat) => {
          const isSelected = selectedSeat === seat.position;
          return (
            <button
              key={seat.position}
              onClick={() => onSelect(seat.position)}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2
                w-12 h-12 rounded-full
                flex flex-col items-center justify-center
                text-xs font-bold
                transition-all duration-200 ease-out
                border-2
                ${isSelected
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 scale-110'
                  : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600 hover:border-gray-400 hover:scale-105'
                }
              `}
              style={{ top: seat.top, left: seat.left }}
              title={POSITION_DESCRIPTIONS[seat.position]}
              aria-label={`Select seat ${seat.position} - ${POSITION_DESCRIPTIONS[seat.position]}`}
              aria-pressed={isSelected}
            >
              <span className="leading-none">{seat.label}</span>
              {isSelected && (
                <span className="text-[8px] leading-none mt-0.5 text-emerald-200">YOU</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected seat info */}
      {selectedSeat ? (
        <div className="text-center">
          <span className="text-sm text-emerald-400 font-semibold">{selectedSeat}</span>
          <span className="text-sm text-gray-500 mx-1">·</span>
          <span className="text-sm text-gray-400">{POSITION_DESCRIPTIONS[selectedSeat]}</span>
        </div>
      ) : (
        <div className="text-sm text-gray-500">点击座位进行选择</div>
      )}
    </div>
  );
};

export default SeatSelector;