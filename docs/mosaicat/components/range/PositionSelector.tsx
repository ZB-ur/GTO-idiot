import React from 'react';

interface PositionSelectorProps {
  selected: string;
  onChange: (position: string) => void;
}

const POSITIONS = [
  { id: 'UTG', label: 'UTG' },
  { id: 'MP', label: 'MP' },
  { id: 'CO', label: 'CO' },
  { id: 'BTN', label: 'BTN' },
  { id: 'SB', label: 'SB' },
  { id: 'BB', label: 'BB' },
];

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" role="radiogroup" aria-label="Table position">
      {POSITIONS.map((pos, i) => {
        const isSelected = pos.id === selected;
        return (
          <button
            key={pos.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(pos.id)}
            className={[
              'flex-1 px-3 py-2 text-sm font-medium transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:z-10',
              i > 0 ? 'border-l border-gray-200' : '',
              isSelected
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ].join(' ')}
          >
            {pos.label}
          </button>
        );
      })}
    </div>
  );
};

export default PositionSelector;