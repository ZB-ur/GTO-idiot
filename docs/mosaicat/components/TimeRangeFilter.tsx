import React from 'react';

type TimeRange = '100' | '500' | 'all';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
  { value: '100', label: '最近 100 手' },
  { value: '500', label: '最近 500 手' },
  { value: 'all', label: '全部' },
];

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="inline-flex items-center bg-gray-900 border border-gray-700 rounded-xl p-1 gap-0.5">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-emerald-500/40
              ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800 border border-transparent'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default TimeRangeFilter;