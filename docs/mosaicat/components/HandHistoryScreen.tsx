import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface HandSummary {
  id: string;
  sessionId: string;
  handNumber: number;
  timestamp: string;
  playerHoleCards: Card[];
  communityCards: Card[];
  playerChipChange: number;
  wentToShowdown: boolean;
  actionSummary?: string;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface AggregateStats {
  totalHands: number;
  totalSessions: number;
  netProfitLoss: number;
  bbPer100: number;
  vpipPercent: number;
  pfrPercent: number;
}

interface ProfitDataPoint {
  handNumber: number;
  cumulativeProfit: number;
  chipStack: number;
}

interface SessionOption {
  id: string;
  label: string;
  createdAt: string;
  handCount: number;
}

interface HandHistoryScreenProps {
  onViewHand: (handId: string) => void;
  onStartPlaying: () => void;
}

// --- Sub-components ---

function SessionFilter({
  sessions,
  selectedSessionId,
  onSelect,
}: {
  sessions: SessionOption[];
  selectedSessionId: string | null;
  onSelect: (sessionId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-400">Session</label>
      <select
        value={selectedSessionId ?? 'all'}
        onChange={(e) => onSelect(e.target.value === 'all' ? null : e.target.value)}
        className="bg-gray-800 text-gray-50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 min-w-[200px]"
      >
        <option value="all">All Sessions</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label} — {s.handCount} hands
          </option>
        ))}
      </select>
    </div>
  );
}

function StatsRow({ stats }: { stats: AggregateStats }) {
  const statItems = [
    { label: 'Hands', value: stats.totalHands.toLocaleString() },
    { label: 'Sessions', value: stats.totalSessions.toString() },
    {
      label: 'Net P/L',
      value: `${stats.netProfitLoss >= 0 ? '+' : ''}${stats.netProfitLoss}`,
      color: stats.netProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'BB/100',
      value: stats.bbPer100.toFixed(1),
      color: stats.bbPer100 >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    { label: 'VPIP', value: `${stats.vpipPercent.toFixed(1)}%` },
    { label: 'PFR', value: `${stats.pfrPercent.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {item.label}
          </div>
          <div className={`text-lg font-bold ${item.color ?? 'text-gray-50'}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfitChart({ dataPoints }: { dataPoints: ProfitDataPoint[] }) {
  if (dataPoints.length === 0) return null;

  const width = 600;
  const height = 160;
  const padding = { top: 20, right: 16, bottom: 24, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const profits = dataPoints.map((d) => d.cumulativeProfit);
  const minP = Math.min(0, ...profits);
  const maxP = Math.max(0, ...profits);
  const range = maxP - minP || 1;

  const xScale = (i: number) => padding.left + (i / (dataPoints.length - 1 || 1)) * chartW;
  const yScale = (v: number) => padding.top + chartH - ((v - minP) / range) * chartH;

  const pathD = dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.cumulativeProfit).toFixed(1)}`)
    .join(' ');

  const zeroY = yScale(0);
  const lastProfit = profits[profits.length - 1];
  const lineColor = lastProfit >= 0 ? '#34d399' : '#f87171';
  const fillColor = lastProfit >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)';

  const areaD = `${pathD} L${xScale(dataPoints.length - 1).toFixed(1)},${zeroY.toFixed(1)} L${xScale(0).toFixed(1)},${zeroY.toFixed(1)} Z`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-sm font-semibold text-gray-400 mb-2">Profit / Loss</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* zero line */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={zeroY}
          y2={zeroY}
          stroke="#374151"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        {/* area fill */}
        <path d={areaD} fill={fillColor} />
        {/* line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* labels */}
        <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-gray-500 text-[10px]">
          {maxP > 0 ? `+${maxP}` : maxP}
        </text>
        <text x={padding.left - 8} y={height - padding.bottom} textAnchor="end" className="fill-gray-500 text-[10px]">
          {minP}
        </text>
        <text x={padding.left} y={height - 4} textAnchor="start" className="fill-gray-500 text-[10px]">
          Hand 1
        </text>
        <text x={width - padding.right} y={height - 4} textAnchor="end" className="fill-gray-500 text-[10px]">
          Hand {dataPoints.length}
        </text>
      </svg>
    </div>
  );
}

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-300',
  h: 'text-red-400',
  d: 'text-sky-400',
  c: 'text-emerald-400',
};

function CardBadge({ card }: { card: Card }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-9 bg-gray-800 border border-gray-700 rounded text-xs font-bold ${SUIT_COLORS[card.suit]}`}
    >
      {card.rank}{SUIT_SYMBOLS[card.suit]}
    </span>
  );
}

function HandCard({
  hand,
  onView,
}: {
  hand: HandSummary;
  onView: () => void;
}) {
  const isPositive = hand.playerChipChange >= 0;

  return (
    <button
      onClick={onView}
      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 text-left transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-50">#{hand.handNumber}</span>
          <span className="text-xs text-gray-500">
            {new Date(hand.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {hand.wentToShowdown && (
            <span className="text-[10px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
              Showdown
            </span>
          )}
        </div>
        <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{hand.playerChipChange}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {hand.playerHoleCards.map((c, i) => (
            <CardBadge key={i} card={c} />
          ))}
        </div>
        {hand.communityCards.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-1">
              {hand.communityCards.map((c, i) => (
                <CardBadge key={i} card={c} />
              ))}
            </div>
          </>
        )}
      </div>

      {hand.actionSummary && (
        <div className="mt-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          {hand.actionSummary}
        </div>
      )}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 bg-gray-800 rounded" />
        <div className="h-4 w-10 bg-gray-800 rounded" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-7 h-9 bg-gray-800 rounded" />
        <div className="w-7 h-9 bg-gray-800 rounded" />
        <div className="w-px h-6 bg-gray-800 mx-2" />
        <div className="w-7 h-9 bg-gray-800 rounded" />
        <div className="w-7 h-9 bg-gray-800 rounded" />
        <div className="w-7 h-9 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onStartPlaying }: { onStartPlaying: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-50 mb-1">No Hands Yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Play your first session to see hand history, stats, and profit charts here.
      </p>
      <button
        onClick={onStartPlaying}
        className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-6 py-2.5 rounded-lg transition-colors"
      >
        Start Playing
      </button>
    </div>
  );
}

// --- Main Screen ---

export default function HandHistoryScreen({ onViewHand, onStartPlaying }: HandHistoryScreenProps) {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [profitData, setProfitData] = useState<ProfitDataPoint[]>([]);
  const [hands, setHands] = useState<HandSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch aggregate stats
  const fetchStats = useCallback(async (sessionId: string | null) => {
    try {
      const url = sessionId
        ? `/api/sessions/${sessionId}/stats`
        : '/api/stats/aggregate';
      const res = await fetch(url);
      const data = await res.json();
      setStats(sessionId ? {
        totalHands: data.handsPlayed,
        totalSessions: 1,
        netProfitLoss: data.netProfitLoss,
        bbPer100: data.bbPer100,
        vpipPercent: data.vpipPercent,
        pfrPercent: data.pfrPercent,
      } : data);
    } catch {
      // silently handle
    }
  }, []);

  // Fetch profit chart
  const fetchProfitChart = useCallback(async (sessionId: string | null) => {
    try {
      const url = sessionId
        ? `/api/stats/profit-chart?session_id=${sessionId}`
        : '/api/stats/profit-chart';
      const res = await fetch(url);
      const data = await res.json();
      setProfitData(data.dataPoints ?? []);
    } catch {
      setProfitData([]);
    }
  }, []);

  // Fetch hands
  const fetchHands = useCallback(async (sessionId: string | null, page: number, append: boolean) => {
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '50', sort_order: 'desc' });
      if (sessionId) params.set('session_id', sessionId);
      const res = await fetch(`/api/hands?${params}`);
      const data = await res.json();
      setHands((prev) => (append ? [...prev, ...data.hands] : data.hands));
      setPagination(data.pagination);
    } catch {
      if (!append) setHands([]);
    }
  }, []);

  // Initial + session change load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchStats(selectedSessionId),
      fetchProfitChart(selectedSessionId),
      fetchHands(selectedSessionId, 1, false),
    ]).finally(() => setLoading(false));
  }, [selectedSessionId, fetchStats, fetchProfitChart, fetchHands]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          pagination &&
          pagination.page < pagination.totalPages &&
          !loadingMore
        ) {
          setLoadingMore(true);
          fetchHands(selectedSessionId, pagination.page + 1, true).finally(() =>
            setLoadingMore(false),
          );
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pagination, loadingMore, selectedSessionId, fetchHands]);

  const isEmpty = !loading && hands.length === 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hand History</h1>
          <SessionFilter
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        </div>

        {isEmpty ? (
          <EmptyState onStartPlaying={onStartPlaying} />
        ) : (
          <>
            {/* Stats */}
            {stats && <StatsRow stats={stats} />}

            {/* Profit Chart */}
            {profitData.length > 1 && <ProfitChart dataPoints={profitData} />}

            {/* Hand List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-400">Hands</h2>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                hands.map((hand) => (
                  <HandCard key={hand.id} hand={hand} onView={() => onViewHand(hand.id)} />
                ))
              )}
              {loadingMore &&
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
              <div ref={sentinelRef} className="h-1" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}