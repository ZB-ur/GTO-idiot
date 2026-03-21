// ============================================================
// RaiseSlider — Slider + input for selecting raise/bet amount
// ============================================================

import React, { useCallback, useState, useEffect } from 'react';

export interface RaiseSliderProps {
  minAmount: number;
  maxAmount: number;
  potSize: number;
  onAmountChange: (amount: number) => void;
  currentAmount: number;
}

const PRESET_FRACTIONS = [
  { label: '1/3', fraction: 1 / 3 },
  { label: '1/2', fraction: 1 / 2 },
  { label: '2/3', fraction: 2 / 3 },
  { label: 'Pot', fraction: 1 },
  { label: 'All-In', fraction: Infinity },
] as const;

const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minAmount,
  maxAmount,
  potSize,
  onAmountChange,
  currentAmount,
}) => {
  const [inputValue, setInputValue] = useState(currentAmount.toFixed(1));

  useEffect(() => {
    setInputValue(currentAmount.toFixed(1));
  }, [currentAmount]);

  const clamp = useCallback(
    (val: number) => Math.min(maxAmount, Math.max(minAmount, Math.round(val * 10) / 10)),
    [minAmount, maxAmount],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = clamp(parseFloat(e.target.value));
      onAmountChange(val);
    },
    [clamp, onAmountChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const handleInputBlur = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      onAmountChange(clamped);
      setInputValue(clamped.toFixed(1));
    } else {
      setInputValue(currentAmount.toFixed(1));
    }
  }, [inputValue, clamp, onAmountChange, currentAmount]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
    },
    [],
  );

  const handlePreset = useCallback(
    (fraction: number) => {
      if (fraction === Infinity) {
        onAmountChange(maxAmount);
      } else {
        onAmountChange(clamp(potSize * fraction));
      }
    },
    [potSize, maxAmount, clamp, onAmountChange],
  );

  // Slider percentage for styling
  const pct = maxAmount > minAmount
    ? ((currentAmount - minAmount) / (maxAmount - minAmount)) * 100
    : 0;

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {/* Preset buttons */}
      <div className="flex gap-1">
        {PRESET_FRACTIONS.map(({ label, fraction }) => {
          const targetAmount = fraction === Infinity ? maxAmount : clamp(potSize * fraction);
          const isDisabled = targetAmount < minAmount;
          return (
            <button
              key={label}
              type="button"
              disabled={isDisabled}
              onClick={() => handlePreset(fraction)}
              className={`
                flex-1 px-1 py-1 text-[10px] font-semibold rounded
                transition-colors
                ${isDisabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500'}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={0.5}
          value={currentAmount}
          onChange={handleSliderChange}
          className="w-full h-2 appearance-none rounded-full bg-gray-700 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #eab308 0%, #eab308 ${pct}%, #374151 ${pct}%, #374151 100%)`,
          }}
        />
      </div>

      {/* Amount input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-20 px-2 py-1 text-sm text-center text-white bg-gray-800 border border-gray-600 rounded
            focus:border-yellow-400 focus:outline-none font-mono"
        />
        <span className="text-xs text-gray-400">BB</span>
        <span className="text-[10px] text-gray-500 ml-auto">
          {minAmount.toFixed(1)} – {maxAmount.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default React.memo(RaiseSlider);
