import { useRef } from 'react';
import type { ProfitDataPoint } from '../../services/history-service';

interface ProfitChartProps {
  readonly dataPoints: readonly ProfitDataPoint[];
  readonly height?: number;
}

/**
 * Simple SVG line chart showing cumulative profit over time.
 */
export function ProfitChart({ dataPoints, height = 200 }: ProfitChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (dataPoints.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50"
        style={{ height }}
      >
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  const values = dataPoints.map(d => d.y);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(0, ...values);
  const rangeY = maxY - minY || 1;

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / Math.max(dataPoints.length - 1, 1)) * innerWidth;
  const yScale = (v: number) => padding.top + (1 - (v - minY) / rangeY) * innerHeight;

  // Build path
  const pathD = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
    .join(' ');

  // Build gradient area path
  const areaD = `${pathD} L ${xScale(dataPoints.length - 1).toFixed(1)} ${yScale(0).toFixed(1)} L ${xScale(0).toFixed(1)} ${yScale(0).toFixed(1)} Z`;

  const lastPoint = dataPoints[dataPoints.length - 1];
  const isPositive = lastPoint ? lastPoint.y >= 0 : true;
  const strokeColor = isPositive ? '#4ade80' : '#f87171';
  const fillColor = isPositive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)';

  // Zero line y position
  const zeroY = yScale(0);

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const val = minY + (rangeY * i) / (tickCount - 1);
    return Math.round(val * 10) / 10;
  });

  return (
    <div ref={containerRef} className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis ticks */}
        {yTicks.map(tick => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={chartWidth - padding.right}
              y2={yScale(tick)}
              stroke="#374151"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="fill-gray-500"
              fontSize="11"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Zero line */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={chartWidth - padding.right}
          y2={zeroY}
          stroke="#6b7280"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Area fill */}
        <path d={areaD} fill={fillColor} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* End dot */}
        {lastPoint && (
          <circle
            cx={xScale(dataPoints.length - 1)}
            cy={yScale(lastPoint.y)}
            r="4"
            fill={strokeColor}
            stroke="#1f2937"
            strokeWidth="2"
          />
        )}

        {/* X-axis label */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 5}
          textAnchor="middle"
          className="fill-gray-500"
          fontSize="11"
        >
          Hands
        </text>

        {/* Y-axis label */}
        <text
          x={12}
          y={chartHeight / 2}
          textAnchor="middle"
          className="fill-gray-500"
          fontSize="11"
          transform={`rotate(-90, 12, ${chartHeight / 2})`}
        >
          Profit (BB)
        </text>
      </svg>
    </div>
  );
}
