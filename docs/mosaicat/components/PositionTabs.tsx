import React from 'react';

const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const;

interface PositionTabsProps {
  selectedPosition: string;
  onChange: (position: string) => void;
}

export const PositionTabs: React.FC<PositionTabsProps> = ({ selectedPosition, onChange }) => {
  return (
    <div className="flex gap-1 bg-[#1a1a2e] p-1 rounded-lg">
      {POSITIONS.map((pos) => {
        const isActive = selectedPosition === pos;
        return (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`
              flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all
              ${isActive
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#334155]/50'
              }
            `}
          >
            {pos}
          </button>
        );
      })}
    </div>
  );
};

export default PositionTabs;