import React, { useState } from 'react';

type GameSpeed = 'slow' | 'normal' | 'fast';

interface GameSpeedSelectorProps {
  value: GameSpeed;
  onChange: (value: GameSpeed) => void;
}

const speedOptions: { value: GameSpeed; label: string; delay: string }[] = [
  { value: 'slow', label: 'Slow', delay: '3s delay' },
  { value: 'normal', label: 'Normal', delay: '1.5s delay' },
  { value: 'fast', label: 'Fast', delay: '0.5s delay' },
];

const GameSpeedSelector: React.FC<GameSpeedSelectorProps> = ({ value, onChange }) => {
  const [hoveredOption, setHoveredOption] = useState<GameSpeed | null>(null);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">Game Speed</label>
      <div className="flex gap-2">
        {speedOptions.map((option) => (
          <div key={option.value} className="relative flex-1">
            <button
              onClick={() => onChange(option.value)}
              onMouseEnter={() => setHoveredOption(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                value === option.value
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              {option.label}
            </button>
            {hoveredOption === option.value && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap shadow-md z-10">
                {option.delay}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSpeedSelector;