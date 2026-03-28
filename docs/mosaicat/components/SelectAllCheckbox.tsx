import React, { useCallback, useEffect, useRef } from 'react';

interface SelectAllCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  label,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  const isActive = checked || indeterminate;

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div
        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
          isActive
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-200 hover:border-blue-400'
        }`}
      >
        {checked && !indeterminate && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
        {indeterminate && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 6h6" />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-600">{label}</span>
      )}
    </label>
  );
};

export default SelectAllCheckbox;