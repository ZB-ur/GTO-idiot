import React, { useMemo } from 'react';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface ProfitDataPoint {
  handNumber: number;
  cumulativeProfit: number;
  chipStack: number;
}

interface SessionStats {
  handsPlayed: number;
  netProfitLoss: number;
  bbPer100: number;
  vpipPercent: number;
  pfrPercent: number;
}

interface DeviationSummary {
  blunders: number;
  mistakes: number;
  minors: number;
  goods: number;
  totalDecisions: number;
}

type DeviationSeverity = 'good' | 'minor' | 'mistake' | 'blunder';

interface NotableHand {
  handId: string;
  handNumber: number;
  playerHoleCards: [Card, Card];
  playerChipChange: number;
  worstDeviationSeverity: DeviationSeverity;
  deviationCount?: number;
}

interface SessionSummary {
  sessionId: string;
  stats: SessionStats;
  deviationSummary: DeviationSummary;
  profitChartData: ProfitDataPoint[];
  notableHands: NotableHand[];
}

interface SessionSummaryScreenProps {
  summary: SessionSummary;
  onReviewHands: () => void;
  onNewSession: () => void;
  onQuickStart: () => void;
  onViewHand: (handId: string) => void;
}

// --- Helpers ---

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-400',
  d: 'text-sky-400',
  c: 'text-emerald-400',
};

function CardBadge({ card }: { card: Card }) {
  return (
    <span className={`inline-flex items-center font-mono font-bold text-sm ${SUIT_COLORS[card.suit]}`}>
      {card.rank}{SUIT_SYMBOLS[card.suit]}
    </span>
  );
}

const SEVERITY_CONFIG: Record<DeviationSeverity, { label: string; color: string; bg: string }> = {
  good: { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  minor: { label: 'Minor', color: 'text-amber-300', bg: 'bg-amber-300/10' },
  mistake: { label: 'Mistake', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  blunder: { label: 'Blunder', color: 'text-red-400', bg: 'bg-red-400/10' },
};

function formatChips(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}`;
}

// --- Sub-components ---

function StatsRow({ stats }: { stats: SessionStats }) {
  const items = [
    { label: 'Hands', value: stats.handsPlayed.toString() },
    {
      label: 'Profit',
      value: formatChips(stats.netProfitLoss),
      color: stats.netProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    { label: 'BB/100', value: stats.bbPer100.toFixed(1), color: stats.bbPer100 >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'VPIP', value: `${stats.vpipPercent.toFixed(1)}%` },
    { label: 'PFR', value: `${stats.pfrPercent.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{item.label}</p>
          <p className={`text-xl font-bold ${item.color ?? 'text-gray-50'}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DeviationSummaryCard({ deviations }: { deviations: DeviationSummary }) {
  const gtoScore = deviations.totalDecisions > 0
    ? Math.round((deviations.goods / deviations.totalDecisions) * 100)
    : 0;

  const segments = [
    { key: 'goods', count: deviations.goods, color: 'bg-emerald-400', label: 'Good' },
    { key: 'minors', count: deviations.minors, color: 'bg-amber-300', label: 'Minor' },
    { key: 'mistakes', count: deviations.mistakes, color: 'bg-amber-400', label: 'Mistake' },
    { key: 'blunders', count: deviations.blunders, color: 'bg-red-400', label: 'Blunder' },
  ];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-50">GTO Accuracy</h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${gtoScore >= 70 ? 'text-emerald-400' : gtoScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {gtoScore}%
          </span>
          <span className="text-gray-500 text-sm">score</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-gray-800">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.key}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.count / deviations.totalDecisions) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2">
        {segments.map((seg) => (
          <div key={seg.key} className="text-center">
            <div className={`inline-block w-2 h-2 rounded-full ${seg.color} mr-1`} />
            <span className="text-gray-400 text-xs">{seg.label}</span>
            <p className="text-gray-50 font-semibold text-sm">{seg.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfitChart({ data }: { data: ProfitDataPoint[] }) {
  const { points, viewBox, zeroY } = useMemo(() => {
    if (data.length === 0) return { points: '', viewBox: '0 0 400 200', zeroY: 100 };

    const W = 400;
    const H = 200;
    const PAD = 20;

    const profits = data.map((d) => d.cumulativeProfit);
    const minP = Math.min(0, ...profits);
    const maxP = Math.max(0, ...profits);
    const range = maxP - minP || 1;

    const toX = (i: number) => PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
    const toY = (v: number) => PAD + (1 - (v - minP) / range) * (H - PAD * 2);

    const pts = data.map((d, i) => `${toX(i)},${toY(d.cumulativeProfit)}`).join(' ');
    return { points: pts, viewBox: `0 0 ${W} ${H}`, zeroY: toY(0) };
  }, [data]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-50 mb-4">Profit Chart</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data</p>
      ) : (
        <svg viewBox={viewBox} className="w-full h-48" preserveAspectRatio="none">
          {/* Zero line */}
          <line x1="20" y1={zeroY} x2="380" y2={zeroY} stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
          {/* Profit line */}
          <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" points={points} />
        </svg>
      )}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Hand 1</span>
        <span>Hand {data.length}</span>
      </div>
    </div>
  );
}

function NotableHandCard({
  hand,
  onViewHand,
}: {
  hand: NotableHand;
  onViewHand: (handId: string) => void;
}) {
  const severity = SEVERITY_CONFIG[hand.worstDeviationSeverity];
  const chipColor = hand.playerChipChange >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <button
      onClick={() => onViewHand(hand.handId)}
      className="w-full bg-gray-800 hover:bg-gray-700/80 border border-gray-700 rounded-xl p-4 text-left transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs font-medium">Hand #{hand.handNumber}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${severity.color} ${severity.bg}`}>
          {severity.label}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-900 rounded-lg px-2 py-1">
            <CardBadge card={hand.playerHoleCards[0]} />
            <CardBadge card={hand.playerHoleCards[1]} />
          </div>
          {hand.deviationCount !== undefined && hand.deviationCount > 0 && (
            <span className="text-gray-500 text-xs">{hand.deviationCount} deviation{hand.deviationCount > 1 ? 's' : ''}</span>
          )}
        </div>
        <span className={`font-bold text-sm ${chipColor}`}>{formatChips(hand.playerChipChange)}</span>
      </div>
    </button>
  );
}

// --- Main Component ---

export default function SessionSummaryScreen({
  summary,
  onReviewHands,
  onNewSession,
  onQuickStart,
  onViewHand,
}: SessionSummaryScreenProps) {
  const { stats, deviationSummary, profitChartData, notableHands } = summary;
  const isProfit = stats.netProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-4xl">{isProfit ? '🎉' : '📊'}</p>
          <h1 className="text-2xl font-bold">Session Complete</h1>
          <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatChips(stats.netProfitLoss)} chips
          </p>
        </div>

        {/* Stats Row */}
        <StatsRow stats={stats} />

        {/* GTO Deviations */}
        <DeviationSummaryCard deviations={deviationSummary} />

        {/* Profit Chart */}
        <ProfitChart data={profitChartData} />

        {/* Notable Hands */}
        {notableHands.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Notable Hands</h3>
            {notableHands.map((hand) => (
              <NotableHandCard key={hand.handId} hand={hand} onViewHand={onViewHand} />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onReviewHands}
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-3 rounded-xl transition-colors"
          >
            Review All Hands
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onQuickStart}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-50 font-semibold py-3 rounded-xl transition-colors"
            >
              Quick Start
            </button>
            <button
              onClick={onNewSession}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-50 font-semibold py-3 rounded-xl transition-colors"
            >
              New Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}