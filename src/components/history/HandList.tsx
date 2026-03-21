// ============================================================
// GTO Idiot — Hand List Component
// Renders a paginated, filterable list of hand history entries
// with virtual-scroll-ready architecture (offset/limit paging).
// ============================================================

import { useState, useCallback } from 'react';
import type {
  HandSummary,
  Position,
  HandResultFilter,
  HandSortOrder,
  DeviationSeverity,
} from '../../types';
import { CardRow } from '../game/CardDisplay';

// ---------- Props ----------

interface HandListProps {
  hands: HandSummary[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onSelectHand: (handId: string) => void;
  /** Filter/sort controls */
  filters: HandListFilters;
  onFiltersChange: (filters: HandListFilters) => void;
}

export interface HandListFilters {
  position?: Position;
  result?: HandResultFilter;
  sort: HandSortOrder;
}

// ---------- Constants ----------

const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

const RESULT_OPTIONS: { value: HandResultFilter | ''; label: string }[] = [
  { value: '', label: 'All Results' },
  { value: 'win', label: 'Wins' },
  { value: 'lose', label: 'Losses' },
  { value: 'break_even', label: 'Break Even' },
];

const SORT_OPTIONS: { value: HandSortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'biggest_win', label: 'Biggest Win' },
  { value: 'biggest_loss', label: 'Biggest Loss' },
];

const SEVERITY_COLORS: Record<DeviationSeverity, string> = {
  minor: 'bg-yellow-500/20 text-yellow-400',
  moderate: 'bg-orange-500/20 text-orange-400',
  severe: 'bg-red-500/20 text-red-400',
};

const SEVERITY_LABELS: Record<DeviationSeverity, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
};

// ---------- Component ----------

export default function HandList({
  hands,
  total,
  hasMore,
  loading,
  onLoadMore,
  onSelectHand,
  filters,
  onFiltersChange,
}: HandListProps) {
  const [expandedFilters, setExpandedFilters] = useState(false);

  const handlePositionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      onFiltersChange({
        ...filters,
        position: val ? (val as Position) : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  const handleResultChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      onFiltersChange({
        ...filters,
        result: val ? (val as HandResultFilter) : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        sort: e.target.value as HandSortOrder,
      });
    },
    [filters, onFiltersChange],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400">
          {total} hand{total !== 1 ? 's' : ''}
        </span>

        <button
          onClick={() => setExpandedFilters((v) => !v)}
          className="rounded-md border border-gray-600 px-3 py-1.5 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
        >
          {expandedFilters ? 'Hide Filters' : 'Filters'}
        </button>

        {/* Sort is always visible */}
        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="ml-auto rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-xs text-gray-300"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expanded filter row */}
      {expandedFilters && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Position
            <select
              value={filters.position ?? ''}
              onChange={handlePositionChange}
              className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-gray-300"
            >
              <option value="">All</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Result
            <select
              value={filters.result ?? ''}
              onChange={handleResultChange}
              className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-gray-300"
            >
              {RESULT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Hand list */}
      <div className="flex flex-col gap-2">
        {hands.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-500">
            No hands found matching your filters.
          </div>
        )}

        {hands.map((hand) => (
          <HandListItem
            key={hand.id}
            hand={hand}
            onClick={() => onSelectHand(hand.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="mx-auto rounded-md border border-gray-600 px-6 py-2 text-sm text-gray-300 transition hover:border-green-500 hover:text-green-400 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// ---------- Hand List Item ----------

function HandListItem({
  hand,
  onClick,
}: {
  hand: HandSummary;
  onClick: () => void;
}) {
  const profitColor =
    hand.result_bb > 0
      ? 'text-green-400'
      : hand.result_bb < 0
        ? 'text-red-400'
        : 'text-gray-400';

  const profitSign = hand.result_bb > 0 ? '+' : '';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-left transition hover:border-gray-600 hover:bg-gray-800"
    >
      {/* Hand number */}
      <div className="flex w-12 flex-col items-center">
        <span className="text-xs text-gray-500">#{hand.hand_number}</span>
      </div>

      {/* Position badge */}
      <span className="w-10 rounded bg-gray-700 px-2 py-0.5 text-center text-xs font-medium text-gray-300">
        {hand.position}
      </span>

      {/* Hero cards */}
      <div className="w-20">
        {hand.hero_hand ? (
          <CardRow cards={hand.hero_hand} size="sm" />
        ) : (
          <span className="text-xs text-gray-600">--</span>
        )}
      </div>

      {/* Street reached */}
      <span className="w-16 text-xs text-gray-500 capitalize">
        {hand.street_reached}
      </span>

      {/* Deviation indicator */}
      <div className="w-20">
        {hand.has_deviation && hand.max_deviation_severity && (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_COLORS[hand.max_deviation_severity]}`}
          >
            {SEVERITY_LABELS[hand.max_deviation_severity]}
          </span>
        )}
      </div>

      {/* Result */}
      <span className={`ml-auto w-20 text-right text-sm font-semibold ${profitColor}`}>
        {profitSign}{hand.result_bb.toFixed(1)} BB
      </span>

      {/* Date */}
      <span className="w-24 text-right text-xs text-gray-500">
        {formatDate(hand.date)}
      </span>
    </button>
  );
}

// ---------- Helpers ----------

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
