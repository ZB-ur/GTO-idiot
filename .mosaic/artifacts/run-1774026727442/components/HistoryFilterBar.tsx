import React, { useCallback } from 'react';

export type SeatPosition = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type ResultFilter = 'win' | 'loss' | 'breakeven';

export interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  position?: SeatPosition;
  result?: ResultFilter;
}

interface HistoryFilterBarProps {
  filters: HistoryFilters;
  onChange: (filters: HistoryFilters) => void;
  onReset: () => void;
}

const POSITIONS: SeatPosition[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const RESULTS: { value: ResultFilter; label: string; color: string }[] = [
  { value: 'win', label: 'Win', color: 'text-green-400' },
  { value: 'loss', label: 'Loss', color: 'text-red-400' },
  { value: 'breakeven', label: 'Even', color: 'text-gray-300' },
];

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.position || filters.result;

  const updateFilter = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange]
  );

  const togglePosition = useCallback(
    (pos: SeatPosition) => {
      updateFilter('position', filters.position === pos ? undefined : pos);
    },
    [filters.position, updateFilter]
  );

  const toggleResult = useCallback(
    (res: ResultFilter) => {
      updateFilter('result', filters.result === res ? undefined : res);
    },
    [filters.result, updateFilter]
  );

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Date Range */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) =>
                updateFilter('dateFrom', e.target.value || undefined)
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                         [color-scheme:dark]"
            />
          </div>
          <span className="text-gray-500 pb-1.5">–</span>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) =>
                updateFilter('dateTo', e.target.value || undefined)
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
                         [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-600" />

        {/* Position Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Position</label>
          <div className="flex gap-1">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePosition(pos)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all
                  ${
                    filters.position === pos
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                  }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-600" />

        {/* Result Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Result</label>
          <div className="flex gap-1">
            {RESULTS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => toggleResult(value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                  ${
                    filters.result === value
                      ? value === 'win'
                        ? 'bg-green-600/30 text-green-400 ring-1 ring-green-500/50'
                        : value === 'loss'
                        ? 'bg-red-600/30 text-red-400 ring-1 ring-red-500/50'
                        : 'bg-gray-600/50 text-gray-200 ring-1 ring-gray-400/50'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryFilterBar;