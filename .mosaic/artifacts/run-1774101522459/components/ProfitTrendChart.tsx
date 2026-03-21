import React, { useMemo } from 'react';

interface DataPoint {
  index: number;
  label?: string;
  cumulativeProfitBB: number;
  evLossBB?: number;
}

interface ProfitTrendChartProps {
  dataPoints: DataPoint[];
  groupBy: 'hand' | 'session';
  className?: string;
}

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  dataPoints,
  groupBy,
  className = '',
}) => {
  const { pathD, areaD, minY, maxY, width, height, zeroY } = useMemo(() => {
    if (dataPoints.length === 0) return { pathD: '', areaD: '', minY: 0, maxY: 0, width: 600, height: 200, zeroY: 100 };

    const w = 600;
    const h = 200;
    const padding = 40;

    const profits = dataPoints.map((d) => d.cumulativeProfitBB);
    const rawMin = Math.min(...profits, 0);
    const rawMax = Math.max(...profits, 0);
    const range = rawMax - rawMin || 1;

    const xScale = (i: number) => padding + (i / Math.max(dataPoints.length - 1, 1)) * (w - 2 * padding);
    const yScale = (v: number) => h - padding - ((v - rawMin) / range) * (h - 2 * padding);

    const points = dataPoints.map((d, i) => `${xScale(i)},${yScale(d.cumulativeProfitBB)}`);
    const path = `M${points.join(' L')}`;
    const area = `${path} L${xScale(dataPoints.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;

    return { pathD: path, areaD: area, minY: rawMin, maxY: rawMax, width: w, height: h, zeroY: yScale(0) };
  }, [dataPoints]);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profit Trend</h3>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          by {groupBy}
        </span>
      </div>

      {dataPoints.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No data available
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
          {/* Grid lines */}
          <line x1="40" y1={zeroY} x2={width - 40} y2={zeroY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

          {/* Area fill */}
          <path d={areaD} fill="url(#profitGradient)" opacity="0.3" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis labels */}
          <text x="35" y="45" textAnchor="end" className="text-[10px] fill-gray-400">{maxY.toFixed(0)} BB</text>
          <text x="35" y={zeroY + 4} textAnchor="end" className="text-[10px] fill-gray-400">0</text>
          <text x="35" y={height - 35} textAnchor="end" className="text-[10px] fill-gray-400">{minY.toFixed(0)} BB</text>
        </svg>
      )}
    </div>
  );
};

export default ProfitTrendChart;