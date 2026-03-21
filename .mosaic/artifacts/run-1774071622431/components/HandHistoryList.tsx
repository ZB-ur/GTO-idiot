import React, { useState, useMemo, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface HandResult {
  winners: Array<{
    seatIndex: number;
    playerName: string;
    amount: number;
    handStrength?: string;
    holeCards?: Card[];
  }>;
  potResults: Array<{
    potName: string;
    amount: number;
    winnerSeatIndex: number;
  }>;
}

interface HandRecord {
  handNumber: number;
  sessionId: string;
  dealerSeatIndex?: number;
  blinds?: { small: number; big: number };
  players: Array<{
    seatIndex: number;
    playerName: string;
    position: string;
    isUser?: boolean;
    botStyle?: string;
    startingChips: number;
    holeCards: Card[];
  }>;
  communityCards: Card[];
  streets: {
    preflop: { actions: any[]; potAtEnd?: number };
    flop?: { actions: any[]; potAtEnd?: number };
    turn?: { actions: any[]; potAtEnd?: number };
    river?: { actions: any[]; potAtEnd?: number };
  };
  result: HandResult;
  userProfit?: number;
  timestamp: string;
}

type FilterStreet = 'all' | 'preflop' | 'flop' | 'turn' | 'river';
type FilterResult = 'all' | 'won' | 'lost';

interface HandHistoryListProps {
  hands: HandRecord[];
  onSelectHand: (handNumber: number) => void;
}

// ── Helpers ──────────────────────────────────────────────────
const suitSymbol: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};
const suitColor: Record<string, string> = {
  s: 'text-gray-900', h: 'text-red-500', d: 'text-blue-500', c: 'text-green-600',
};

function CardDisplay({ card }: { card: Card }) {
  return (
    <span className={`font-mono font-bold ${suitColor[card.suit]}`}>
      {card.rank}{suitSymbol[card.suit]}
    </span>
  );
}

function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} BB`;
}

function lastStreet(hand: HandRecord): string {
  if (hand.streets.river) return 'River';
  if (hand.streets.turn) return 'Turn';
  if (hand.streets.flop) return 'Flop';
  return 'Preflop';
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Sub-components ───────────────────────────────────────────

/** Skeleton row shown while loading */
function SkeletonLoader() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-3 border-b border-gray-200">
      <div className="h-4 w-10 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
      <div className="flex-1" />
      <div className="h-4 w-14 bg-gray-200 rounded" />
      <div className="h-4 w-12 bg-gray-200 rounded" />
    </div>
  );
}

/** Filter bar */
function HandHistoryFilter({
  streetFilter,
  resultFilter,
  searchQuery,
  onStreetChange,
  onResultChange,
  onSearchChange,
}: {
  streetFilter: FilterStreet;
  resultFilter: FilterResult;
  searchQuery: string;
  onStreetChange: (v: FilterStreet) => void;
  onResultChange: (v: FilterResult) => void;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-200 bg-slate-50">
      {/* Search */}
      <div className="relative flex-1 min-w-[160px]">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search hand # or cards…"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Street filter */}
      <select
        value={streetFilter}
        onChange={(e) => onStreetChange(e.target.value as FilterStreet)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Streets</option>
        <option value="preflop">Preflop</option>
        <option value="flop">Flop</option>
        <option value="turn">Turn</option>
        <option value="river">River</option>
      </select>

      {/* Result filter */}
      <select
        value={resultFilter}
        onChange={(e) => onResultChange(e.target.value as FilterResult)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Results</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
    </div>
  );
}

/** Single hand row */
function HandHistoryRow({
  hand,
  onClick,
}: {
  hand: HandRecord;
  onClick: () => void;
}) {
  const userPlayer = hand.players.find((p) => p.isUser);
  const profit = hand.userProfit ?? 0;
  const profitClass = profit > 0
    ? 'text-green-500 bg-green-50'
    : profit < 0
      ? 'text-red-500 bg-red-50'
      : 'text-gray-500 bg-gray-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-200 hover:bg-blue-50 transition-colors text-left group"
    >
      {/* Hand number */}
      <span className="text-sm font-mono text-gray-400 w-10 shrink-0">#{hand.handNumber}</span>

      {/* Hole cards */}
      <span className="flex gap-0.5 shrink-0 text-sm">
        {userPlayer?.holeCards.map((c, i) => (
          <CardDisplay key={i} card={c} />
        ))}
      </span>

      {/* Position badge */}
      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
        {userPlayer?.position ?? '—'}
      </span>

      {/* Last street */}
      <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
        {lastStreet(hand)}
      </span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Profit */}
      <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg shrink-0 ${profitClass}`}>
        {formatProfit(profit)}
      </span>

      {/* Time */}
      <span className="text-xs text-gray-400 w-14 text-right shrink-0">
        {relativeTime(hand.timestamp)}
      </span>

      {/* Arrow */}
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function HandHistoryList({ hands, onSelectHand }: HandHistoryListProps) {
  const [streetFilter, setStreetFilter] = useState<FilterStreet>('all');
  const [resultFilter, setResultFilter] = useState<FilterResult>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...hands].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Street filter
    if (streetFilter !== 'all') {
      list = list.filter((h) => {
        const streetMap: Record<string, boolean> = {
          preflop: true,
          flop: !!h.streets.flop,
          turn: !!h.streets.turn,
          river: !!h.streets.river,
        };
        return streetMap[streetFilter];
      });
    }

    // Result filter
    if (resultFilter === 'won') {
      list = list.filter((h) => (h.userProfit ?? 0) > 0);
    } else if (resultFilter === 'lost') {
      list = list.filter((h) => (h.userProfit ?? 0) < 0);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((h) => {
        if (String(h.handNumber).includes(q)) return true;
        const userCards = h.players.find((p) => p.isUser)?.holeCards ?? [];
        const cardStr = userCards.map((c) => `${c.rank}${c.suit}`).join('').toLowerCase();
        return cardStr.includes(q);
      });
    }

    return list;
  }, [hands, streetFilter, resultFilter, searchQuery]);

  const handleSelect = useCallback(
    (handNumber: number) => onSelectHand(handNumber),
    [onSelectHand]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Hand History</h2>
        <span className="text-sm text-gray-400">{filtered.length} hands</span>
      </div>

      {/* Filters */}
      <HandHistoryFilter
        streetFilter={streetFilter}
        resultFilter={resultFilter}
        searchQuery={searchQuery}
        onStreetChange={setStreetFilter}
        onResultChange={setResultFilter}
        onSearchChange={setSearchQuery}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonLoader key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No hands found</p>
          </div>
        ) : (
          filtered.map((hand) => (
            <HandHistoryRow
              key={hand.handNumber}
              hand={hand}
              onClick={() => handleSelect(hand.handNumber)}
            />
          ))
        )}
      </div>
    </div>
  );
}