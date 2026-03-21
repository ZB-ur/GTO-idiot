import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';

interface DataPoint {
  x: number;
  y: number;
  handId?: string;
}

interface ProfitChartProps {
  dataPoints: DataPoint[];
  groupBy?: 'hand' | 'session';
  onPointClick?: (handId: string) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dataPoint: DataPoint | null;
  screenX: number;
  screenY: number;
}

const PADDING = { top: 32, right: 24, bottom: 40, left: 56 };

export const ProfitChart: React.FC<ProfitChartProps> = ({
  dataPoints,
  groupBy = 'hand',
  onPointClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    dataPoint: null,
    screenX: 0,
    screenY: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(280, Math.min(400, entry.contentRect.width * 0.5)),
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const { xScale, yScale, yTicks, xTicks } = useMemo(() => {
    if (dataPoints.length === 0) {
      return {
        xScale: (_: number) => 0,
        yScale: (_: number) => chartH / 2,
        yTicks: [0],
        xTicks: [] as number[],
      };
    }

    const xMin = Math.min(...dataPoints.map((d) => d.x));
    const xMax = Math.max(...dataPoints.map((d) => d.x));
    const yMin = Math.min(...dataPoints.map((d) => d.y), 0);
    const yMax = Math.max(...dataPoints.map((d) => d.y), 0);
    const yPad = Math.max(Math.abs(yMax - yMin) * 0.1, 5);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin + yPad * 2 || 1;

    const xs = (v: number) => ((v - xMin) / xRange) * chartW;
    const ys = (v: number) => chartH - ((v - (yMin - yPad)) / yRange) * chartH;

    // Generate Y ticks
    const rawStep = yRange / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = Math.ceil(rawStep / mag) * mag;
    const ticks: number[] = [];
    const start = Math.floor((yMin - yPad) / step) * step;
    for (let v = start; v <= yMax + yPad; v += step) {
      ticks.push(v);
    }

    // Generate X ticks
    const xStep = Math.max(1, Math.floor(dataPoints.length / 6));
    const xt: number[] = [];
    for (let i = 0; i < dataPoints.length; i += xStep) {
      xt.push(dataPoints[i].x);
    }
    if (xt[xt.length - 1] !== dataPoints[dataPoints.length - 1].x) {
      xt.push(dataPoints[dataPoints.length - 1].x);
    }

    return { xScale: xs, yScale: ys, yTicks: ticks, xTicks: xt };
  }, [dataPoints, chartW, chartH]);

  const linePath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.x)},${yScale(d.y)}`)
      .join(' ');
  }, [dataPoints, xScale, yScale]);

  const areaPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const zeroY = yScale(0);
    const line = dataPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.x)},${yScale(d.y)}`)
      .join(' ');
    return `${line} L${xScale(dataPoints[dataPoints.length - 1].x)},${zeroY} L${xScale(dataPoints[0].x)},${zeroY} Z`;
  }, [dataPoints, xScale, yScale]);

  const zeroLineY = yScale(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (dataPoints.length === 0) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - PADDING.left;

      // Find closest data point
      let closestIdx = 0;
      let closestDist = Infinity;
      dataPoints.forEach((d, i) => {
        const dist = Math.abs(xScale(d.x) - mouseX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      if (closestDist < 30) {
        const dp = dataPoints[closestIdx];
        setTooltip({
          visible: true,
          x: xScale(dp.x),
          y: yScale(dp.y),
          dataPoint: dp,
          screenX: e.clientX,
          screenY: e.clientY,
        });
        setHoveredIndex(closestIdx);
      } else {
        setTooltip((t) => ({ ...t, visible: false, dataPoint: null }));
        setHoveredIndex(null);
      }
    },
    [dataPoints, xScale, yScale]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false, dataPoint: null }));
    setHoveredIndex(null);
  }, []);

  const handleClick = useCallback(() => {
    if (tooltip.dataPoint?.handId && onPointClick) {
      onPointClick(tooltip.dataPoint.handId);
    }
  }, [tooltip.dataPoint, onPointClick]);

  const lastPoint = dataPoints[dataPoints.length - 1];
  const isPositive = lastPoint ? lastPoint.y >= 0 : true;

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-900 rounded-xl border border-gray-700 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-50 text-lg font-semibold">盈亏曲线</h3>
        {lastPoint && (
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-lg ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}
          >
            {isPositive ? '+' : ''}
            {lastPoint.y.toFixed(1)} BB
          </span>
        )}
      </div>

      {/* Chart */}
      {dataPoints.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          暂无数据
        </div>
      ) : (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="profitGradientPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="profitGradientNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <g transform={`translate(${PADDING.left},${PADDING.top})`}>
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  x2={chartW}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke={tick === 0 ? '#6b7280' : '#374151'}
                  strokeWidth={tick === 0 ? 1.5 : 0.5}
                  strokeDasharray={tick === 0 ? 'none' : '4 4'}
                />
                <text
                  x={-8}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500"
                  fontSize={11}
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* X axis labels */}
            {xTicks.map((tick) => (
              <text
                key={tick}
                x={xScale(tick)}
                y={chartH + 24}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                fontSize={11}
              >
                {groupBy === 'session' ? `S${tick}` : `#${tick}`}
              </text>
            ))}

            {/* Area fill */}
            <path
              d={areaPath}
              fill={isPositive ? 'url(#profitGradientPos)' : 'url(#profitGradientNeg)'}
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Hovered point */}
            {hoveredIndex !== null && tooltip.dataPoint && (
              <>
                {/* Vertical guide line */}
                <line
                  x1={tooltip.x}
                  x2={tooltip.x}
                  y1={0}
                  y2={chartH}
                  stroke="#6b7280"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                {/* Point ring */}
                <circle
                  cx={tooltip.x}
                  cy={tooltip.y}
                  r={6}
                  fill="transparent"
                  stroke={tooltip.dataPoint.y >= 0 ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                />
                <circle
                  cx={tooltip.x}
                  cy={tooltip.y}
                  r={3}
                  fill={tooltip.dataPoint.y >= 0 ? '#10b981' : '#ef4444'}
                />
              </>
            )}
          </g>
        </svg>
      )}

      {/* Tooltip */}
      {tooltip.visible && tooltip.dataPoint && (
        <div
          className="absolute z-50 pointer-events-none bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-md text-xs"
          style={{
            left: tooltip.screenX + 12,
            top: tooltip.screenY - 40,
            position: 'fixed',
          }}
        >
          <div className="text-gray-400 mb-1">
            {groupBy === 'session'
              ? `Session ${tooltip.dataPoint.x}`
              : `Hand #${tooltip.dataPoint.x}`}
          </div>
          <div
            className={`font-semibold ${
              tooltip.dataPoint.y >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {tooltip.dataPoint.y >= 0 ? '+' : ''}
            {tooltip.dataPoint.y.toFixed(1)} BB
          </div>
          {tooltip.dataPoint.handId && onPointClick && (
            <div className="text-gray-500 mt-1">点击查看牌局</div>
          )}
        </div>
      )}

      {/* X axis label */}
      <div className="text-center text-xs text-gray-500 mt-1">
        {groupBy === 'session' ? 'Session' : '手数'}
      </div>
    </div>
  );
};

export default ProfitChart;