import React, { useState, useCallback, useRef, useEffect } from 'react';

interface BetSliderProps {
  min: number;
  max: number;
  value: number;
  potSize: number;
  onChange: (amount: number) => void;
}

const QUICK_BET_FRACTIONS = [
  { label: '1/3', fraction: 1 / 3 },
  { label: '1/2', fraction: 1 / 2 },
  { label: '2/3', fraction: 2 / 3 },
  { label: 'Pot', fraction: 1 },
];

const BetSlider: React.FC<BetSliderProps> = ({ min, max, value, potSize, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(String(value));
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10)),
    [min, max]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = clamp(Number(e.target.value));
      onChange(next);
    },
    [clamp, onChange]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed)) {
      setInputValue(String(value));
      return;
    }
    const clamped = clamp(parsed);
    onChange(clamped);
    setInputValue(String(clamped));
  }, [inputValue, value, clamp, onChange]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const handleQuickBet = useCallback(
    (fraction: number) => {
      const amount = clamp(potSize * fraction);
      onChange(amount);
    },
    [potSize, clamp, onChange]
  );

  const handleAllIn = useCallback(() => {
    onChange(max);
  }, [max, onChange]);

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Quick-bet buttons */}
      <div className="flex items-center gap-1.5">
        {QUICK_BET_FRACTIONS.map(({ label, fraction }) => {
          const amount = clamp(potSize * fraction);
          const isActive = value === amount;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickBet(fraction)}
              disabled={amount < min || amount > max}
              className={`
                flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed'
                }
              `}
            >
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleAllIn}
          className={`
            flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors
            ${
              value === max
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-red-400 hover:bg-red-500/20'
            }
          `}
        >
          All-in
        </button>
      </div>

      {/* Slider + Input row */}
      <div className="flex items-center gap-3">
        {/* Range slider */}
        <div className="relative flex-1 h-10 flex items-center">
          <div className="absolute inset-x-0 h-2 rounded-full bg-gray-700 pointer-events-none" />
          <div
            className="absolute left-0 h-2 rounded-full bg-emerald-600 pointer-events-none"
            style={{ width: `${percentage}%` }}
          />
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={max <= 20 ? 0.5 : 1}
            value={value}
            onChange={handleSliderChange}
            className="
              relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-400
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-emerald-400
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-600
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:cursor-grab
            "
          />
        </div>

        {/* Numeric input */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="
              w-16 py-1.5 px-2 text-center text-sm font-mono font-semibold
              bg-gray-900 text-white border border-gray-600 rounded-lg
              focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50
            "
          />
          <span className="text-xs text-gray-500 font-medium">BB</span>
        </div>
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] text-gray-500 px-0.5 -mt-1">
        <span>{min} BB</span>
        <span>Pot: {potSize} BB</span>
        <span>{max} BB</span>
      </div>
    </div>
  );
};

export default BetSlider;