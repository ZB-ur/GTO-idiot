import React, { useState, useCallback } from 'react';

export interface QuickAmount {
  label: string;
  value: number;
}

export interface BetSizerProps {
  minAmount: number;
  maxAmount: number;
  potSize: number;
  currentAmount: number;
  quickAmounts: QuickAmount[];
  onChange: (amount: number) => void;
}

const BetSizer: React.FC<BetSizerProps> = ({
  minAmount,
  maxAmount,
  potSize,
  currentAmount,
  quickAmounts,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(String(currentAmount));

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setInputValue(String(val));
      onChange(val);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setInputValue(raw);
      const num = Number(raw);
      if (!isNaN(num) && num >= minAmount && num <= maxAmount) {
        onChange(num);
      }
    },
    [onChange, minAmount, maxAmount],
  );

  const handleQuickClick = useCallback(
    (val: number) => {
      const clamped = Math.min(Math.max(val, minAmount), maxAmount);
      setInputValue(String(clamped));
      onChange(clamped);
    },
    [onChange, minAmount, maxAmount],
  );

  const percentage = maxAmount > minAmount
    ? ((currentAmount - minAmount) / (maxAmount - minAmount)) * 100
    : 0;

  return (
    <div className="w-full space-y-3">
      {/* Quick amount buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {quickAmounts.map((qa) => (
          <button
            key={qa.label}
            onClick={() => handleQuickClick(qa.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
              ${currentAmount === qa.value
                ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50'
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white'
              }
            `}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={0.5}
          value={currentAmount}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>

      {/* Amount display and input */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Min {minAmount}</span>
          <span className="text-gray-600 text-xs">|</span>
          <span className="text-gray-400 text-xs">Max {maxAmount}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-16 bg-transparent text-white text-sm font-semibold text-right outline-none tabular-nums"
          />
          <span className="text-gray-400 text-xs font-medium">BB</span>
        </div>
      </div>

      {/* Pot reference */}
      <div className="text-center text-gray-500 text-[10px]">
        Pot: {potSize} BB · {potSize > 0 ? ((currentAmount / potSize) * 100).toFixed(0) : 0}% pot
      </div>
    </div>
  );
};

export default BetSizer;