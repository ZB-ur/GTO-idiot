import React from 'react';

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

const POSITION_LABELS: Record<Position, string> = {
  UTG: 'UTG',
  HJ: 'HJ',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

interface PositionSelectorProps {
  selected: Position;
  onChange: (position: Position) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600">
        位置选择
      </label>
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
              ${
                selected === pos
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
              }
            `}
          >
            {POSITION_LABELS[pos]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PositionSelector;