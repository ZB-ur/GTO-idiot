/**
 * RaiseSlider — slider + preset buttons for selecting a raise/bet amount.
 */

import React, { useState, useCallback, useEffect } from 'react';

interface SuggestedSizing {
  label: string;
  amount: number;
}

interface RaiseSliderProps {
  minRaise: number;
  maxRaise: number;
  potSize: number;
  suggestedSizings?: SuggestedSizing[];
  onConfirm: (amount: number) => void;
  onCancel: () => void;
  className?: string;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minRaise,
  maxRaise,
  potSize,
  suggestedSizings,
  onConfirm,
  onCancel,
  className = '',
}) => {
  const [amount, setAmount] = useState(minRaise);

  // Clamp if bounds change
  useEffect(() => {
    setAmount((prev) => Math.max(minRaise, Math.min(maxRaise, prev)));
  }, [minRaise, maxRaise]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(Number(e.target.value));
    },
    [],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val)) {
        setAmount(Math.max(minRaise, Math.min(maxRaise, val)));
      }
    },
    [minRaise, maxRaise],
  );

  // Default presets if none provided
  const presets: SuggestedSizing[] = suggestedSizings?.length
    ? suggestedSizings
    : [
        { label: '½ Pot', amount: Math.round(potSize * 0.5) },
        { label: '¾ Pot', amount: Math.round(potSize * 0.75) },
        { label: 'Pot', amount: Math.round(potSize) },
        { label: 'All In', amount: maxRaise },
      ].filter((p) => p.amount >= minRaise && p.amount <= maxRaise);

  // Percentage of slider filled
  const range = maxRaise - minRaise || 1;
  const pct = ((amount - minRaise) / range) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Preset buttons */}
      <div className="flex gap-1 flex-wrap justify-center">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setAmount(Math.min(maxRaise, Math.max(minRaise, preset.amount)))}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors
              ${
                Math.abs(amount - preset.amount) < 0.5
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={minRaise}
          max={maxRaise}
          step={1}
          value={amount}
          onChange={handleSliderChange}
          className="w-full h-2 appearance-none bg-gray-700 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-yellow-400
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-yellow-600
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, #eab308 ${pct}%, #374151 ${pct}%)`,
          }}
        />
      </div>

      {/* Amount input + action buttons */}
      <div className="flex items-center gap-2 justify-center">
        <input
          type="number"
          min={minRaise}
          max={maxRaise}
          value={Math.round(amount)}
          onChange={handleInputChange}
          className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-600
            text-white text-sm text-center tabular-nums
            focus:outline-none focus:border-yellow-500"
        />
        <span className="text-gray-400 text-xs">BB</span>
        <button
          onClick={() => onConfirm(Math.round(amount))}
          className="px-4 py-1.5 rounded bg-yellow-500 hover:bg-yellow-400
            text-gray-900 text-sm font-bold transition-colors"
        >
          Raise
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600
            text-gray-300 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RaiseSlider;
