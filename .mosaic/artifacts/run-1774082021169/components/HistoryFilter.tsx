'use client';

import type { Position } from '@/engine/types';

interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  position?: Position;
  result?: 'win' | 'loss' | 'all';
}

interface HistoryFilterProps {
  filters: HistoryFilters;
  onChange: (filters: HistoryFilters) => void;
}

const POSITIONS: (Position | 'all')[] = ['all', 'UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
const RESULTS: { value: 'win' | 'loss' | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'win', label: 'Wins' },
  { value: 'loss', label: 'Losses' },
];

export default function HistoryFilter({ filters, onChange }: HistoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-xs">From</label>
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <label className="text-gray-400 text-xs">To</label>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-700" />

      {/* Position filter */}
      <div className="flex items-center gap-1">
        <label className="text-gray-400 text-xs mr-1">Position</label>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() =>
              onChange({ ...filters, position: pos === 'all' ? undefined : (pos as Position) })
            }
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
              (pos === 'all' && !filters.position) || filters.position === pos
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {pos === 'all' ? 'All' : pos}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-700" />

      {/* Result filter */}
      <div className="flex items-center gap-1">
        <label className="text-gray-400 text-xs mr-1">Result</label>
        {RESULTS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() =>
              onChange({ ...filters, result: r.value === 'all' ? undefined : r.value as 'win' | 'loss' })
            }
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              (r.value === 'all' && !filters.result) || filters.result === r.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}