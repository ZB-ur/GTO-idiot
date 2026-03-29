import React, { useCallback } from 'react';

export interface FilterState {
  dateFrom: string | null;
  dateTo: string | null;
  scenarios: string[];
  profitMin: number | null;
  profitMax: number | null;
}

export const SCENARIO_OPTIONS = [
  { value: 'open_raise', label: 'Open Raise' },
  { value: '3bet_pot', label: '3-Bet Pot' },
  { value: '4bet_pot', label: '4-Bet Pot' },
  { value: 'single_raised_pot', label: 'Single Raised Pot' },
  { value: 'limp_pot', label: 'Limp Pot' },
  { value: 'river_bluff', label: 'River Bluff' },
  { value: 'check_raise', label: 'Check-Raise' },
  { value: 'all_in_preflop', label: 'All-In Preflop' },
] as const;

export interface HandHistoryFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const HandHistoryFilter: React.FC<HandHistoryFilterProps> = ({
  filters,
  onChange,
}) => {
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange]
  );

  const toggleScenario = useCallback(
    (scenario: string) => {
      const next = filters.scenarios.includes(scenario)
        ? filters.scenarios.filter((s) => s !== scenario)
        : [...filters.scenarios, scenario];
      updateFilter('scenarios', next);
    },
    [filters.scenarios, updateFilter]
  );

  const handleReset = useCallback(() => {
    onChange({
      dateFrom: null,
      dateTo: null,
      scenarios: [],
      profitMin: null,
      profitMax: null,
    });
  }, [onChange]);

  const hasActiveFilters =
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.scenarios.length > 0 ||
    filters.profitMin !== null ||
    filters.profitMax !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            重置筛选
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">日期范围</label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) =>
              updateFilter('dateFrom', e.target.value || null)
            }
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="开始日期"
          />
          <span className="text-gray-400 text-sm">至</span>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) =>
              updateFilter('dateTo', e.target.value || null)
            }
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Scenario Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">场景类型</label>
        <div className="flex flex-wrap gap-2">
          {SCENARIO_OPTIONS.map((opt) => {
            const active = filters.scenarios.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleScenario(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profit/Loss Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          盈亏范围 <span className="text-gray-400 font-normal">(BB)</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              value={filters.profitMin ?? ''}
              onChange={(e) =>
                updateFilter(
                  'profitMin',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="最小值"
            />
          </div>
          <span className="text-gray-400 text-sm">至</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={filters.profitMax ?? ''}
              onChange={(e) =>
                updateFilter(
                  'profitMax',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="最大值"
            />
          </div>
        </div>
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            已启用 {[
              filters.dateFrom || filters.dateTo ? '日期' : null,
              filters.scenarios.length > 0 ? `${filters.scenarios.length} 个场景` : null,
              filters.profitMin !== null || filters.profitMax !== null ? '盈亏' : null,
            ].filter(Boolean).join('、')} 筛选
          </p>
        </div>
      )}
    </div>
  );
};

export default HandHistoryFilter;