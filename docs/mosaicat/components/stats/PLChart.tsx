import React, { useRef, useEffect } from 'react';

export interface PLDataPoint {
  handIndex: number;
  cumulativeBB: number;
  handId?: string;
  sessionId?: string;
}

interface PLChartProps {
  dataPoints: PLDataPoint[];
}

export const PLChart: React.FC<PLChartProps> = ({ dataPoints }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 16, bottom: 32, left: 48 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const maxX = Math.max(...dataPoints.map((d) => d.handIndex));
    const values = dataPoints.map((d) => d.cumulativeBB);
    const minY = Math.min(0, ...values);
    const maxY = Math.max(0, ...values);
    const rangeY = maxY - minY || 1;

    const toX = (i: number) => pad.left + (i / maxX) * chartW;
    const toY = (v: number) => pad.top + (1 - (v - minY) / rangeY) * chartH;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Zero line
    const zeroY = toY(0);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, zeroY);
    ctx.lineTo(w - pad.right, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    const lastVal = dataPoints[dataPoints.length - 1].cumulativeBB;
    if (lastVal >= 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.25)');
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(toX(dataPoints[0].handIndex), zeroY);
    dataPoints.forEach((d) => ctx.lineTo(toX(d.handIndex), toY(d.cumulativeBB)));
    ctx.lineTo(toX(dataPoints[dataPoints.length - 1].handIndex), zeroY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    dataPoints.forEach((d, i) => {
      const x = toX(d.handIndex);
      const y = toY(d.cumulativeBB);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lastVal >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', pad.left, h - 8);
    ctx.fillText(String(maxX), w - pad.right, h - 8);
    ctx.fillText('手牌数', w / 2, h - 4);

    ctx.textAlign = 'right';
    ctx.fillText(`${maxY.toFixed(1)}`, pad.left - 6, pad.top + 4);
    ctx.fillText(`${minY.toFixed(1)}`, pad.left - 6, h - pad.bottom);
    ctx.fillText('0', pad.left - 6, zeroY + 4);
  }, [dataPoints]);

  if (dataPoints.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex items-center justify-center h-64">
        <span className="text-gray-500 text-sm">暂无数据</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">盈亏走势</h3>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 200 }}
      />
    </div>
  );
};