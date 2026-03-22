import React, { useCallback } from 'react';

interface PresetButton {
  label: string;
  amount: number;
}

interface RaiseSliderProps {
  min: number;
  max: number;
  potSize: number;
  presets: PresetButton[];
  value: number;
  onChange: (amount: number) => void;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  min,
  max,
  potSize,
  presets,
  value,
  onChange,
}) => {
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val)) {
        onChange(Math.min(max, Math.max(min, val)));
      }
    },
    [onChange, min, max]
  );

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="flex-1 h-2 rounded-full appearance-none bg-gray-200 accent-blue-600"
        />
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={handleInputChange}
            className="w-24 pl-6 pr-2 py-1.5 text-sm font-medium border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(Math.min(max, Math.max(min, preset.amount)))}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              value === preset.amount
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};