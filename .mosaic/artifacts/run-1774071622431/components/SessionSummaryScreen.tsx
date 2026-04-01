import React from 'react';

// ── Types ────────────────────────────────────────────────────
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface ProfitCurvePoint {
  handNumber: number;
  cumulativeProfitBB: number;
}

interface SessionStats {
  winRateBBPer100: number;
  showdownPct: number;
  foldPct: number;
  vpipPct: number;
  foldToCbetPct?: number;
}

interface WorstHand {
  handNumber: number;
  evLoss: number;
  holeCards?: Card[];
}

interface SessionSummary {
  sessionId?: string;
  totalHands: number;
  profitLoss: number;
  profitCurve: ProfitCurvePoint[];
  stats: SessionStats;
  gtoConformanceScore: number;
  worstHands?: WorstHand[];
}

interface SessionSummaryScreenProps {
  summary: SessionSummary;
  onPlayAgain: () => void;
  onViewHistory: () => void;
  onReviewHand: (handNumber: number) => void;
}

// ── Helpers ──────────────────────────────────────────────────
const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColor: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-600',
};

function formatCard(card: Card): React.ReactNode {
  return (
    <span className={`font-mono font-bold ${suitColor[card.suit]}`}>
      {card.rank}{suitSymbol[card.suit]}
    </span>
  );
}

function gtoScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

function gtoScoreTrack(score: number): string {
  if (score >= 70) return 'stroke-green-500';
  if (score >= 40) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function gtoScoreLabel(score: number): string {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

function profitColor(value: number): string {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-600';
}

function formatBB(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} BB`;
}

// ── Sub-components ───────────────────────────────────────────

/** GTO Score Gauge — circular SVG gauge */
function GtoScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          className="stroke-gray-200"
          strokeWidth="10"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          className={gtoScoreTrack(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 140, height: 140 }}>
        <span className={`text-3xl font-bold ${gtoScoreColor(score)}`}>{Math.round(score)}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">{gtoScoreLabel(score)}</span>
      </div>
    </div>
  );
}

/** Stats Grid — key session metrics */
function StatsGrid({ stats, totalHands, profitLoss }: { stats: SessionStats; totalHands: number; profitLoss: number }) {
  const items = [
    { label: 'Hands Played', value: totalHands.toString() },
    { label: 'Net Profit', value: formatBB(profitLoss), color: profitColor(profitLoss) },
    { label: 'Win Rate', value: `${stats.winRateBBPer100.toFixed(1)} BB/100` },
    { label: 'VPIP', value: `${stats.vpipPct.toFixed(1)}%` },
    { label: 'Showdown %', value: `${stats.showdownPct.toFixed(1)}%` },
    { label: 'Fold %', value: `${stats.foldPct.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">{item.label}</p>
          <p className={`text-xl font-bold ${item.color ?? 'text-gray-900'}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

/** Profit Curve Chart — simple SVG line chart */
function ProfitCurveChart({ data }: { data: ProfitCurvePoint[] }) {
  if (data.length < 2) return null;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xMin = data[0].handNumber;
  const xMax = data[data.length - 1].handNumber;
  const values = data.map((d) => d.cumulativeProfitBB);
  const yMin = Math.min(0, ...values);
  const yMax = Math.max(0, ...values);
  const yRange = yMax - yMin || 1;

  const toX = (hand: number) => padding.left + ((hand - xMin) / (xMax - xMin || 1)) * innerW;
  const toY = (val: number) => padding.top + innerH - ((val - yMin) / yRange) * innerH;

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.handNumber)} ${toY(d.cumulativeProfitBB)}`).join(' ');
  const zeroY = toY(0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Profit Curve (BB)</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 400 }}>
        {/* zero line */}
        <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} className="stroke-gray-300" strokeDasharray="4 4" />
        {/* axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="stroke-gray-300" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="stroke-gray-300" />
        {/* curve */}
        <path d={pathD} fill="none" className="stroke-blue-600" strokeWidth="2.5" strokeLinejoin="round" />
        {/* y labels */}
        <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
          {yMax.toFixed(0)}
        </text>
        <text x={padding.left - 6} y={height - padding.bottom + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
          {yMin.toFixed(0)}
        </text>
        {/* x labels */}
        <text x={padding.left} y={height - padding.bottom + 18} textAnchor="middle" className="fill-gray-400 text-[10px]">
          #{xMin}
        </text>
        <text x={width - padding.right} y={height - padding.bottom + 18} textAnchor="middle" className="fill-gray-400 text-[10px]">
          #{xMax}
        </text>
      </svg>
    </div>
  );
}

/** Global Disclaimer Footer */
function GlobalDisclaimerFooter() {
  return (
    <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200 mt-6">
      GTO calculations are simplified approximations for educational purposes only — not professional poker advice.
    </footer>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export default function SessionSummaryScreen({
  summary,
  onPlayAgain,
  onViewHistory,
  onReviewHand,
}: SessionSummaryScreenProps) {
  const { totalHands, profitLoss, profitCurve, stats, gtoConformanceScore, worstHands } = summary;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Session Summary</h1>
          <p className={`text-lg font-semibold ${profitColor(profitLoss)}`}>{formatBB(profitLoss)}</p>
          <p className="text-sm text-gray-500">{totalHands} hands played</p>
        </div>

        {/* GTO Score + Profit Curve row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GTO gauge */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center relative">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">GTO Conformance</h3>
            <div className="relative">
              <GtoScoreGauge score={gtoConformanceScore} />
            </div>
          </div>
          {/* Profit curve */}
          <div className="md:col-span-2">
            <ProfitCurveChart data={profitCurve} />
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} totalHands={totalHands} profitLoss={profitLoss} />

        {/* Worst Hands */}
        {worstHands && worstHands.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Worst Hands</h3>
            <div className="divide-y divide-gray-100">
              {worstHands.map((hand) => (
                <button
                  key={hand.handNumber}
                  onClick={() => onReviewHand(hand.handNumber)}
                  className="w-full flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-mono w-10">#{hand.handNumber}</span>
                    {hand.holeCards && (
                      <span className="flex gap-1">
                        {hand.holeCards.map((c, i) => (
                          <span key={i}>{formatCard(c)}</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-500">-{hand.evLoss.toFixed(1)} BB</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onViewHistory}
            className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            View History
          </button>
        </div>

        {/* Disclaimer */}
        <GlobalDisclaimerFooter />
      </div>
    </div>
  );
}