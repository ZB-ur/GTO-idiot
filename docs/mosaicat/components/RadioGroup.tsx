import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
}) => {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-gray-50 mb-1">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-amber-500' : 'border-gray-600'
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className={`text-sm ${isSelected ? 'text-gray-50 font-medium' : 'text-gray-400'}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};