import React from 'react';

type TrendRange = 20 | 50 | 100;

interface TrendRangeSelectorProps {
  value: TrendRange;
  onChange: (n: TrendRange) => void;
}

const options: TrendRange[] = [20, 50, 100];

export const TrendRangeSelector: React.FC<TrendRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-gray-800 p-1">
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150
            ${
              value === n
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }
          `}
        >
          {n}局
        </button>
      ))}
    </div>
  );
};

export default TrendRangeSelector;