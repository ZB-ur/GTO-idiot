import React from 'react';

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (from: string, to: string) => void;
}

const PRESET_RANGES = [
  { label: '近7天', days: 7 },
  { label: '近30天', days: 30 },
  { label: '近90天', days: 90 },
] as const;

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getPresetRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: formatDateForInput(from), to: formatDateForInput(to) };
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom = '',
  dateTo = '',
  onChange,
}) => {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, dateTo);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(dateFrom, e.target.value);
  };

  const handlePreset = (days: number) => {
    const range = getPresetRange(days);
    onChange(range.from, range.to);
  };

  const handleClear = () => {
    onChange('', '');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Preset buttons */}
      <div className="flex items-center gap-1">
        {PRESET_RANGES.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => handlePreset(days)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={handleFromChange}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="开始日期"
        />
        <span className="text-gray-400 text-sm">至</span>
        <input
          type="date"
          value={dateTo}
          onChange={handleToChange}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {(dateFrom || dateTo) && (
        <button
          onClick={handleClear}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm"
          title="清除筛选"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;