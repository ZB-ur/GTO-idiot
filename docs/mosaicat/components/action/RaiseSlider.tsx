import React from 'react';

interface RaiseSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const RaiseSlider: React.FC<RaiseSliderProps> = ({ min, max, value, onChange }) => {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Min: {min.toLocaleString()}</span>
        <span className="font-semibold text-gray-900">{value.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
      <div className="relative w-full h-10 flex items-center">
        <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md pointer-events-none transition-all duration-75"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between gap-2">
        {[0.5, 0.75, 1].map((fraction) => {
          const presetValue = Math.round(min + (max - min) * fraction);
          return (
            <button
              key={fraction}
              onClick={() => onChange(Math.min(presetValue, max))}
              className="flex-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {fraction === 1 ? 'Max' : `${fraction * 100}%`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RaiseSlider;