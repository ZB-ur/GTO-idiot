import React from 'react';

interface SkeletonChartProps {
  height?: number;
  className?: string;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  height = 200,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-gray-900 rounded-xl border border-gray-700 p-6 ${className}`}
      style={{ height }}
    >
      {/* Y-axis labels */}
      <div className="flex h-full gap-4">
        <div className="flex flex-col justify-between py-2">
          <div className="h-3 w-8 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-6 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-8 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-6 rounded bg-gray-800 animate-pulse" />
        </div>
        {/* Chart area */}
        <div className="flex-1 flex items-end gap-2">
          {[40, 65, 30, 80, 55, 70, 45, 60, 35, 75, 50, 68].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-800 rounded-t animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonChart;