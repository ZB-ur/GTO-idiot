import React from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  showLabels?: boolean;
  height?: number;
}

const defaultColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'];

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue = 100,
  showLabels = true,
  height = 200,
}) => {
  return (
    <div className="w-full">
      <div
        className="flex items-end justify-around gap-3"
        style={{ height }}
      >
        {data.map((d, i) => {
          const pct = Math.min((d.value / maxValue) * 100, 100);
          const colorClass = d.color ?? defaultColors[i % defaultColors.length];
          return (
            <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold text-gray-700">{d.value}%</span>
              <div className="w-full max-w-[48px] relative" style={{ height: '100%' }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t-md ${colorClass} transition-all duration-500`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              {showLabels && (
                <span className="text-xs text-gray-500 font-medium text-center mt-1">
                  {d.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};