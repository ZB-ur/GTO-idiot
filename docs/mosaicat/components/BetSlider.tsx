import React, { useCallback } from 'react';

interface BetPresetButtonProps {
  label: string;
  value: number;
  onClick: (value: number) => void;
}

const BetPresetButton: React.FC<BetPresetButtonProps> = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
  >
    {label}
  </button>
);

interface BetSliderProps {
  minBet: number;
  maxBet: number;
  potSize: number;
  value: number;
  onChange: (amount: number) => void;
}

export const BetSlider: React.FC<BetSliderProps> = ({
  minBet,
  maxBet,
  potSize,
  value,
  onChange,
}) => {
  const percentage = maxBet > minBet ? ((value - minBet) / (maxBet - minBet)) * 100 : 0;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value);
      if (!isNaN(num)) {
        onChange(Math.min(maxBet, Math.max(minBet, num)));
      }
    },
    [onChange, minBet, maxBet],
  );

  const presets = [
    { label: '1/2 Pot', value: Math.round(potSize * 0.5) },
    { label: '3/4 Pot', value: Math.round(potSize * 0.75) },
    { label: 'Pot', value: potSize },
    { label: 'All In', value: maxBet },
  ];

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-50">Bet Size</span>
        <span className="text-xs text-gray-500">
          Pot: <span className="text-gray-300 font-medium">{potSize}</span>
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={minBet}
          max={maxBet}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-950 shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Numeric Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            min={minBet}
            max={maxBet}
            value={value}
            onChange={handleInputChange}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 text-gray-50 text-sm font-bold px-3 py-2 text-center focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <BetPresetButton
            key={preset.label}
            label={preset.label}
            value={Math.min(maxBet, Math.max(minBet, preset.value))}
            onClick={onChange}
          />
        ))}
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>Min: {minBet}</span>
        <span>Max: {maxBet}</span>
      </div>
    </div>
  );
};

export default BetSlider;