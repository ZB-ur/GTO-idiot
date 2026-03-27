import React from 'react';

interface StackSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const STACK_OPTIONS = [50, 100, 200] as const;

export const StackSizeSelector: React.FC<StackSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-400">
        Starting Stack
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 pr-10 text-base text-gray-50 shadow-sm transition-colors hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {STACK_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} BB
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <span className="text-xs text-gray-500">
        {value === 50 ? 'Short stack — high variance' : value === 100 ? 'Standard — recommended' : 'Deep stack — advanced play'}
      </span>
    </div>
  );
};

export default StackSizeSelector;