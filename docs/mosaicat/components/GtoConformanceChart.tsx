import React from 'react';

interface GtoConformanceChartProps {
  conformance: number;
  className?: string;
}

function getConformanceColor(value: number): { text: string; ring: string; label: string } {
  if (value >= 75) return { text: 'text-emerald-500', ring: 'text-emerald-500', label: 'Strong' };
  if (value >= 50) return { text: 'text-yellow-500', ring: 'text-yellow-500', label: 'Moderate' };
  if (value >= 25) return { text: 'text-amber-500', ring: 'text-amber-500', label: 'Weak' };
  return { text: 'text-red-500', ring: 'text-red-500', label: 'Poor' };
}

export const GtoConformanceChart: React.FC<GtoConformanceChartProps> = ({
  conformance,
  className = '',
}) => {
  const { text, ring, label } = getConformanceColor(conformance);
  const circumference = 2 * Math.PI * 54; // radius = 54
  const dashOffset = circumference - (conformance / 100) * circumference;

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-50 mb-4">GTO Conformance</h3>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-700"
            />
            {/* Progress arc */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={ring}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${text}`}>
              {conformance.toFixed(0)}%
            </span>
            <span className={`text-xs font-medium ${text}`}>{label}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-400">Match (≥75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Moderate (50-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-400">Weak (25-49%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-400">Poor (&lt;25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GtoConformanceChart;