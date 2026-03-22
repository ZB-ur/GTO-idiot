import React from 'react';

export interface ConformanceTrendDataPoint {
  sessionId: string;
  date: string;
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

export interface ConformanceTrend {
  dataPoints: ConformanceTrendDataPoint[];
}

interface ConformanceTrendChartProps {
  data: ConformanceTrend;
  onSessionClick?: (sessionId: string) => void;
  isLoading?: boolean;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="h-48 bg-gray-200 rounded-lg" />
  </div>
);

export const ConformanceTrendChart: React.FC<ConformanceTrendChartProps> = ({
  data,
  onSessionClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <SkeletonLoader />
      </div>
    );
  }

  const points = data.dataPoints;
  const maxConformance = 100;
  const minConformance = 0;
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 24;
  const plotW = chartWidth - paddingX * 2;
  const plotH = chartHeight - paddingY * 2;

  const getX = (i: number) =>
    paddingX + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const getY = (val: number) =>
    paddingY + plotH - ((val - minConformance) / (maxConformance - minConformance)) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.conformance)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${paddingY + plotH} L ${getX(0)} ${paddingY + plotH} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">GTO Conformance Trend</h3>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={paddingX}
              y1={getY(tick)}
              x2={chartWidth - paddingX}
              y2={getY(tick)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray={tick === 0 ? 'none' : '4 2'}
            />
            <text
              x={paddingX - 6}
              y={getY(tick) + 3}
              textAnchor="end"
              className="fill-gray-400"
              fontSize="10"
            >
              {tick}%
            </text>
          </g>
        ))}

        {/* Area fill */}
        {points.length > 1 && (
          <path d={areaPath} fill="url(#conformanceGradient)" />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="conformanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Line */}
        {points.length > 1 && (
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={p.sessionId}
            cx={getX(i)}
            cy={getY(p.conformance)}
            r="4"
            fill="white"
            stroke="#2563eb"
            strokeWidth="2"
            className="cursor-pointer hover:r-[6]"
            onClick={() => onSessionClick?.(p.sessionId)}
          >
            <title>
              {new Date(p.date).toLocaleDateString()} — {p.conformance.toFixed(1)}% ({p.handsPlayed} hands)
            </title>
          </circle>
        ))}

        {/* X-axis labels (show first, mid, last) */}
        {points.length > 0 && [0, Math.floor(points.length / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={chartHeight - 4}
              textAnchor="middle"
              className="fill-gray-400"
              fontSize="9"
            >
              {new Date(points[idx].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </text>
          ))}
      </svg>
      <p className="text-sm text-gray-400 mt-2 text-center">
        {points.length} session{points.length !== 1 ? 's' : ''} tracked
      </p>
    </div>
  );
};

export default ConformanceTrendChart;