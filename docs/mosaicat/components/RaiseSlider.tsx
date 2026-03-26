import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface PresetRaise {
  label: string;
  amount: number;
}

export interface RaiseSliderProps {
  minAmount: number;
  maxAmount: number;
  presets: PresetRaise[];
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minAmount,
  maxAmount,
  presets,
  onConfirm,
  onCancel,
}) => {
  const [amount, setAmount] = useState(minAmount);
  const [inputValue, setInputValue] = useState(String(minAmount));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = useCallback(
    (val: number) => Math.min(Math.max(Math.round(val), minAmount), maxAmount),
    [minAmount, maxAmount],
  );

  const percentage = maxAmount > minAmount
    ? ((amount - minAmount) / (maxAmount - minAmount)) * 100
    : 0;

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(amount));
    }
  }, [amount, isEditing]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = clamp(Number(e.target.value));
    setAmount(val);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(String(amount));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      setAmount(clamp(parsed));
    } else {
      setInputValue(String(amount));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(String(amount));
      inputRef.current?.blur();
    }
  };

  const handlePresetClick = (preset: PresetRaise) => {
    setAmount(clamp(preset.amount));
  };

  const handleConfirm = () => {
    onConfirm(amount);
  };

  const isAllIn = amount === maxAmount;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      {/* Header: Amount Display + Input */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">加注到</span>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-24 text-right text-lg font-bold text-gray-900 bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            aria-label="加注金额"
          />
          {isAllIn && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              ALL IN
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-1 pb-1">
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-600 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          step={Math.max(1, Math.round((maxAmount - minAmount) / 200))}
          value={amount}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ top: '4px' }}
          aria-label="加注滑块"
        />
        {/* Custom thumb indicator */}
        <div
          className="absolute top-0 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md -translate-x-1/2 -translate-y-[6px] pointer-events-none transition-all duration-75"
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{minAmount.toLocaleString()}</span>
        <span>{maxAmount.toLocaleString()}</span>
      </div>

      {/* Preset Buttons */}
      {presets.length > 0 && (
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                amount === clamp(preset.amount)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
              aria-label={`预设加注 ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setAmount(maxAmount)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
              isAllIn
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-slate-50 text-red-500 border-gray-200 hover:bg-red-50 hover:border-red-300'
            }`}
            aria-label="全下"
          >
            All In
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-slate-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${
            isAllIn
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isAllIn ? `All In ${amount.toLocaleString()}` : `加注 ${amount.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default RaiseSlider;