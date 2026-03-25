import React, { useCallback, useState } from 'react';

interface RaiseSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const formatBB = (amount: number): string =>
  amount % 1 === 0 ? `${amount}` : amount.toFixed(1);

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  min,
  max,
  value,
  onChange,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

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

  const handleInputBlur = useCallback(() => {
    const v = parseFloat(inputValue);
    if (isNaN(v) || v < min) {
      onChange(min);
      setInputValue(String(min));
    } else if (v > max) {
      onChange(max);
      setInputValue(String(max));
    }
  }, [inputValue, min, max, onChange]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Amount display */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Raise to</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={0.5}
            className="w-20 px-2 py-1 text-right text-sm font-bold text-emerald-400 bg-slate-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          <span className="text-xs font-medium text-gray-500">BB</span>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative py-2">
        <div className="relative h-2 bg-gray-700 rounded-full">
          <div
            className="absolute h-2 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 border-2 border-emerald-300 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-100"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] text-gray-500 font-medium">
        <span>Min {formatBB(min)} BB</span>
        <span>All-in {formatBB(max)} BB</span>
      </div>
    </div>
  );
};

export default RaiseSlider;