import React from 'react';

interface RaiseAmountInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  error?: string;
}

export const RaiseAmountInput: React.FC<RaiseAmountInputProps> = ({
  value,
  min,
  max,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={handleChange}
          className={`
            w-full px-4 py-2.5
            bg-gray-800 text-gray-50 text-lg font-bold text-center
            border ${error ? 'border-red-500' : 'border-gray-700 focus:border-amber-500'}
            rounded-xl
            outline-none transition-colors duration-150
            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          `}
        />
      </div>
      {error && (
        <span className="text-red-500 text-xs font-medium px-1">{error}</span>
      )}
    </div>
  );
};