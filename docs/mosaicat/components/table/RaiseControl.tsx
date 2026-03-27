import React, { useState, useCallback, useEffect } from 'react';
import { RaiseSlider } from './RaiseSlider';
import { RaiseAmountInput } from './RaiseAmountInput';

interface RaiseControlProps {
  label: '加注' | '下注';
  minAmount: number;
  maxAmount: number;
  onSubmit: (amount: number) => void;
  disabled?: boolean;
}

export const RaiseControl: React.FC<RaiseControlProps> = ({
  label,
  minAmount,
  maxAmount,
  onSubmit,
  disabled = false,
}) => {
  const [amount, setAmount] = useState(minAmount);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setAmount(minAmount);
    setError(undefined);
  }, [minAmount, maxAmount]);

  const handleAmountChange = useCallback(
    (value: number) => {
      setAmount(value);
      if (value < minAmount) {
        setError(`最小${label}额 ${minAmount}`);
      } else if (value > maxAmount) {
        setError(`最大${label}额 ${maxAmount}`);
      } else {
        setError(undefined);
      }
    },
    [minAmount, maxAmount, label],
  );

  const handleSubmit = useCallback(() => {
    const clamped = Math.max(minAmount, Math.min(maxAmount, amount));
    onSubmit(clamped);
  }, [amount, minAmount, maxAmount, onSubmit]);

  const isAllIn = amount >= maxAmount;
  const presets = [
    { label: '1/3 底池', factor: 0.33 },
    { label: '1/2 底池', factor: 0.5 },
    { label: '底池', factor: 1.0 },
  ];

  return (
    <div className={`flex flex-col gap-3 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Preset buttons */}
      <div className="flex items-center gap-2">
        {presets.map((preset) => {
          const presetAmount = Math.max(
            minAmount,
            Math.min(maxAmount, Math.round(minAmount + (maxAmount - minAmount) * preset.factor)),
          );
          return (
            <button
              key={preset.label}
              onClick={() => handleAmountChange(presetAmount)}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <RaiseSlider value={amount} min={minAmount} max={maxAmount} onChange={handleAmountChange} />

      {/* Amount input + submit button */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <RaiseAmountInput
            value={amount}
            min={minAmount}
            max={maxAmount}
            onChange={handleAmountChange}
            error={error}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !!error}
          className={`
            px-5 py-2.5 rounded-xl font-bold text-base transition-all duration-150
            ${isAllIn
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
              : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-lg shadow-amber-900/30'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isAllIn ? 'All In' : label}
        </button>
      </div>
    </div>
  );
};