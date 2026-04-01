import React, { useState } from 'react';

interface BetSliderProps {
  min: number;
  max: number;
  pot: number;
  value: number;
  onChange: (value: number) => void;
}

const presets = [
  { label: '1/3', fraction: 1 / 3 },
  { label: '1/2', fraction: 1 / 2 },
  { label: '2/3', fraction: 2 / 3 },
  { label: 'Pot', fraction: 1 },
];

export const BetSlider: React.FC<BetSliderProps> = ({ min, max, pot, value, onChange }) => {
  const handlePreset = (fraction: number) => {
    const amount = Math.round(pot * fraction);
    onChange(Math.max(min, Math.min(max, amount)));
  };

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Preset buttons */}
      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePreset(p.fraction)}
            className="flex-1 px-2 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-colors"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => onChange(max)}
          className="flex-1 px-2 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          All-In
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Numeric input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= min && v <= max) onChange(v);
          }}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
};

export default BetSlider;