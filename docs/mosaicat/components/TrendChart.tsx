import React from 'react';

interface TrendDataPoint {
  label: string;
  gtoConformance: number;
  handsCount: number;
}

interface TrendChartProps {
  dataPoints: TrendDataPoint[];
  hasEnoughData: boolean;
  minimumHands: number;
  currentHands: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  dataPoints,
  hasEnoughData,
  minimumHands,
  currentHands,
}) => {
  if (!hasEnoughData) {
    return (
      <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">GTO Conformance Trend</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13l4-4 4 4 4-8 4 4" />
          </svg>
          <p className="text-gray-400 text-sm">
            Play at least <span className="text-emerald-400 font-semibold">{minimumHands}</span> hands to see your trend
          </p>
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{currentHands} / {minimumHands} hands</span>
              <span>{Math.round((currentHands / minimumHands) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min((currentHands / minimumHands) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...dataPoints.map(d => d.gtoConformance), 100);
  const minVal = Math.min(...dataPoints.map(d => d.gtoConformance), 0);
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 200;
  const padX = 40;
  const padY = 20;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const points = dataPoints.map((d, i) => ({
    x: padX + (i / Math.max(dataPoints.length - 1, 1)) * chartW,
    y: padY + chartH - ((d.gtoConformance - minVal) / range) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  const gridLines = [0, 25, 50, 75, 100].map(v => ({
    y: padY + chartH - ((v - minVal) / range) * chartH,
    label: `${v}%`,
  }));

  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">GTO Conformance Trend</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padX} y1={g.y} x2={svgWidth - padX} y2={g.y} stroke="#374151" strokeWidth="0.5" />
            <text x={padX - 6} y={g.y + 3} textAnchor="end" fill="#6b7280" fontSize="9">{g.label}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#trendGrad)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#1e293b" strokeWidth="1.5" />
        ))}
        {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={padY + chartH + 14} textAnchor="middle" fill="#6b7280" fontSize="8">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default TrendChart;