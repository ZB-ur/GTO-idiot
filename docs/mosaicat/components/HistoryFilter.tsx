import React from 'react';

interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  blindLevel?: string;
  profitFilter?: string;
}

interface HistoryFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

const blindOptions = ['All', '1/2', '2/5', '5/10'];
const profitOptions = [
  { value: 'all', label: 'All' },
  { value: 'profit', label: 'Profit' },
  { value: 'loss', label: 'Loss' },
];

export const HistoryFilter: React.FC<HistoryFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasFilters =
    filters.dateFrom || filters.dateTo || filters.blindLevel || (filters.profitFilter && filters.profitFilter !== 'all');

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase">From</label>
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase">To</label>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <select
        value={filters.blindLevel ?? 'All'}
        onChange={(e) =>
          onChange({ ...filters, blindLevel: e.target.value === 'All' ? undefined : e.target.value })
        }
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {blindOptions.map((o) => (
          <option key={o} value={o}>{o === 'All' ? 'All Blinds' : o}</option>
        ))}
      </select>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {profitOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange({ ...filters, profitFilter: o.value })}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              (filters.profitFilter ?? 'all') === o.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hasFilters && (
        <button
          onClick={onReset}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors ml-auto"
        >
          Reset
        </button>
      )}
    </div>
  );
};