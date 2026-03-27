import React from 'react';

type FilterType = 'all' | 'errors_only';

interface HandListFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'errors_only', label: '仅 ❌ 错误决策' },
];

export const HandListFilterBar: React.FC<HandListFilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${
              activeFilter === key
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};