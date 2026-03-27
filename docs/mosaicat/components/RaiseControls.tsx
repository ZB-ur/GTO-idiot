import React, { useState, useCallback } from 'react';

interface RaiseControlsProps {
  minAmount: number;
  maxAmount: number;
  potSize: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

interface PresetButton {
  label: string;
  getAmount: (min: number, max: number, pot: number) => number;
}

const PRESETS: PresetButton[] = [
  { label: '2x', getAmount: (min) => min * 2 },
  { label: '3x', getAmount: (min) => min * 3 },
  { label: 'Pot', getAmount: (_min, _max, pot) => pot },
  { label: 'All-in', getAmount: (_min, max) => max },
];

export const RaiseControls: React.FC<RaiseControlsProps> = ({
  minAmount,
  maxAmount,
  potSize,
  onConfirm,
  onCancel,
}) => {
  const [amount, setAmount] = useState(minAmount);

  const clamp = useCallback(
    (val: number) => Math.min(maxAmount, Math.max(minAmount, val)),
    [minAmount, maxAmount],
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(clamp(Number(e.target.value)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setAmount(clamp(val));
    }
  };

  const handlePreset = (preset: PresetButton) => {
    const val = clamp(preset.getAmount(minAmount, maxAmount, potSize));
    setAmount(val);
  };

  const handleConfirm = () => {
    onConfirm(amount);
  };

  const isAllIn = amount === maxAmount;

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {/* Preset buttons */}
      <div className="flex items-center gap-2">
        {PRESETS.map((preset) => {
          const presetVal = clamp(preset.getAmount(minAmount, maxAmount, potSize));
          const isActive = amount === presetVal;
          return (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={`
                flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold
                transition-colors duration-150
                ${isActive
                  ? 'bg-amber-500 text-gray-950'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-gray-50'
                }
              `}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 tabular-nums w-8 text-right">{minAmount}</span>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          value={amount}
          onChange={handleSliderChange}
          className="
            flex-1 h-2 rounded-full appearance-none cursor-pointer
            bg-gray-700 accent-amber-500
          "
        />
        <span className="text-xs text-gray-500 tabular-nums w-8">{maxAmount}</span>
      </div>

      {/* Input + Confirm / Cancel */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min={minAmount}
            max={maxAmount}
            value={amount}
            onChange={handleInputChange}
            className="
              w-full px-3 py-2 rounded-lg text-sm font-bold tabular-nums
              bg-gray-800 border border-gray-700 text-gray-50
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
            "
          />
          {isAllIn && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-400">
              ALL-IN
            </span>
          )}
        </div>
        <button
          onClick={handleConfirm}
          className="
            px-5 py-2 rounded-lg text-sm font-bold
            bg-amber-500 text-gray-950 hover:bg-amber-400
            transition-colors duration-150
          "
        >
          Raise
        </button>
        <button
          onClick={onCancel}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-gray-800 text-gray-400 border border-gray-700
            hover:bg-gray-700 hover:text-gray-50
            transition-colors duration-150
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RaiseControls;