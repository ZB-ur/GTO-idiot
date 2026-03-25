import React, { useState, useCallback } from 'react';

interface BuyInSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const presets = [
  { label: '50 BB', value: 50 },
  { label: '100 BB', value: 100 },
  { label: '150 BB', value: 150 },
  { label: '200 BB', value: 200 },
];

export const BuyInSlider: React.FC<BuyInSliderProps> = ({
  value,
  min = 50,
  max = 200,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      onChange(v);
      setInputValue(String(v));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v >= min && v <= max) {
        onChange(v);
      }
    },
    [onChange, min, max],
  );

  const handlePreset = useCallback(
    (preset: number) => {
      const clamped = Math.min(Math.max(preset, min), max);
      onChange(clamped);
      setInputValue(String(clamped));
    },
    [min, max, onChange],
  );

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-100">Buy-in Amount</span>
        <span className="text-lg font-bold text-emerald-400">{value} BB</span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={`
              flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg border transition-colors
              ${value === p.value
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400'
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Slider track */}
      <div className="relative">
        <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1.5">
          <span>{min} BB</span>
          <span>{max} BB</span>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full">
          <div
            className="absolute h-2 bg-emerald-500 rounded-full transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute w-5 h-5 bg-emerald-500 border-2 border-emerald-300 rounded-full shadow-md shadow-emerald-500/30 -top-1.5"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 top-5 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>

      {/* Manual input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-700 bg-gray-800 text-sm font-semibold text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">BB</span>
        </div>
      </div>
    </div>
  );
};

export default BuyInSlider;