import React from 'react';

interface GTOScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
};

export const GTOScoreGauge: React.FC<GTOScoreGaugeProps> = ({ score, size = 'md' }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color: >=80 green, >=50 amber, <50 red
  const getStrokeColor = (s: number): string => {
    if (s >= 80) return '#10b981'; // emerald-500
    if (s >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getTextColor = (s: number): string => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg
          width={config.dimension}
          height={config.dimension}
          className="-rotate-90"
        >
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor(clampedScore)}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.fontSize} ${getTextColor(clampedScore)}`}>
            {clampedScore}
          </span>
        </div>
      </div>
      <span className={`font-medium text-gray-500 uppercase tracking-wide ${config.labelSize}`}>
        GTO Score
      </span>
    </div>
  );
};

export default GTOScoreGauge;