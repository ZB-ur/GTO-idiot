import React, { useState, useCallback } from 'react';

export interface HandListFilterValues {
  position?: string;
  result?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface HandListFilterProps {
  filters: HandListFilterValues;
  onChange: (filters: HandListFilterValues) => void;
  onReset: () => void;
}

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;
const RESULTS = [
  { value: 'win', label: '盈利' },
  { value: 'lose', label: '亏损' },
  { value: 'break_even', label: '持平' },
] as const;
const SORT_OPTIONS = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'biggest_win', label: '最大盈利' },
  { value: 'biggest_loss', label: '最大亏损' },
] as const;

export const HandListFilter: React.FC<HandListFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    filters.position,
    filters.result,
    filters.startDate || filters.endDate,
  ].filter(Boolean).length;

  const handleChange = useCallback(
    (key: keyof HandListFilterValues, value: string) => {
      const next = { ...filters, [key]: value || undefined };
      onChange(next);
    },
    [filters, onChange]
  );

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <div className="w-full space-y-3">
      {/* Top bar: sort + toggle + reset */}
      <div className="flex items-center gap-3">
        {/* Sort dropdown - always visible */}
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-50 text-sm px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`
            h-9 px-3 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-colors
            ${
              expanded || activeCount > 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-50 hover:border-gray-600'
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          筛选
          {activeCount > 0 && (
            <span className="ml-0.5 w-5 h-5 rounded-full bg-emerald-500 text-gray-950 text-xs font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Reset */}
        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="h-9 px-3 rounded-lg text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            重置
          </button>
        )}
      </div>

      {/* Expandable filter panel */}
      {expanded && (
        <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 space-y-4">
          {/* Position filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              位置
            </label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    handleChange('position', filters.position === pos ? '' : pos)
                  }
                  className={`
                    h-8 px-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      filters.position === pos
                        ? 'bg-emerald-500 text-gray-950'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-50 hover:bg-gray-700'
                    }
                  `}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Result filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              结果
            </label>
            <div className="flex flex-wrap gap-2">
              {RESULTS.map((r) => (
                <button
                  key={r.value}
                  onClick={() =>
                    handleChange(
                      'result',
                      filters.result === r.value ? '' : r.value
                    )
                  }
                  className={`
                    h-8 px-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      filters.result === r.value
                        ? r.value === 'win'
                          ? 'bg-emerald-500 text-gray-950'
                          : r.value === 'lose'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-gray-950'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-50 hover:bg-gray-700'
                    }
                  `}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              时间范围
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="h-9 flex-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-50 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="开始日期"
              />
              <span className="text-gray-500 text-sm">至</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="h-9 flex-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-50 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                placeholder="结束日期"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandListFilter;