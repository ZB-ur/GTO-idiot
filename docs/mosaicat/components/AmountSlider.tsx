import React, { useCallback } from 'react';

interface AmountSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const AmountSlider: React.FC<AmountSliderProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-sm text-gray-400">
        <span>Min {min}</span>
        <span className="text-amber-400 font-semibold text-base">{value}</span>
        <span>All-in {max}</span>
      </div>
      <div className="relative w-full h-2">
        {/* Track background */}
        <div className="absolute inset-0 rounded-full bg-gray-700" />
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-950
            [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-400
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-950"
        />
      </div>
    </div>
  );
};