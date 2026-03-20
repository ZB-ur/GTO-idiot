import React, { useMemo } from 'react';

export interface ProfitCurvePoint {
  handNumber: number;
  profitBB: number;
}

export interface SessionKeyStats {
  vpip: number;
  pfr: number;
  aggression: number;
  wtsd: number;
  avgEvLossPerHand: number;
}

export interface SessionSummary {
  sessionId: string;
  handCount: number;
  profitLossBB: number;
  durationMinutes?: number;
  profitCurve: ProfitCurvePoint[];
  keyStats: SessionKeyStats;
}

export interface SessionSummaryModalProps {
  isOpen: boolean;
  summary: SessionSummary;
  onClose: () => void;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Mini SVG sparkline for the profit curve */
function ProfitChart({ data }: { data: ProfitCurvePoint[] }) {
  if (data.length < 2) return null;

  const width = 480;
  const height = 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const xs = data.map((d) => d.handNumber);
  const ys = data.map((d) => d.profitBB);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const toX = (v: number) => pad.left + ((v - minX) / rangeX) * innerW;
  const toY = (v: number) => pad.top + innerH - ((v - minY) / rangeY) * innerH;

  const points = data.map((d) => `${toX(d.handNumber)},${toY(d.profitBB)}`).join(' ');
  const zeroY = toY(0);

  // gradient fill area
  const areaPath = [
    `M ${toX(data[0].handNumber)},${zeroY}`,
    ...data.map((d) => `L ${toX(d.handNumber)},${toY(d.profitBB)}`),
    `L ${toX(data[data.length - 1].handNumber)},${zeroY} Z`,
  ].join(' ');

  const finalProfit = data[data.length - 1].profitBB;
  const lineColor = finalProfit >= 0 ? '#10b981' : '#ef4444';
  const fillColor = finalProfit >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* zero line */}
      <line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 3" />
      {/* area */}
      <path d={areaPath} fill={fillColor} />
      {/* line */}
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      {/* axis labels */}
      <text x={pad.left} y={height - 4} fontSize={10} fill="#9ca3af">Hand 1</text>
      <text x={width - pad.right} y={height - 4} fontSize={10} fill="#9ca3af" textAnchor="end">
        Hand {data[data.length - 1].handNumber}
      </text>
      <text x={pad.left - 6} y={toY(maxY) + 4} fontSize={10} fill="#9ca3af" textAnchor="end">
        {maxY > 0 ? `+${maxY.toFixed(0)}` : maxY.toFixed(0)}
      </text>
      <text x={pad.left - 6} y={toY(minY) + 4} fontSize={10} fill="#9ca3af" textAnchor="end">
        {minY.toFixed(0)}
      </text>
    </svg>
  );
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({ isOpen, summary, onClose }) => {
  if (!isOpen) return null;

  const isProfit = summary.profitLossBB >= 0;

  const statCards: { label: string; value: string; sub?: string }[] = useMemo(
    () => [
      { label: 'Hands Played', value: String(summary.handCount) },
      {
        label: 'Net Profit / Loss',
        value: `${isProfit ? '+' : ''}${summary.profitLossBB.toFixed(1)} BB`,
      },
      { label: 'Duration', value: formatDuration(summary.durationMinutes) },
      { label: 'VPIP', value: formatPct(summary.keyStats.vpip) },
      { label: 'PFR', value: formatPct(summary.keyStats.pfr) },
      { label: 'Aggression', value: summary.keyStats.aggression.toFixed(2) },
      { label: 'WTSD', value: formatPct(summary.keyStats.wtsd) },
      { label: 'Avg EV Loss', value: `${summary.keyStats.avgEvLossPerHand.toFixed(2)} BB` },
    ],
    [summary, isProfit],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* header */}
        <div className={`px-6 py-5 ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Session Summary</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className={`mt-1 text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
            {isProfit ? '+' : ''}{summary.profitLossBB.toFixed(1)} BB
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {summary.handCount} hands &middot; {formatDuration(summary.durationMinutes)}
          </p>
        </div>

        {/* chart */}
        <div className="px-6 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Profit Curve</h3>
          <div className="bg-slate-50 rounded-lg p-3 border border-gray-200">
            <ProfitChart data={summary.profitCurve} />
          </div>
        </div>

        {/* stats grid */}
        <div className="px-6 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Statistics</h3>
          <div className="grid grid-cols-4 gap-3">
            {statCards.slice(3).map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-lg p-3 border border-gray-200 text-center">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* EV loss callout */}
        <div className="px-6 pt-3 pb-4">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-800">
              Avg EV loss: <span className="font-semibold">{summary.keyStats.avgEvLossPerHand.toFixed(2)} BB/hand</span>
            </p>
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Hand History
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;