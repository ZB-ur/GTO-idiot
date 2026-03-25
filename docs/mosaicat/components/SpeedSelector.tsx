import React from 'react';

type Speed = 'slow' | 'normal' | 'fast';

interface SpeedSelectorProps {
  currentSpeed: Speed;
  onChange: (speed: Speed) => void;
}

const speedOptions: { value: Speed; label: string; description: string }[] = [
  { value: 'slow', label: 'Slow', description: '3s delay' },
  { value: 'normal', label: 'Normal', description: '1.5s delay' },
  { value: 'fast', label: 'Fast', description: '0.5s delay' },
];

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({ currentSpeed, onChange }) => {
  return (
    <div className="flex gap-2">
      {speedOptions.map((option) => {
        const isSelected = currentSpeed === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-1 px-4 py-3 rounded-lg text-center transition-all duration-150
              border focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              ${isSelected
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-[#1e293b] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }
            `}
            aria-pressed={isSelected}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
};

export default SpeedSelector;