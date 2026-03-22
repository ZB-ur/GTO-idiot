/**
 * DateRangeFilter — provides date range selection for stats queries.
 * Emits dateFrom/dateTo as ISO date strings.
 */

import React, { useCallback, useState } from 'react';

export interface DateRange {
  dateFrom?: string;
  dateTo?: string;
}

type Preset = 'all' | '7d' | '30d' | '90d' | 'custom';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function subtractDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const today = () => new Date().toISOString().slice(0, 10);

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const [preset, setPreset] = useState<Preset>('all');

  const handlePreset = useCallback(
    (p: Preset) => {
      setPreset(p);
      switch (p) {
        case 'all':
          onChange({});
          break;
        case '7d':
          onChange({ dateFrom: subtractDays(7), dateTo: today() });
          break;
        case '30d':
          onChange({ dateFrom: subtractDays(30), dateTo: today() });
          break;
        case '90d':
          onChange({ dateFrom: subtractDays(90), dateTo: today() });
          break;
        case 'custom':
          // Keep current values; user edits inputs
          break;
      }
    },
    [onChange],
  );

  const presetButton = (label: string, p: Preset) => (
    <button
      key={p}
      type="button"
      onClick={() => handlePreset(p)}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        preset === p
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presetButton('All Time', 'all')}
      {presetButton('7 Days', '7d')}
      {presetButton('30 Days', '30d')}
      {presetButton('90 Days', '90d')}
      {presetButton('Custom', 'custom')}

      {preset === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={value.dateFrom ?? ''}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })}
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600 focus:border-emerald-500 focus:outline-none"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={value.dateTo ?? ''}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value || undefined })}
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
