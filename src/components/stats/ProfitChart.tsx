// ============================================================
// GTO Idiot — Profit Chart Component
// Renders a cumulative profit/loss curve using Canvas 2D
// No external charting library — lightweight custom renderer
// ============================================================

import { useRef, useEffect, useCallback, useState } from 'react';
import type { ProfitDataPoint } from '../../types';

interface ProfitChartProps {
  dataPoints: ProfitDataPoint[];
  height?: number;
  className?: string;
  onPointClick?: (point: ProfitDataPoint) => void;
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
const GRID_COLOR = '#374151'; // gray-700
const ZERO_LINE_COLOR = '#6b7280'; // gray-500
const LINE_COLOR = '#10b981'; // green-500
const NEGATIVE_LINE_COLOR = '#ef4444'; // red-500
const TEXT_COLOR = '#9ca3af'; // gray-400
const TOOLTIP_BG = '#1f2937'; // gray-800

export default function ProfitChart({
  dataPoints,
  height = 300,
  className = '',
  onPointClick,
}: ProfitChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    point: ProfitDataPoint;
  } | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(600);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    drawChart(ctx, dataPoints, canvasWidth, height);
  }, [dataPoints, canvasWidth, height]);

  // Mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dataPoints.length === 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const chartW = canvasWidth - PADDING.left - PADDING.right;
      const relX = mouseX - PADDING.left;
      const index = Math.round((relX / chartW) * (dataPoints.length - 1));

      if (index >= 0 && index < dataPoints.length) {
        const point = dataPoints[index];
        const xPos = PADDING.left + (index / (dataPoints.length - 1)) * chartW;
        const { minY, maxY } = getYRange(dataPoints);
        const chartH = height - PADDING.top - PADDING.bottom;
        const yRange = maxY - minY || 1;
        const yPos = PADDING.top + ((maxY - point.y) / yRange) * chartH;

        setTooltip({ x: xPos, y: yPos, point });
      }
    },
    [dataPoints, canvasWidth, height],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleClick = useCallback(() => {
    if (tooltip && onPointClick) {
      onPointClick(tooltip.point);
    }
  }, [tooltip, onPointClick]);

  if (dataPoints.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 ${className}`} style={{ height }}>
        <p className="text-sm text-gray-500">No data to display. Play some hands first!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-crosshair rounded-lg border border-gray-700 bg-gray-900"
        style={{ width: '100%', height }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-600 px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(tooltip.x + 12, canvasWidth - 140),
            top: Math.max(tooltip.y - 40, 0),
            backgroundColor: TOOLTIP_BG,
          }}
        >
          <div className="text-gray-400">Hand #{tooltip.point.x}</div>
          <div
            className={`font-semibold ${
              tooltip.point.y >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {tooltip.point.y >= 0 ? '+' : ''}{tooltip.point.y.toFixed(1)} BB
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Chart Drawing
// ============================================================

function drawChart(
  ctx: CanvasRenderingContext2D,
  points: ProfitDataPoint[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const { minY, maxY } = getYRange(points);
  const yRange = maxY - minY || 1;

  // Grid lines
  const gridLines = 5;
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridLines; i++) {
    const y = PADDING.top + (i / gridLines) * chartH;
    const val = maxY - (i / gridLines) * yRange;

    ctx.beginPath();
    ctx.moveTo(PADDING.left, y);
    ctx.lineTo(width - PADDING.right, y);
    ctx.stroke();

    ctx.fillText(`${val.toFixed(0)} BB`, PADDING.left - 8, y + 4);
  }

  // Zero line
  if (minY < 0 && maxY > 0) {
    const zeroY = PADDING.top + (maxY / yRange) * chartH;
    ctx.strokeStyle = ZERO_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING.left, zeroY);
    ctx.lineTo(width - PADDING.right, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // X-axis labels
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  const xLabelCount = Math.min(points.length, 8);
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.round((i / (xLabelCount - 1)) * (points.length - 1));
    const x = PADDING.left + (idx / (points.length - 1)) * chartW;
    ctx.fillText(`${points[idx].x}`, x, height - PADDING.bottom + 20);
  }

  // Profit curve line
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Draw line segments, coloring based on value
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = PADDING.left + (i / (points.length - 1)) * chartW;
    const y1 = PADDING.top + ((maxY - points[i].y) / yRange) * chartH;
    const x2 = PADDING.left + ((i + 1) / (points.length - 1)) * chartW;
    const y2 = PADDING.top + ((maxY - points[i + 1].y) / yRange) * chartH;

    ctx.strokeStyle = points[i + 1].y >= 0 ? LINE_COLOR : NEGATIVE_LINE_COLOR;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Fill gradient under the line
  if (points.length > 1) {
    const gradient = ctx.createLinearGradient(0, PADDING.top, 0, height - PADDING.bottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, height - PADDING.bottom);

    for (let i = 0; i < points.length; i++) {
      const x = PADDING.left + (i / (points.length - 1)) * chartW;
      const y = PADDING.top + ((maxY - points[i].y) / yRange) * chartH;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(PADDING.left + chartW, height - PADDING.bottom);
    ctx.closePath();
    ctx.fill();
  }
}

function getYRange(points: ProfitDataPoint[]): { minY: number; maxY: number } {
  let minY = 0;
  let maxY = 0;

  for (const p of points) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Add 10% padding
  const padding = Math.max(Math.abs(maxY - minY) * 0.1, 1);
  return { minY: minY - padding, maxY: maxY + padding };
}
