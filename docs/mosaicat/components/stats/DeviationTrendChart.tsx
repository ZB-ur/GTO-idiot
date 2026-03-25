import React, { useMemo } from 'react';

interface DeviationTrendPoint {
  sessionDate: string;
  score: number;
  handsPlayed: number;
}

interface DeviationTrendChartProps {
  data: DeviationTrendPoint[];
  className?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function scoreFill(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export const DeviationTrendChart: React.FC<DeviationTrendChartProps> = ({
  data,
  className = '',
}) => {
  const chartMetrics = useMemo(() => {
    if (data.length === 0) return null;

    const scores = data.map((d) => d.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.min(100, Math.max(...scores) + 10);
    const range = maxScore - minScore || 1;

    const width = 480;
    const height = 160;
    const padX = 40;
    const padY = 20;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const points = data.map((d, i) => ({
      x: padX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
      y: padY + chartH - ((d.score - minScore) / range) * chartH,
      score: d.score,
      date: formatDate(d.sessionDate),
      hands: d.handsPlayed,
    }));

    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
    const areaPath = `M${points[0].x},${padY + chartH} ${points.map((p) => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padY + chartH} Z`;

    const gridLines = [0, 25, 50, 75, 100]
      .filter((v) => v >= minScore && v <= maxScore)
      .map((v) => ({
        y: padY + chartH - ((v - minScore) / range) * chartH,
        label: v,
      }));

    return { width, height, points, polyline, areaPath, gridLines, padX, padY, chartH };
  }, [data]);

  if (!chartMetrics || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-sm text-gray-400 ${className}`}>
        No session data yet
      </div>
    );
  }

  const { width, height, points, polyline, areaPath, gridLines, padX, padY, chartH } = chartMetrics;
  const latest = data[data.length - 1];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          GTO Score Trend
        </span>
        <span className={`text-sm font-bold ${scoreColor(latest.score)}`}>
          Latest: {latest.score}
        </span>
      </div>

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {gridLines.map((gl) => (
          <g key={gl.label}>
            <line
              x1={padX}
              y1={gl.y}
              x2={width - padX}
              y2={gl.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={padX - 6} y={gl.y + 3} textAnchor="end" fill="#9ca3af" fontSize="10">
              {gl.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#trendGradient)" opacity="0.2" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={scoreFill(p.score)} stroke="white" strokeWidth="2" />
        ))}

        {/* Date labels (first, mid, last) */}
        {points.length > 0 && (
          <>
            <text x={points[0].x} y={padY + chartH + 14} textAnchor="start" fill="#9ca3af" fontSize="9">
              {points[0].date}
            </text>
            {points.length > 2 && (
              <text x={points[Math.floor(points.length / 2)].x} y={padY + chartH + 14} textAnchor="middle" fill="#9ca3af" fontSize="9">
                {points[Math.floor(points.length / 2)].date}
              </text>
            )}
            <text x={points[points.length - 1].x} y={padY + chartH + 14} textAnchor="end" fill="#9ca3af" fontSize="9">
              {points[points.length - 1].date}
            </text>
          </>
        )}

        {/* Gradient def */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default DeviationTrendChart;