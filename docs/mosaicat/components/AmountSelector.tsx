import React, { useState, useCallback } from 'react';

interface AmountSelectorProps {
  min: number;
  max: number;
  potSize: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

const QUICK_SIZES = [
  { label: '1/3 Pot', factor: 1 / 3 },
  { label: '1/2 Pot', factor: 1 / 2 },
  { label: '2/3 Pot', factor: 2 / 3 },
  { label: 'Pot', factor: 1 },
];

export const AmountSelector: React.FC<AmountSelectorProps> = ({
  min,
  max,
  potSize,
  onConfirm,
  onCancel,
}) => {
  const [amount, setAmount] = useState(min);

  const clamp = useCallback(
    (val: number) => Math.max(min, Math.min(max, Math.round(val * 10) / 10)),
    [min, max],
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(clamp(parseFloat(e.target.value)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setAmount(clamp(val));
    }
  };

  const handleQuickSize = (factor: number) => {
    setAmount(clamp(potSize * factor));
  };

  const percentage = ((amount - min) / (max - min)) * 100;

  return (
    <div className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
      {/* Quick Amount Buttons */}
      <div className="flex gap-2">
        {QUICK_SIZES.map(({ label, factor }) => {
          const quickVal = clamp(potSize * factor);
          return (
            <button
              key={label}
              onClick={() => handleQuickSize(factor)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                amount === quickVal
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={() => setAmount(max)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            amount === max
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          All In
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={amount}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">{min} BB</span>
          <span className="text-[10px] text-gray-500">{max} BB</span>
        </div>
      </div>

      {/* Numeric Input + Confirm/Cancel */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 flex-1">
          <input
            type="number"
            value={amount}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={0.5}
            className="w-full bg-transparent text-gray-50 text-sm font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-gray-500 ml-1">BB</span>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-600 transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onConfirm(amount)}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold transition-colors"
        >
          确认
        </button>
      </div>
    </div>
  );
};