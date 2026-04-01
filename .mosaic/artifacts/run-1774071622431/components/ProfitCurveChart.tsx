import React, { useRef, useEffect } from 'react';

interface DataPoint {
  handNumber: number;
  cumulativeProfitBB: number;
}

interface ProfitCurveChartProps {
  data: DataPoint[];
}

export const ProfitCurveChart: React.FC<ProfitCurveChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length === 0) {
    return (
      <div className="w-full h-64 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
        No data yet
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxHand = Math.max(...data.map((d) => d.handNumber));
  const minProfit = Math.min(...data.map((d) => d.cumulativeProfitBB), 0);
  const maxProfit = Math.max(...data.map((d) => d.cumulativeProfitBB), 0);
  const profitRange = maxProfit - minProfit || 1;

  const scaleX = (v: number) => padding.left + (v / maxHand) * chartW;
  const scaleY = (v: number) => padding.top + chartH - ((v - minProfit) / profitRange) * chartH;

  const pathData = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.handNumber)} ${scaleY(d.cumulativeProfitBB)}`)
    .join(' ');

  const zeroY = scaleY(0);
  const lastPoint = data[data.length - 1];
  const isPositive = lastPoint.cumulativeProfitBB >= 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Profit Curve (BB)</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Zero line */}
        <line
          x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY}
          stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4"
        />
        {/* Y-axis labels */}
        <text x={padding.left - 8} y={scaleY(maxProfit) + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
          {maxProfit.toFixed(0)}
        </text>
        <text x={padding.left - 8} y={zeroY + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
          0
        </text>
        {minProfit < 0 && (
          <text x={padding.left - 8} y={scaleY(minProfit) + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
            {minProfit.toFixed(0)}
          </text>
        )}
        {/* X-axis labels */}
        <text x={padding.left} y={height - 8} textAnchor="middle" className="fill-gray-400 text-[10px]">
          1
        </text>
        <text x={width - padding.right} y={height - 8} textAnchor="middle" className="fill-gray-400 text-[10px]">
          {maxHand}
        </text>
        {/* Line */}
        <path d={pathData} fill="none" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth="2" />
        {/* End point dot */}
        <circle
          cx={scaleX(lastPoint.handNumber)}
          cy={scaleY(lastPoint.cumulativeProfitBB)}
          r="4"
          fill={isPositive ? '#10b981' : '#ef4444'}
        />
      </svg>
    </div>
  );
};

export default ProfitCurveChart;