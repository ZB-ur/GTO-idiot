import React from 'react';

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface PositionSelectorProps {
  selected: Position;
  onChange: (position: Position) => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const POSITION_LABELS: Record<Position, string> = {
  UTG: 'UTG',
  MP: 'MP',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

export function PositionSelector({ selected, onChange }: PositionSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-gray-800 rounded-xl border border-gray-700">
      {POSITIONS.map((pos) => {
        const isSelected = pos === selected;
        return (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`
              px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${isSelected
                ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/25'
                : 'text-gray-400 hover:text-gray-50 hover:bg-gray-700'
              }
            `}
          >
            {POSITION_LABELS[pos]}
          </button>
        );
      })}
    </div>
  );
}