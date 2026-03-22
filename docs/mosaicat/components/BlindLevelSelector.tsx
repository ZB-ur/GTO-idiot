import React from 'react';

interface BlindLevelSelectorProps {
  value: string;
  onChange: (level: string) => void;
}

const levels = ['1/2', '2/5', '5/10'];

export const BlindLevelSelector: React.FC<BlindLevelSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-900">Blind Level</label>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all ${
              value === level
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};