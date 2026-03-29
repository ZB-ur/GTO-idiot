import React from 'react';

export type HandRangeValue = 'last_100' | 'last_500' | 'all';

interface TimeRangeSelectorProps {
  value: HandRangeValue;
  onChange: (range: HandRangeValue) => void;
}

const options: { value: HandRangeValue; label: string }[] = [
  { value: 'last_100', label: '近100手' },
  { value: 'last_500', label: '近500手' },
  { value: 'all', label: '全部' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-lg bg-slate-100 p-1">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150
              ${isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default TimeRangeSelector;