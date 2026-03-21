'use client';

import { useMemo } from 'react';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface ProfitChartProps {
  dataPoints: DataPoint[];
  className?: string;
}

export default function ProfitChart({ dataPoints, className = '' }: ProfitChartProps) {
  const { path, areaPath, minY, maxY, zeroY } = useMemo(() => {
    if (dataPoints.length === 0) {
      return { path: '', areaPath: '', minY: -10, maxY: 10, zeroY: 50 };
    }

    const ys = dataPoints.map((d) => d.y);
    const min = Math.min(...ys, 0);
    const max = Math.max(...ys, 0);
    const padding = Math.max((max - min) * 0.1, 1);
    const yMin = min - padding;
    const yMax = max + padding;

    const w = 400;
    const h = 160;

    const toSvgX = (i: number) => (i / Math.max(dataPoints.length - 1, 1)) * w;
    const toSvgY = (v: number) => h - ((v - yMin) / (yMax - yMin)) * h;

    const points = dataPoints.map((d, i) => `${toSvgX(i)},${toSvgY(d.y)}`);
    const linePath = `M${points.join('L')}`;
    const area = `${linePath}L${w},${h}L0,${h}Z`;
    const zero = toSvgY(0);

    return { path: linePath, areaPath: area, minY: yMin, maxY: yMax, zeroY: zero };
  }, [dataPoints]);

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${className}`}>
      <h4 className="text-gray-200 text-sm font-semibold mb-3">Profit / Loss (BB)</h4>
      <div className="relative">
        <svg viewBox="0 0 400 160" className="w-full h-40" preserveAspectRatio="none">
          {/* Zero line */}
          <line
            x1="0" y1={zeroY} x2="400" y2={zeroY}
            stroke="#4b5563" strokeWidth="1" strokeDasharray="4 4"
          />
          {/* Area fill */}
          <path d={areaPath} fill="url(#profitGradient)" opacity="0.3" />
          {/* Line */}
          <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-1">
          <span className="text-gray-500 text-[10px] font-mono">Hand 1</span>
          <span className="text-gray-500 text-[10px] font-mono">
            Hand {dataPoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}