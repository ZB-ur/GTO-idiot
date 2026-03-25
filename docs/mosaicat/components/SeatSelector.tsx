import React from 'react';

interface SeatSelectorProps {
  position: string;
  seatIndex: number;
  selected: boolean;
  occupied: boolean;
  onClick: (seatIndex: number) => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  position,
  seatIndex,
  selected,
  occupied,
  onClick,
}) => {
  const handleClick = () => {
    if (!occupied) {
      onClick(seatIndex);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={occupied}
      className={`
        relative flex flex-col items-center justify-center gap-1.5
        w-28 h-28 rounded-xl border-2 transition-all duration-300
        ${occupied
          ? 'bg-gray-800/40 border-gray-700 cursor-not-allowed opacity-50'
          : selected
            ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
            : 'bg-gray-800/40 border-gray-600 hover:border-emerald-400 hover:bg-emerald-500/10 cursor-pointer'
        }
        ${!occupied && !selected ? 'animate-pulse' : ''}
      `}
      aria-label={`Seat ${seatIndex + 1} — ${position} ${occupied ? '(occupied)' : selected ? '(selected)' : '(available)'}`}
    >
      {/* Seat number */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          transition-colors duration-200
          ${occupied
            ? 'bg-gray-700 text-gray-500'
            : selected
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-700 text-gray-300 border border-gray-600'
          }
        `}
      >
        {seatIndex + 1}
      </div>

      {/* Position label */}
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          occupied ? 'text-gray-600' : selected ? 'text-emerald-400' : 'text-gray-400'
        }`}
      >
        {position}
      </span>

      {/* Status */}
      {occupied && (
        <span className="text-[10px] font-medium text-gray-500">Occupied</span>
      )}
      {selected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,6 5,9 10,3" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default SeatSelector;