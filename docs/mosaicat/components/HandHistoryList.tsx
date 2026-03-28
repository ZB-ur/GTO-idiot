import React, { useState, useEffect, useCallback } from 'react';

// --- Types ---
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface HandHistorySummary {
  handId: string;
  timestamp: number;
  userPosition: string;
  userPnl: number;
  isKeyHand: boolean;
  keyHandReason?: string | null;
  summary: string;
  lastStreetReached: string;
  userHoleCards?: Card[];
}

interface HandHistoryListProps {
  onSelectHand: (handId: string) => void;
}

type FilterStreet = 'all' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
type FilterResult = 'all' | 'won' | 'lost';

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-300',
  h: 'text-red-400',
  d: 'text-blue-400',
  c: 'text-emerald-400',
};

function MiniCard({ card }: { card: Card }) {
  return (
    <span className={`font-mono font-bold text-xs ${SUIT_COLORS[card.suit]}`}>
      {card.rank}{SUIT_SYMBOLS[card.suit]}
    </span>
  );
}

function HandHistoryRow({
  hand,
  onSelect,
}: {
  hand: HandHistorySummary;
  onSelect: () => void;
}) {
  const pnlColor =
    hand.userPnl > 0
      ? 'text-emerald-400'
      : hand.userPnl < 0
      ? 'text-red-400'
      : 'text-gray-400';
  const pnlSign = hand.userPnl > 0 ? '+' : '';

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-b-0"
    >
      {/* Key hand indicator */}
      <div className="w-1 h-8 rounded-full flex-shrink-0">
        {hand.isKeyHand && <div className="w-1 h-8 rounded-full bg-amber-400" />}
      </div>

      {/* Hole cards */}
      <div className="flex gap-0.5 min-w-[48px]">
        {hand.userHoleCards?.map((c, i) => <MiniCard key={i} card={c} />) ?? (
          <span className="text-xs text-gray-500">--</span>
        )}
      </div>

      {/* Position badge */}
      <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded min-w-[28px] text-center">
        {hand.userPosition}
      </span>

      {/* Summary */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-50 truncate">{hand.summary}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {new Date(hand.timestamp).toLocaleString()} · {hand.lastStreetReached}
        </p>
      </div>

      {/* PnL */}
      <span className={`text-sm font-bold tabular-nums ${pnlColor}`}>
        {pnlSign}{hand.userPnl.toFixed(1)} BB
      </span>
    </button>
  );
}

function HistoryFilter({
  street,
  result,
  keyOnly,
  onStreetChange,
  onResultChange,
  onKeyOnlyChange,
}: {
  street: FilterStreet;
  result: FilterResult;
  keyOnly: boolean;
  onStreetChange: (v: FilterStreet) => void;
  onResultChange: (v: FilterResult) => void;
  onKeyOnlyChange: (v: boolean) => void;
}) {
  const selectClass =
    'bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:border-amber-400 focus:outline-none';
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={street}
        onChange={(e) => onStreetChange(e.target.value as FilterStreet)}
        className={selectClass}
      >
        <option value="all">All Streets</option>
        <option value="preflop">Preflop</option>
        <option value="flop">Flop</option>
        <option value="turn">Turn</option>
        <option value="river">River</option>
        <option value="showdown">Showdown</option>
      </select>
      <select
        value={result}
        onChange={(e) => onResultChange(e.target.value as FilterResult)}
        className={selectClass}
      >
        <option value="all">All Results</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
      <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={keyOnly}
          onChange={(e) => onKeyOnlyChange(e.target.checked)}
          className="accent-amber-400 w-3.5 h-3.5"
        />
        Key hands only
      </label>
    </div>
  );
}

function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-500"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm font-medium">No hands played yet</p>
      <p className="text-gray-500 text-xs mt-1">Start a game to see your hand history here</p>
    </div>
  );
}

function HistorySkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 animate-pulse">
      <div className="w-1 h-8 rounded-full bg-gray-800" />
      <div className="w-12 h-4 bg-gray-800 rounded" />
      <div className="w-7 h-5 bg-gray-800 rounded" />
      <div className="flex-1 space-y-1.5">
        <div className="w-3/4 h-3.5 bg-gray-800 rounded" />
        <div className="w-1/2 h-2.5 bg-gray-800 rounded" />
      </div>
      <div className="w-16 h-4 bg-gray-800 rounded" />
    </div>
  );
}

function LoadMoreSpinner() {
  return (
    <div className="flex justify-center py-4">
      <div className="w-5 h-5 border-2 border-gray-600 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}

export function HandHistoryList({ onSelectHand }: HandHistoryListProps) {
  const [hands, setHands] = useState<HandHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [street, setStreet] = useState<FilterStreet>('all');
  const [result, setResult] = useState<FilterResult>('all');
  const [keyOnly, setKeyOnly] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchHands = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({ page: String(pageNum), perPage: '50' });
        if (street !== 'all') params.set('street', street);
        if (result !== 'all') params.set('result', result);
        if (keyOnly) params.set('keyOnly', 'true');

        const res = await fetch(`/api/v1/hands?${params}`);
        const data = await res.json();

        if (append) {
          setHands((prev) => [...prev, ...data.hands]);
        } else {
          setHands(data.hands);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [street, result, keyOnly],
  );

  useEffect(() => {
    setPage(1);
    fetchHands(1);
  }, [fetchHands]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHands(nextPage, true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-50">Hand History</h2>
          {!loading && (
            <p className="text-xs text-gray-500 mt-0.5">{total} hands total</p>
          )}
        </div>
        <HistoryFilter
          street={street}
          result={result}
          keyOnly={keyOnly}
          onStreetChange={setStreet}
          onResultChange={setResult}
          onKeyOnlyChange={setKeyOnly}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            <HistorySkeletonRow />
            <HistorySkeletonRow />
            <HistorySkeletonRow />
            <HistorySkeletonRow />
            <HistorySkeletonRow />
          </>
        ) : hands.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <>
            {hands.map((hand) => (
              <HandHistoryRow
                key={hand.handId}
                hand={hand}
                onSelect={() => onSelectHand(hand.handId)}
              />
            ))}
            {loadingMore && <LoadMoreSpinner />}
            {hasMore && !loadingMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-sm text-amber-400 hover:bg-gray-800 transition-colors"
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}