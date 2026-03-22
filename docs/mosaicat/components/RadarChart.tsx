import React from 'react';

interface RadarData {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarData[];
  maxValue?: number;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  maxValue = 100,
  size = 240,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 30;
  const levels = 4;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (i: number, r: number) => ({
    x: cx + r * Math.cos(i * angleStep - Math.PI / 2),
    y: cy + r * Math.sin(i * angleStep - Math.PI / 2),
  });

  const gridRings = Array.from({ length: levels }, (_, l) => {
    const r = (radius * (l + 1)) / levels;
    const pts = Array.from({ length: n }, (_, i) => getPoint(i, r));
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  const dataPoints = data.map((d, i) => {
    const r = (d.value / maxValue) * radius;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const axes = Array.from({ length: n }, (_, i) => getPoint(i, radius));
  const labelPoints = Array.from({ length: n }, (_, i) => getPoint(i, radius + 16));

  return (
    <svg width={size} height={size} className="mx-auto">
      {gridRings.map((pts, l) => (
        <polygon
          key={l}
          points={pts}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {axes.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      <polygon
        points={dataPolygon}
        fill="rgba(37, 99, 235, 0.15)"
        stroke="#2563eb"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#2563eb" />
      ))}
      {labelPoints.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-500 text-[11px] font-medium"
        >
          {data[i].label}
        </text>
      ))}
    </svg>
  );
};