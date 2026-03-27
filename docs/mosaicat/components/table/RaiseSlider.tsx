import React from 'react';

interface RaiseSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({ value, min, max, onChange }) => {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const isAllIn = value >= max;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>Min {min}</span>
        {isAllIn && (
          <span className="text-red-500 font-bold text-xs uppercase tracking-wider">All In</span>
        )}
        <span>Max {max}</span>
      </div>
      <div className="relative w-full h-8 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none bg-gray-700 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
          "
          style={{
            background: `linear-gradient(to right, #f59e0b ${percentage}%, #374151 ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
};