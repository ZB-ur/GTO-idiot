import React, { useCallback } from 'react';

interface RaiseAmountInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const RaiseAmountInput: React.FC<RaiseAmountInputProps> = ({ min, max, value, onChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw === '') return;
      const num = Number(raw);
      onChange(num);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    if (value < min) onChange(min);
    else if (value > max) onChange(max);
  }, [value, min, max, onChange]);

  const isOutOfRange = value < min || value > max;

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.toLocaleString()}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            w-full pl-7 pr-4 py-3 rounded-xl text-base font-semibold text-gray-900
            border transition-colors duration-150 outline-none
            ${isOutOfRange
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
          `}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>Min: {min.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default RaiseAmountInput;