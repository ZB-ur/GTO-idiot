typescript
import React, { useMemo } from 'react';

// -- Types matching API schemas ------------------------------------------

interface StatisticsDashboard {
  totalHands: number;
  totalPnl: number;
  overallWinRate: number;
  gtoConformance: number;
  hasEnoughData: boolean;
  minimumHandsForTrend: number;
}

interface TrendDataPoint {
  label: string;
  gtoConformance: number;
  handsCount: number;
  timestamp: string;
}

interface TrendDataResponse {
  groupBy: 'per_10_hands' | 'per_session';
  dataPoints: TrendDataPoint[];
}

type GtoRating = 'green' | 'yellow' | 'red' | 'gray';

interface ErrorCategory {
  errorType: string;
  title: string;
  titleZh: string;
  count: number;
  percentage: number;
  severity: GtoRating;
}

interface ErrorCategoriesResponse {
  totalErrors: number;
  categories: ErrorCategory[];
}

// -- Component Props -----------------------------------------------------

interface StatsDashboardProps {
  stats: StatisticsDashboard | null;
  trends: TrendDataResponse | null;
  errors: ErrorCategoriesResponse | null;
  loading: boolean;
  onStartPlaying: () => void;
  onViewHands: (errorType: string) => void;
}

// -- Sub-components ------------------------------------------------------

/** Skeleton loading card */
const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-[#1e293b] border border-gray-700 rounded-xl p-6 animate-pulse ${className}`}>
    <div className="h-3 w-20 bg-gray-700 rounded mb-3" />
    <div className="h-7 w-28 bg-gray-700 rounded mb-2" />
    <div className="h-3 w-16 bg-gray-600 rounded" />
  </div>
);

/** Single KPI metric card */
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  icon: React.ReactNode;
}> = ({ title, value, subtitle, valueColor = 'text-gray-100', icon }) => (
  <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 flex flex-col gap-2 hover:border-emerald-500/40 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</span>
      <span className="text-gray-500">{icon}</span>
    </div>
    <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
    {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
  </div>
);

/** GTO conformance trend chart (SVG) */
const TrendChart: React.FC<{
  data: TrendDataResponse;
  className?: string;
}> = ({ data, className = '' }) => {
  const { pathD, areaD, width, height, points, yLabels, zeroY } = useMemo(() => {
    const w = 600;
    const h = 220;
    const pad = { top: 30, right: 20, bottom: 30, left: 50 };

    if (data.dataPoints.length === 0) {
      return { pathD: '', areaD: '', width: w, height: h, points: [], yLabels: [], zeroY: h / 2 };
    }

    const values = data.dataPoints.map((d) => d.gtoConformance);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 100);
    const range = max - min || 1;

    const xScale = (i: number) =>
      pad.left + (i / Math.max(data.dataPoints.length - 1, 1)) * (w - pad.left - pad.right);
    const yScale = (v: number) =>
      h - pad.bottom - ((v - min) / range) * (h - pad.top - pad.bottom);

    const pts = data.dataPoints.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.gtoConformance),
      label: d.label,
      value: d.gtoConformance,
    }));

    const pathStr = `M${pts.map((p) => `${p.x},${p.y}`).join(' L')}`;
    const areaStr = `${pathStr} L${pts[pts.length - 1].x},${h - pad.bottom} L${pts[0].x},${h - pad.bottom} Z`;

    const labels = [max, (max + min) / 2, min].map((v) => ({
      y: yScale(v),
      text: `${v.toFixed(0)}%`,
    }));

    return { pathD: pathStr, areaD: areaStr, width: w, height: h, points: pts, yLabels: labels, zeroY: yScale(0) };
  }, [data]);

  return (
    <div className={`bg-[#1e293b] border border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">GTO Conformance Trend</h3>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {data.groupBy === 'per_10_hands' ? 'Per 10 Hands' : 'Per Session'}
        </span>
      </div>

      {data.dataPoints.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
          Not enough data for trend
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
          <defs>
            <linearGradient id="gtoTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yLabels.map((l, i) => (
            <g key={i}>
              <line x1="50" y1={l.y} x2={width - 20} y2={l.y} stroke="#374151" strokeWidth="1" strokeDasharray="4" />
              <text x="45" y={l.y + 4} textAnchor="end" fill="#6b7280" fontSize="10">
                {l.text}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#gtoTrendGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
          ))}

          {/* X-axis labels (first, middle, last) */}
          {[0, Math.floor(points.length / 2), points.length - 1].map((idx) => {
            const p = points[idx];
            if (!p) return null;
            return (
              <text key={idx} x={p.x} y={height - 8} textAnchor="middle" fill="#6b7280" fontSize="10">
                {p.label}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
};

/** Error category list */
const ErrorCategoryList: React.FC<{
  data: ErrorCategoriesResponse;
  onViewHands: (errorType: string) => void;
  className?: string;
}> = ({ data, onViewHands, className = '' }) => {
  const severityColors: Record<GtoRating, string> = {
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const severityLabels: Record<GtoRating, string> = {
    red: 'Critical',
    yellow: 'Warning',
    green: 'Minor',
    gray: 'Info',
  };

  return (
    <div className={`bg-[#1e293b] border border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Common Errors</h3>
        <span className="text-xs text-gray-500 font-medium">
          {data.totalErrors} total errors
        </span>
      </div>

      {data.categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">No errors recorded yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.categories.map((cat) => (
            <button
              key={cat.errorType}
              onClick={() => onViewHands(cat.errorType)}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#16213e] hover:bg-[#1a2744] border border-gray-700/50 hover:border-emerald-500/30 transition-colors text-left group"
            >
              {/* Severity badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${severityColors[cat.severity]}`}
              >
                {severityLabels[cat.severity]}
              </span>

              {/* Title & description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{cat.title}</p>
                <p className="text-xs text-gray-500 truncate">{cat.titleZh}</p>
              </div>

              {/* Count */}
              <div className="text-right flex-shrink-0">
                <span className="text-lg font-bold text-gray-200">{cat.count}</span>
                <span className="text-xs text-gray-500 ml-1">({cat.percentage.toFixed(1)}%)</span>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Empty state placeholder */
const EmptyStatsPlaceholder: React.FC<{ onStartPlaying: () => void }> = ({ onStartPlaying }) => (
  <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center gap-4 text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    </div>
    <div>
      <p className="text-lg font-semibold text-gray-200">No Statistics Yet</p>
      <p className="text-sm text-gray-500 mt-1">Play some hands to see your performance data</p>
    </div>
    <button
      onClick={onStartPlaying}
      className="mt-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition-colors"
    >
      Start Playing
    </button>
  </div>
);

// -- Icons ---------------------------------------------------------------

const HandIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
  </svg>
);

const ChipIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PercentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// -- Main Component ------------------------------------------------------

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  trends,
  errors,
  loading,
  onStartPlaying,
  onViewHands,
}) => {
  const pnlColor = stats && stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const pnlSign = stats && stats.totalPnl >= 0 ? '+' : '';
  const gtoColor =
    stats && stats.gtoConformance >= 70
      ? 'text-emerald-400'
      : stats && stats.gtoConformance >= 50
        ? 'text-amber-400'
        : 'text-red-400';

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  // Empty state
  if (!stats || stats.totalHands === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-100">Statistics</h2>
        <EmptyStatsPlaceholder onStartPlaying={onStartPlaying} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Statistics</h2>
        <button
          onClick={onStartPlaying}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Play More
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Hands"
          value={stats.totalHands.toLocaleString()}
          icon={<HandIcon />}
        />
        <MetricCard
          title="Profit / Loss"
          value={`${pnlSign}${stats.totalPnl.toFixed(1)} BB`}
          valueColor={pnlColor}
          icon={<ChipIcon />}
        />
        <MetricCard
          title="Win Rate"
          value={`${stats.overallWinRate.toFixed(1)}%`}
          valueColor={stats.overallWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}
          icon={<PercentIcon />}
        />
        <MetricCard
          title="GTO Score"
          value={`${stats.gtoConformance.toFixed(1)}%`}
          valueColor={gtoColor}
          subtitle={stats.gtoConformance >= 70 ? 'Solid play' : stats.gtoConformance >= 50 ? 'Room to improve' : 'Needs work'}
          icon={<TargetIcon />}
        />
      </div>

      {/* Trend Chart */}
      {trends && stats.hasEnoughData ? (
        <TrendChart data={trends} />
      ) : (
        <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">GTO Conformance Trend</h3>
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            Play at least {stats.minimumHandsForTrend} hands to see trends
          </div>
        </div>
      )}

      {/* Error Categories */}
      {errors && <ErrorCategoryList data={errors} onViewHands={onViewHands} />}
    </div>
  );
};

export default StatsDashboard;