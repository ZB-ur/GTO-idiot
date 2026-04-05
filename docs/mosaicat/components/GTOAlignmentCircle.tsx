import React from 'react';

interface GTOAlignmentCircleProps {
  score: number;
}

export const GTOAlignmentCircle: React.FC<GTOAlignmentCircleProps> = ({ score }) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: '#34d399', text: 'text-emerald-400', label: 'Good' };
    if (s >= 40) return { stroke: '#fb923c', text: 'text-orange-400', label: 'Needs Work' };
    return { stroke: '#f87171', text: 'text-red-400', label: 'Poor' };
  };

  const { stroke, text, label } = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 136, height: 136 }}>
        <svg width="136" height="136" viewBox="0 0 136 136">
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth="10"
          />
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 68 68)"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${text}`}>{clampedScore}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-medium text-gray-50">GTO Alignment</span>
        <span className={`text-xs ${text}`}>{label}</span>
      </div>
    </div>
  );
};