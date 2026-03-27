import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BankrollDataPoint {
  handIndex: number;
  cumulativeResult: number;
  sessionId: string;
}

interface BankrollGraphProps {
  data: BankrollDataPoint[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: BankrollDataPoint | null;
}

const PADDING = { top: 24, right: 24, bottom: 40, left: 56 };

export const BankrollGraph: React.FC<BankrollGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, point: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  if (data.length === 0 || chartW <= 0 || chartH <= 0) {
    return (
      <div ref={containerRef} className="rounded-xl bg-gray-900 border border-gray-700 p-6 h-64 flex items-center justify-center">
        <span className="text-sm text-gray-500">No data available</span>
      </div>
    );
  }

  const minX = data[0].handIndex;
  const maxX = data[data.length - 1].handIndex;
  const values = data.map((d) => d.cumulativeResult);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(0, ...values);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const yPad = rangeY * 0.1;

  const scaleX = (v: number) => PADDING.left + ((v - minX) / rangeX) * chartW;
  const scaleY = (v: number) => PADDING.top + chartH - ((v - (minY - yPad)) / (rangeY + yPad * 2)) * chartH;

  // Build SVG path
  const pathPoints = data.map((d) => `${scaleX(d.handIndex)},${scaleY(d.cumulativeResult)}`);
  const linePath = `M${pathPoints.join('L')}`;

  // Gradient area
  const zeroY = scaleY(0);
  const areaPath = `${linePath}L${scaleX(maxX)},${zeroY}L${scaleX(minX)},${zeroY}Z`;

  // Y-axis ticks
  const yTicks: number[] = [];
  const yStep = Math.ceil(rangeY / 5 / 50) * 50 || 50;
  for (let v = Math.floor(minY / yStep) * yStep; v <= maxY + yStep; v += yStep) {
    yTicks.push(v);
  }

  // X-axis ticks
  const xTicks: number[] = [];
  const xStep = Math.ceil(rangeX / 6 / 10) * 10 || 10;
  for (let v = Math.ceil(minX / xStep) * xStep; v <= maxX; v += xStep) {
    xTicks.push(v);
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const dataX = minX + ((mouseX - PADDING.left) / chartW) * rangeX;

      // Find closest point
      let closest = data[0];
      let closestDist = Math.abs(data[0].handIndex - dataX);
      for (const d of data) {
        const dist = Math.abs(d.handIndex - dataX);
        if (dist < closestDist) {
          closest = d;
          closestDist = dist;
        }
      }

      setTooltip({
        visible: true,
        x: scaleX(closest.handIndex),
        y: scaleY(closest.cumulativeResult),
        point: closest,
      });
    },
    [data, minX, chartW, rangeX],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const lastValue = data[data.length - 1].cumulativeResult;
  const lineColor = lastValue >= 0 ? '#34d399' : '#f87171';

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-50">Bankroll</span>
        <span className={`text-lg font-bold ${lastValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {lastValue >= 0 ? '+' : ''}{lastValue}
        </span>
      </div>
      <div ref={containerRef} className="relative" style={{ height: 240 }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            className="cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((v) => (
              <g key={`y-${v}`}>
                <line
                  x1={PADDING.left} y1={scaleY(v)}
                  x2={width - PADDING.right} y2={scaleY(v)}
                  stroke="#374151" strokeDasharray="4,4"
                />
                <text
                  x={PADDING.left - 8} y={scaleY(v) + 4}
                  textAnchor="end" fill="#6b7280" fontSize={10}
                >
                  {v}
                </text>
              </g>
            ))}

            {/* Zero line */}
            <line
              x1={PADDING.left} y1={scaleY(0)}
              x2={width - PADDING.right} y2={scaleY(0)}
              stroke="#4b5563" strokeWidth={1}
            />

            {/* X-axis labels */}
            {xTicks.map((v) => (
              <text
                key={`x-${v}`}
                x={scaleX(v)} y={height - 8}
                textAnchor="middle" fill="#6b7280" fontSize={10}
              >
                #{v}
              </text>
            ))}

            {/* Area */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />

            {/* Tooltip crosshair + dot */}
            {tooltip.visible && tooltip.point && (
              <>
                <line
                  x1={tooltip.x} y1={PADDING.top}
                  x2={tooltip.x} y2={height - PADDING.bottom}
                  stroke="#6b7280" strokeDasharray="2,2"
                />
                <circle
                  cx={tooltip.x} cy={tooltip.y}
                  r={5} fill={lineColor} stroke="#030712" strokeWidth={2}
                />
              </>
            )}
          </svg>
        )}

        {/* Tooltip popup */}
        {tooltip.visible && tooltip.point && (
          <div
            className="absolute pointer-events-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl z-20"
            style={{
              left: Math.min(tooltip.x + 12, width - 140),
              top: tooltip.y - 48,
            }}
          >
            <div className="text-[10px] text-gray-500">Hand #{tooltip.point.handIndex}</div>
            <div className={`text-sm font-bold ${tooltip.point.cumulativeResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tooltip.point.cumulativeResult >= 0 ? '+' : ''}{tooltip.point.cumulativeResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankrollGraph;