import React from 'react';

interface GtoScoreGaugeProps {
  score: number;
}

export const GtoScoreGauge: React.FC<GtoScoreGaugeProps> = ({ score }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: '#10b981', text: 'text-emerald-500', label: 'Good' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-500', label: 'Fair' };
    return { stroke: '#ef4444', text: 'text-red-500', label: 'Needs Work' };
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color.stroke} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color.text}`}>{clampedScore}</span>
          <span className="text-xs text-gray-500 font-medium">/ 100</span>
        </div>
      </div>
      <div className={`mt-2 text-sm font-semibold ${color.text}`}>{color.label}</div>
      <div className="text-xs text-gray-400">GTO Conformance</div>
    </div>
  );
};

export default GtoScoreGauge;