import React, { useState, useCallback } from 'react';

interface RaiseSliderProps {
  min: number;
  max: number;
  step?: number;
  potSize: number;
  value: number;
  onChange: (value: number) => void;
  onConfirm: (value: number) => void;
  className?: string;
}

const quickBets = [
  { label: '1/2 Pot', factor: 0.5 },
  { label: '3/4 Pot', factor: 0.75 },
  { label: 'Pot', factor: 1 },
];

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  min,
  max,
  step = 0.5,
  potSize,
  value,
  onChange,
  onConfirm,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      onChange(v);
      setInputValue(String(v));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v >= min && v <= max) {
        onChange(v);
      }
    },
    [onChange, min, max],
  );

  const handleQuickBet = useCallback(
    (factor: number) => {
      const amount = Math.min(Math.max(Math.round(potSize * factor * 2) / 2, min), max);
      onChange(amount);
      setInputValue(String(amount));
    },
    [potSize, min, max, onChange],
  );

  const handleAllIn = useCallback(() => {
    onChange(max);
    setInputValue(String(max));
  }, [max, onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Quick bet buttons */}
      <div className="flex gap-2">
        {quickBets.map((qb) => (
          <button
            key={qb.label}
            onClick={() => handleQuickBet(qb.factor)}
            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            {qb.label}
          </button>
        ))}
        <button
          onClick={handleAllIn}
          className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors"
        >
          All-in
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-1">
          <span>{min} BB</span>
          <span>{max} BB</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 top-4 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>

      {/* Input + Confirm */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">BB</span>
        </div>
        <button
          onClick={() => onConfirm(value)}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Raise
        </button>
      </div>
    </div>
  );
};

export default RaiseSlider;