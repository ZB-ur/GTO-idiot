import React, { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
          value
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
        }`}
      >
        <span>{selectedLabel ?? label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-md py-1 max-h-60 overflow-auto">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-700/50 transition-colors"
            >
              清除选择
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                option.value === value
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;