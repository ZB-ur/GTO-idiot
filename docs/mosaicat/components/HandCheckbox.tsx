import React, { useCallback } from 'react';

interface HandCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const HandCheckbox: React.FC<HandCheckboxProps> = ({
  checked,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div
        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-200 hover:border-blue-400'
        }`}
      >
        {checked && (
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
      </div>
    </label>
  );
};

export default HandCheckbox;