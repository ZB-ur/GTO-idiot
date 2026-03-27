import React, { useRef, useEffect } from 'react';

interface ProfitDataPoint {
  handNumber: number;
  cumulativeProfit: number;
  chipStack: number;
}

interface ProfitChartProps {
  dataPoints: ProfitDataPoint[];
  className?: string;
}

export function ProfitChart({ dataPoints, className = '' }: ProfitChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padTop = 20;
    const padBottom = 32;
    const padLeft = 48;
    const padRight = 16;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const profits = dataPoints.map((d) => d.cumulativeProfit);
    const minP = Math.min(0, ...profits);
    const maxP = Math.max(0, ...profits);
    const range = maxP - minP || 1;
    const maxHand = dataPoints[dataPoints.length - 1].handNumber;
    const minHand = dataPoints[0].handNumber;
    const handRange = maxHand - minHand || 1;

    const toX = (hand: number) => padLeft + ((hand - minHand) / handRange) * chartW;
    const toY = (profit: number) => padTop + chartH - ((profit - minP) / range) * chartH;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const val = maxP - (range / gridLines) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(0), padLeft - 8, y + 4);
    }

    // Zero line
    if (minP < 0 && maxP > 0) {
      const zeroY = toY(0);
      ctx.strokeStyle = '#6b7280';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(w - padRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // X-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const xTicks = Math.min(6, dataPoints.length);
    for (let i = 0; i < xTicks; i++) {
      const idx = Math.round((i / (xTicks - 1)) * (dataPoints.length - 1));
      const dp = dataPoints[idx];
      ctx.fillText(`#${dp.handNumber}`, toX(dp.handNumber), h - 8);
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    const lastProfit = dataPoints[dataPoints.length - 1].cumulativeProfit;
    if (lastProfit >= 0) {
      gradient.addColorStop(0, 'rgba(52, 211, 153, 0.3)');
      gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
    }

    ctx.beginPath();
    ctx.moveTo(toX(dataPoints[0].handNumber), toY(dataPoints[0].cumulativeProfit));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(toX(dataPoints[i].handNumber), toY(dataPoints[i].cumulativeProfit));
    }
    ctx.lineTo(toX(dataPoints[dataPoints.length - 1].handNumber), padTop + chartH);
    ctx.lineTo(toX(dataPoints[0].handNumber), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(dataPoints[0].handNumber), toY(dataPoints[0].cumulativeProfit));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(toX(dataPoints[i].handNumber), toY(dataPoints[i].cumulativeProfit));
    }
    ctx.strokeStyle = lastProfit >= 0 ? '#34d399' : '#f87171';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // End dot
    const lastX = toX(dataPoints[dataPoints.length - 1].handNumber);
    const lastY = toY(lastProfit);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lastProfit >= 0 ? '#34d399' : '#f87171';
    ctx.fill();
  }, [dataPoints]);

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-2xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-50 mb-4">Profit / Loss</h3>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '200px' }}
      />
    </div>
  );
}