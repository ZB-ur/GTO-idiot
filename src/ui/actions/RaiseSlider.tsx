import React, { useState, useCallback } from 'react';

export interface RaiseSliderProps {
  min: number;
  max: number;
  presets?: { label: string; amount: number }[];
  potSize?: number;
  onRaise: (amount: number) => void;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

const RaiseSlider: React.FC<RaiseSliderProps> = ({ min, max, presets, potSize, onRaise }) => {
  const [value, setValue] = useState(min);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  }, []);

  const handlePresetClick = useCallback((amount: number) => {
    setValue(amount);
  }, []);

  const handleConfirmRaise = useCallback(() => {
    onRaise(value);
  }, [onRaise, value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      setValue(Math.max(min, Math.min(max, num)));
    }
  }, [min, max]);

  // Compute slider fill percentage
  const range = max - min;
  const fillPercent = range > 0 ? ((value - min) / range) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 w-full" aria-label="Raise controls">
      {/* Preset buttons */}
      {presets && presets.length > 0 && (
        <div className="flex gap-1.5 flex-wrap justify-center">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.amount)}
              className={`
                px-3 py-1 text-xs font-semibold rounded-md
                transition-colors duration-150
                ${value === preset.amount
                  ? 'bg-yellow-500 text-black'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
                border border-slate-600
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-mono w-12 text-right">{formatAmount(min)}</span>
        <div className="relative flex-1 h-6 flex items-center">
          <div className="absolute inset-x-0 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-75"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={Math.max(1, Math.floor(range / 100))}
            value={value}
            onChange={handleSliderChange}
            className="
              absolute inset-x-0 w-full h-2 opacity-0 cursor-pointer
            "
            aria-label="Raise amount slider"
          />
          {/* Custom thumb indicator */}
          <div
            className="absolute w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-lg pointer-events-none"
            style={{
              left: `calc(${fillPercent}% - 10px)`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono w-12">{formatAmount(max)}</span>
      </div>

      {/* Amount input + Raise button */}
      <div className="flex items-center gap-2 justify-center">
        <div className="relative">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={handleInputChange}
            className="
              w-24 px-3 py-1.5 text-center text-sm font-bold
              bg-slate-800 border border-slate-600 rounded-md
              text-yellow-300 focus:border-yellow-500 focus:outline-none
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            "
            aria-label="Raise amount input"
          />
        </div>
        <button
          type="button"
          onClick={handleConfirmRaise}
          className="
            px-6 py-1.5 text-sm font-bold rounded-md
            bg-gradient-to-b from-yellow-500 to-yellow-600
            text-black shadow-lg
            hover:from-yellow-400 hover:to-yellow-500
            active:from-yellow-600 active:to-yellow-700
            transition-all duration-150
          "
        >
          Raise to {formatAmount(value)}
        </button>
      </div>

      {/* Pot reference */}
      {potSize !== undefined && potSize > 0 && (
        <div className="text-center text-[10px] text-slate-500">
          Pot: {formatAmount(potSize)} · {range > 0 ? ((value / potSize) * 100).toFixed(0) : 0}% of pot
        </div>
      )}
    </div>
  );
};

export default RaiseSlider;
