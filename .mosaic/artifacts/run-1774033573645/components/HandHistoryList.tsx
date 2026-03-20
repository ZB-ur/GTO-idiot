import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────
interface HandSummary {
  id: string;
  sessionId: string;
  handNumber: number;
  humanPosition: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  profitLossBB: number;
  scenarioTags: string[];
  showdown: boolean;
  createdAt: string;
}

interface SessionGroup {
  sessionId: string;
  date: string;
  hands: HandSummary[];
  totalProfitBB: number;
  handCount: number;
}

interface FilterState {
  sessionId?: string;
  dateFrom?: string;
  dateTo?: string;
  scenarios: string[];
  profitMin?: number;
  profitMax?: number;
}

interface ExportOptions {
  format: 'hh_text' | 'json';
  handIds?: string[];
  sessionId?: string;
}

// ── Sub-components (children stubs) ────────────────────────────

interface HandHistoryCardProps {
  hand: HandSummary;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReplay: (id: string) => void;
}

const HandHistoryCard: React.FC<HandHistoryCardProps> = ({
  hand,
  isSelected,
  onSelect,
  onReplay,
}) => {
  const isProfit = hand.profitLossBB >= 0;

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white border rounded-xl transition-all cursor-pointer hover:shadow-sm ${
        isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-200'
      }`}
      onClick={() => onSelect(hand.id)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(hand.id)}
        className="w-4 h-4 text-blue-600 rounded border-gray-300"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Hand number */}
      <div className="w-16 text-sm font-mono text-gray-500">
        #{hand.handNumber}
      </div>

      {/* Position badge */}
      <span className="inline-flex items-center justify-center w-10 h-6 text-xs font-semibold rounded-lg bg-slate-100 text-gray-700">
        {hand.humanPosition}
      </span>

      {/* Scenario tags */}
      <div className="flex-1 flex flex-wrap gap-1.5">
        {hand.scenarioTags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-lg bg-blue-50 text-blue-700"
          >
            {tag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Showdown indicator */}
      {hand.showdown && (
        <span className="text-xs text-gray-400">SD</span>
      )}

      {/* Profit/Loss */}
      <div
        className={`w-20 text-right text-sm font-semibold ${
          isProfit ? 'text-emerald-600' : 'text-red-500'
        }`}
      >
        {isProfit ? '+' : ''}
        {hand.profitLossBB.toFixed(1)} BB
      </div>

      {/* Replay button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReplay(hand.id);
        }}
        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        Replay
      </button>
    </div>
  );
};

// ── Filter Bar ─────────────────────────────────────────────────

const SCENARIO_OPTIONS = [
  { value: 'open_raise', label: 'Open Raise' },
  { value: '3bet_pot', label: '3-Bet Pot' },
  { value: '4bet_pot', label: '4-Bet Pot' },
  { value: 'single_raised_pot', label: 'SRP' },
  { value: 'river_bluff', label: 'River Bluff' },
  { value: 'check_raise', label: 'Check Raise' },
  { value: 'all_in_preflop', label: 'All-in Pre' },
];

interface HandHistoryFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

const HandHistoryFilter: React.FC<HandHistoryFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const activeCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.scenarios.length > 0,
    filters.profitMin !== undefined,
    filters.profitMax !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Reset ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date range */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value || undefined })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) =>
              onChange({ ...filters, dateTo: e.target.value || undefined })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profit range */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Min Profit (BB)
          </label>
          <input
            type="number"
            value={filters.profitMin ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                profitMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="-100"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Max Profit (BB)
          </label>
          <input
            type="number"
            value={filters.profitMax ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                profitMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="+200"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Scenario chips */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">Scenarios</label>
        <div className="flex flex-wrap gap-2">
          {SCENARIO_OPTIONS.map((opt) => {
            const active = filters.scenarios.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  const next = active
                    ? filters.scenarios.filter((s) => s !== opt.value)
                    : [...filters.scenarios, opt.value];
                  onChange({ ...filters, scenarios: next });
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Export Button & Modal ──────────────────────────────────────

interface ExportButtonProps {
  selectedCount: number;
  onClick: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ selectedCount, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Export{selectedCount > 0 ? ` (${selectedCount})` : ''}
  </button>
);

interface ExportModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  selectedCount,
  onClose,
  onExport,
}) => {
  const [format, setFormat] = useState<'hh_text' | 'json'>('hh_text');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Export Hands</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {selectedCount > 0
            ? `${selectedCount} hand(s) selected for export.`
            : 'All hands matching current filters will be exported.'}
        </p>

        {/* Format selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('hh_text')}
              className={`p-3 text-left border rounded-lg transition-colors ${
                format === 'hh_text'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">HH Text</div>
              <div className="text-xs text-gray-500 mt-0.5">
                PokerTracker compatible
              </div>
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`p-3 text-left border rounded-lg transition-colors ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">JSON</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Full structured data
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport({ format })}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Empty State ────────────────────────────────────────────────

const EmptyState: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">
      {hasFilters ? 'No hands match your filters' : 'No hand history yet'}
    </h3>
    <p className="text-sm text-gray-500 mt-1 max-w-xs">
      {hasFilters
        ? 'Try adjusting your filters or resetting them to see all hands.'
        : 'Start a new session and play some hands to see your history here.'}
    </p>
  </div>
);

// ── Main Component ─────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = { scenarios: [] };

const HandHistoryList: React.FC = () => {
  const [hands, setHands] = useState<HandSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch hands
  const fetchHands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sessionId) params.set('sessionId', filters.sessionId);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.profitMin !== undefined)
        params.set('profitMin', String(filters.profitMin));
      if (filters.profitMax !== undefined)
        params.set('profitMax', String(filters.profitMax));
      filters.scenarios.forEach((s) => params.append('scenario', s));
      params.set('limit', String(pageSize));
      params.set('offset', String(page * pageSize));

      const res = await fetch(`/api/hands?${params}`);
      const data = await res.json();
      setHands(data.hands);
      setTotal(data.total);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHands();
  }, [fetchHands]);

  // Group by session
  const sessionGroups = useMemo<SessionGroup[]>(() => {
    const map = new Map<string, HandSummary[]>();
    hands.forEach((h) => {
      const list = map.get(h.sessionId) || [];
      list.push(h);
      map.set(h.sessionId, list);
    });
    return Array.from(map.entries()).map(([sessionId, items]) => ({
      sessionId,
      date: new Date(items[0].createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      hands: items,
      totalProfitBB: items.reduce((sum, h) => sum + h.profitLossBB, 0),
      handCount: items.length,
    }));
  }, [hands]);

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === hands.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(hands.map((h) => h.id)));
    }
  };

  const handleReplay = (handId: string) => {
    // Navigate to replay view
    window.location.href = `/replay/${handId}`;
  };

  const handleExport = async (options: ExportOptions) => {
    const body: any = { format: options.format };
    if (selectedIds.size > 0) {
      body.handIds = Array.from(selectedIds);
    }
    try {
      const res = await fetch('/api/export/hands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      // Trigger download
      const blob = new Blob([result.data], {
        type: options.format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || `hands.${options.format === 'json' ? 'json' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handle error
    }
    setExportOpen(false);
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasFiltersActive =
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.scenarios.length > 0 ||
    filters.profitMin !== undefined ||
    filters.profitMax !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hand History</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} hand{total !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showFilters || hasFiltersActive
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {hasFiltersActive && (
              <span className="w-5 h-5 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center">
                {[filters.dateFrom, filters.dateTo, filters.scenarios.length > 0, filters.profitMin !== undefined, filters.profitMax !== undefined].filter(Boolean).length}
              </span>
            )}
          </button>
          <ExportButton
            selectedCount={selectedIds.size}
            onClick={() => setExportOpen(true)}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <HandHistoryFilter
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
          onReset={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(0);
          }}
        />
      )}

      {/* Select all bar */}
      {hands.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <input
            type="checkbox"
            checked={selectedIds.size === hands.length && hands.length > 0}
            onChange={selectAll}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <span className="text-sm text-gray-500">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : 'Select all'}
          </span>
        </div>
      )}

      {/* Hand List (grouped by session) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : hands.length === 0 ? (
        <EmptyState hasFilters={hasFiltersActive} />
      ) : (
        <div className="space-y-8">
          {sessionGroups.map((group) => (
            <div key={group.sessionId} className="space-y-2">
              {/* Session header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-700">
                    {group.date}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {group.handCount} hand{group.handCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    group.totalProfitBB >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {group.totalProfitBB >= 0 ? '+' : ''}
                  {group.totalProfitBB.toFixed(1)} BB
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {group.hands.map((hand) => (
                  <HandHistoryCard
                    key={hand.id}
                    hand={hand}
                    isSelected={selectedIds.has(hand.id)}
                    onSelect={toggleSelect}
                    onReplay={handleReplay}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-3">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportOpen}
        selectedCount={selectedIds.size}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default HandHistoryList;