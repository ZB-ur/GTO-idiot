import React from 'react';

interface SeatSelectorProps {
  position: string;
  isSelected: boolean;
  isPlayer: boolean;
  botStyle?: string;
  onClick: () => void;
  className?: string;
}

const POSITION_LABELS: Record<string, string> = {
  UTG: 'UTG',
  MP: 'MP',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  position,
  isSelected,
  isPlayer,
  botStyle,
  onClick,
  className = '',
}) => {
  const posLabel = POSITION_LABELS[position] ?? position;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-20 h-20 rounded-2xl
        transition-all duration-200 cursor-pointer
        ${isSelected
          ? isPlayer
            ? 'bg-amber-500/20 border-2 border-amber-500 shadow-lg shadow-amber-500/20'
            : 'bg-emerald-600/20 border-2 border-emerald-600 shadow-lg shadow-emerald-600/20'
          : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
        }
        ${className}
      `}
    >
      {/* Position label */}
      <span
        className={`text-xs font-bold uppercase tracking-wider ${
          isSelected
            ? isPlayer ? 'text-amber-400' : 'text-emerald-400'
            : 'text-gray-500'
        }`}
      >
        {posLabel}
      </span>

      {/* Occupant indicator */}
      {isSelected && (
        <span
          className={`text-sm font-semibold mt-1 ${
            isPlayer ? 'text-amber-300' : 'text-emerald-300'
          }`}
        >
          {isPlayer ? 'You' : botStyle ?? 'BOT'}
        </span>
      )}

      {!isSelected && (
        <span className="text-sm text-gray-600 mt-1">Empty</span>
      )}

      {/* Selection ring indicator */}
      {isSelected && isPlayer && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default SeatSelector;