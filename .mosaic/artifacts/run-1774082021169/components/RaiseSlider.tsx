'use client';

import { useCallback } from 'react';

interface RaisePreset {
  label: string;
  amount: number;
}

interface RaiseSliderProps {
  minAmount: number;
  maxAmount: number;
  presets: RaisePreset[];
  value: number;
  onChange: (amount: number) => void;
}

export default function RaiseSlider({
  minAmount,
  maxAmount,
  presets,
  value,
  onChange,
}: RaiseSliderProps) {
  const handlePreset = useCallback(
    (amount: number) => {
      onChange(Math.max(minAmount, Math.min(maxAmount, amount)));
    },
    [minAmount, maxAmount, onChange],
  );

  const percentage =
    maxAmount > minAmount
      ? ((value - minAmount) / (maxAmount - minAmount)) * 100
      : 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Preset buttons */}
      <div className="flex gap-1 flex-wrap justify-center">
        {presets.map((preset) => {
          const clamped = Math.max(minAmount, Math.min(maxAmount, preset.amount));
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset.amount)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                clamped === value
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative flex items-center gap-3">
        <span className="text-gray-400 text-xs font-mono w-12 text-right">
          {minAmount.toLocaleString()}
        </span>
        <div className="relative flex-1 h-6 flex items-center">
          <div className="absolute w-full h-2 rounded-full bg-gray-700" />
          <div
            className="absolute h-2 rounded-full bg-yellow-500"
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            value={value}
            step={Math.max(1, Math.floor((maxAmount - minAmount) / 100))}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-yellow-600
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yellow-400
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-yellow-600
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
        <span className="text-gray-400 text-xs font-mono w-12">
          {maxAmount.toLocaleString()}
        </span>
      </div>

      {/* Numeric input */}
      <div className="flex items-center justify-center gap-2">
        <input
          type="number"
          min={minAmount}
          max={maxAmount}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(minAmount, Math.min(maxAmount, v)));
          }}
          className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-center text-yellow-400 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <span className="text-gray-400 text-sm">BB</span>
      </div>
    </div>
  );
}