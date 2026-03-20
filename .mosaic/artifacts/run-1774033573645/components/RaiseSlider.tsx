import React, { useCallback, useMemo } from 'react';

interface RaiseSliderProps {
  minAmount: number;
  maxAmount: number;
  potSize: number;
  value: number;
  onChange: (amount: number) => void;
}

interface QuickAmount {
  label: string;
  getValue: (potSize: number) => number;
}

const QUICK_AMOUNTS: QuickAmount[] = [
  { label: '1/3 Pot', getValue: (pot) => Math.round(pot / 3) },
  { label: '1/2 Pot', getValue: (pot) => Math.round(pot / 2) },
  { label: '2/3 Pot', getValue: (pot) => Math.round((pot * 2) / 3) },
  { label: 'Pot', getValue: (pot) => pot },
];

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minAmount,
  maxAmount,
  potSize,
  value,
  onChange,
}) => {
  const clamp = useCallback(
    (val: number) => Math.min(Math.max(Math.round(val), minAmount), maxAmount),
    [minAmount, maxAmount]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(clamp(Number(e.target.value)));
    },
    [onChange, clamp]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw === '') return;
      onChange(clamp(Number(raw)));
    },
    [onChange, clamp]
  );

  const handleQuickAmount = useCallback(
    (qa: QuickAmount) => {
      onChange(clamp(qa.getValue(potSize)));
    },
    [onChange, clamp, potSize]
  );

  const percentage = useMemo(() => {
    if (maxAmount <= minAmount) return 0;
    return ((value - minAmount) / (maxAmount - minAmount)) * 100;
  }, [value, minAmount, maxAmount]);

  const isAllIn = value >= maxAmount;

  return (
    <div className="w-full space-y-3">
      {/* Header: Label + Input */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">
          Raise to
        </span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-right text-sm font-semibold text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              aria-label="Raise amount"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              BB
            </span>
          </div>
          {isAllIn && (
            <span className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white">
              ALL IN
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        {/* Track background */}
        <div className="relative h-2 w-full rounded-full bg-slate-100">
          {/* Filled track */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Native range input (transparent, overlaid) */}
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={1}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
          aria-label="Raise amount slider"
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between px-1">
        <span className="text-xs text-gray-400">Min {minAmount}</span>
        <span className="text-xs text-gray-400">Max {maxAmount}</span>
      </div>

      {/* Quick amount buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((qa) => {
          const qVal = clamp(qa.getValue(potSize));
          const isActive = value === qVal;
          return (
            <button
              key={qa.label}
              type="button"
              onClick={() => handleQuickAmount(qa)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              {qa.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RaiseSlider;