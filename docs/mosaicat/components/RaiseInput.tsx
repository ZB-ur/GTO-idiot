import React, { useCallback, useState } from 'react';

interface RaiseInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  error?: string;
}

const RaiseInput: React.FC<RaiseInputProps> = ({ value, onChange, min, max, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw === '') {
        onChange(min);
        return;
      }
      const num = parseInt(raw, 10);
      onChange(num);
    },
    [onChange, min],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (value < min) onChange(min);
    else if (value > max) onChange(max);
  }, [value, min, max, onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const isOutOfRange = value < min || value > max;
  const hasError = !!error || isOutOfRange;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-label="加注金额"
          aria-invalid={hasError}
          className={`
            w-full px-4 py-2.5 text-center text-lg font-semibold
            bg-white border-2 rounded-lg outline-none transition-all duration-150
            ${hasError
              ? 'border-red-500 text-red-600 focus:ring-2 focus:ring-red-200'
              : isFocused
                ? 'border-blue-600 text-gray-900 ring-2 ring-blue-100'
                : 'border-gray-200 text-gray-900 hover:border-gray-300'
            }
          `}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
          筹码
        </span>
      </div>
      {error ? (
        <p className="text-xs text-red-500 text-center" role="alert">{error}</p>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          范围 {min} – {max}
        </p>
      )}
    </div>
  );
};

export default RaiseInput;