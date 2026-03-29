import React, { useCallback } from 'react';

export interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (dateFrom?: string, dateTo?: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateFrom, dateTo, onChange }) => {
  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value || undefined;
      onChange(val, dateTo);
    },
    [dateTo, onChange],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value || undefined;
      onChange(dateFrom, val);
    },
    [dateFrom, onChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined, undefined);
  }, [onChange]);

  const hasFilter = dateFrom || dateTo;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* From */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 text-xs font-medium">从</span>
        <input
          type="date"
          value={dateFrom ?? ''}
          onChange={handleFromChange}
          className="bg-gray-800 border border-gray-600 rounded-lg px-2.5 py-1.5 text-white text-xs
            focus:outline-none focus:border-emerald-500 transition-colors
            [color-scheme:dark]"
        />
      </div>

      <span className="text-gray-600 text-xs">—</span>

      {/* To */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 text-xs font-medium">至</span>
        <input
          type="date"
          value={dateTo ?? ''}
          onChange={handleToChange}
          className="bg-gray-800 border border-gray-600 rounded-lg px-2.5 py-1.5 text-white text-xs
            focus:outline-none focus:border-emerald-500 transition-colors
            [color-scheme:dark]"
        />
      </div>

      {/* Clear button */}
      {hasFilter && (
        <button
          onClick={handleClear}
          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-lg
            bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          清除
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;