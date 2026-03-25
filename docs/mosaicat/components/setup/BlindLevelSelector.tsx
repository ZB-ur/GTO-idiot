import React from 'react';

interface BlindLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const blindLevels = [
  { value: '1/2', label: '$1 / $2' },
  { value: '2/5', label: '$2 / $5' },
  { value: '5/10', label: '$5 / $10' },
];

const BlindLevelSelector: React.FC<BlindLevelSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">Blind Level</label>
      <div className="flex gap-2">
        {blindLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
              value === level.value
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlindLevelSelector;