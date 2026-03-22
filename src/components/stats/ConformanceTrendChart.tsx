/**
 * ConformanceTrendChart — renders a line chart of GTO conformance over sessions.
 * Uses pure SVG (no chart library dependency).
 */

import React, { useMemo } from 'react';
import type { ConformanceTrend } from '../../types/stats';

interface ConformanceTrendChartProps {
  data: ConformanceTrend | null;
  loading: boolean;
}

const CHART_W = 600;
const CHART_H = 220;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

export const ConformanceTrendChart: React.FC<ConformanceTrendChartProps> = ({
  data,
  loading,
}) => {
  const points = data?.dataPoints ?? [];

  const { polyline, dots, yTicks, xLabels } = useMemo(() => {
    if (points.length === 0) {
      return { polyline: '', dots: [], yTicks: [] as number[], xLabels: [] as Array<{ x: number; label: string }> };
    }

    const yMin = 0;
    const yMax = 100;
    const yTicks = [0, 25, 50, 75, 100];

    const scaleX = (i: number) =>
      PAD.left + (points.length === 1 ? INNER_W / 2 : (i / (points.length - 1)) * INNER_W);
    const scaleY = (v: number) =>
      PAD.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H;

    const dots = points.map((p, i) => ({
      x: scaleX(i),
      y: scaleY(p.conformance),
      conformance: p.conformance,
      date: new Date(p.date).toLocaleDateString(),
      hands: p.handsPlayed,
    }));

    const polyline = dots.map((d) => `${d.x},${d.y}`).join(' ');

    // Show at most 6 x-labels
    const step = Math.max(1, Math.floor(points.length / 6));
    const xLabels = points
      .filter((_, i) => i % step === 0 || i === points.length - 1)
      .map((p) => {
        const idx = points.indexOf(p);
        return {
          x: scaleX(idx),
          label: new Date(p.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        };
      });

    return { polyline, dots, yTicks, xLabels };
  }, [points]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">GTO Conformance Trend</h3>

      {loading ? (
        <div className="h-56 bg-gray-700 rounded animate-pulse" />
      ) : points.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
          No session data yet. Play some hands to see your trend!
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full h-auto"
          role="img"
          aria-label="GTO conformance trend line chart"
        >
          {/* Grid lines */}
          {yTicks.map((t) => {
            const y = PAD.top + INNER_H - (t / 100) * INNER_H;
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + INNER_W}
                  y1={y}
                  y2={y}
                  stroke="#374151"
                  strokeDasharray="4 4"
                />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-gray-500 text-[10px]">
                  {t}%
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={CHART_H - 8}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              {l.label}
            </text>
          ))}

          {/* Gradient area under line */}
          <defs>
            <linearGradient id="conformance-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {dots.length > 1 && (
            <polygon
              points={`${dots[0].x},${PAD.top + INNER_H} ${polyline} ${dots[dots.length - 1].x},${PAD.top + INNER_H}`}
              fill="url(#conformance-grad)"
            />
          )}

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Dots with hover titles */}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="4" fill="#10b981" stroke="#064e3b" strokeWidth="1.5">
              <title>
                {d.date} — {d.conformance.toFixed(1)}% ({d.hands} hands)
              </title>
            </circle>
          ))}
        </svg>
      )}
    </div>
  );
};
