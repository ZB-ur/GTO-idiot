import React, { useState } from 'react';

interface Filters {
  dateRange?: [string, string];
  resultType?: 'won' | 'lost' | 'folded';
}

interface HandHistoryFilterProps {
  onFilterChange: (filters: Filters) => void;
}

export const HandHistoryFilter: React.FC<HandHistoryFilterProps> = ({ onFilterChange }) => {
  const [activeResult, setActiveResult] = useState<string | null>(null);

  const resultTypes = [
    { key: 'won', label: 'Won', color: 'bg-green-100 text-green-700 border-green-300' },
    { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700 border-red-300' },
    { key: 'folded', label: 'Folded', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  ];

  const handleResultClick = (key: string) => {
    const newActive = activeResult === key ? null : key;
    setActiveResult(newActive);
    onFilterChange({
      resultType: newActive as Filters['resultType'],
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl">
      {/* Result type toggles */}
      <div className="flex gap-2">
        {resultTypes.map((rt) => (
          <button
            key={rt.key}
            onClick={() => handleResultClick(rt.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              activeResult === rt.key ? rt.color : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Date inputs */}
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          onChange={(e) => onFilterChange({ dateRange: [e.target.value, ''] })}
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          onChange={(e) => onFilterChange({ dateRange: ['', e.target.value] })}
        />
      </div>
    </div>
  );
};

export default HandHistoryFilter;