import React from 'react';

export interface PositionData {
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

export interface PositionBreakdown {
  positions: PositionData[];
}

interface PositionBreakdownChartProps {
  data: PositionBreakdown;
  isLoading?: boolean;
}

const POSITION_ORDER: PositionData['position'][] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="h-48 bg-gray-200 rounded-lg" />
  </div>
);

const getBarColor = (conformance: number): string => {
  if (conformance >= 75) return '#22c55e'; // green-500
  if (conformance >= 50) return '#2563eb'; // blue-600
  if (conformance >= 30) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
};

export const PositionBreakdownChart: React.FC<PositionBreakdownChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <SkeletonLoader />
      </div>
    );
  }

  const sorted = POSITION_ORDER.map(
    (pos) => data.positions.find((p) => p.position === pos)
  ).filter(Boolean) as PositionData[];

  const chartHeight = 200;
  const chartWidth = 400;
  const paddingX = 40;
  const paddingTop = 16;
  const paddingBottom = 36;
  const plotH = chartHeight - paddingTop - paddingBottom;
  const barCount = sorted.length;
  const gap = 12;
  const barWidth = (chartWidth - paddingX * 2 - gap * (barCount - 1)) / barCount;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conformance by Position</h3>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y grid */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = paddingTop + plotH - (tick / 100) * plotH;
          return (
            <g key={tick}>
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={tick === 0 ? 'none' : '4 2'} />
              <text x={paddingX - 6} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="9">{tick}%</text>
            </g>
          );
        })}

        {/* Bars */}
        {sorted.map((p, i) => {
          const x = paddingX + i * (barWidth + gap);
          const barH = (p.conformance / 100) * plotH;
          const y = paddingTop + plotH - barH;
          return (
            <g key={p.position}>
              <rect x={x} y={y} width={barWidth} height={barH} rx="4" fill={getBarColor(p.conformance)} />
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600">
                {p.conformance.toFixed(0)}%
              </text>
              <text x={x + barWidth / 2} y={chartHeight - 10} textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="500">
                {p.position}
              </text>
              <text x={x + barWidth / 2} y={chartHeight - 0} textAnchor="middle" fill="#9ca3af" fontSize="8">
                {p.handsPlayed}h
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PositionBreakdownChart;