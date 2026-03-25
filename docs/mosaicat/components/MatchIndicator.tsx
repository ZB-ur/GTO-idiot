import React from 'react';

export type GTOMatchLevel = 'match' | 'minor_deviation' | 'major_deviation';

export interface MatchIndicatorProps {
  level: GTOMatchLevel;
}

const levelConfig: Record<GTOMatchLevel, { icon: string; label: string; color: string; bgColor: string }> = {
  match: {
    icon: '✓',
    label: '符合 GTO',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  minor_deviation: {
    icon: '⚠',
    label: '轻微偏离',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  major_deviation: {
    icon: '✕',
    label: '严重偏离',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
};

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({ level }) => {
  const config = levelConfig[level];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-sm font-medium rounded-lg border
        ${config.bgColor}
      `}
    >
      <span className={`text-base font-bold ${config.color}`}>
        {config.icon}
      </span>
      <span className={config.color}>
        {config.label}
      </span>
    </span>
  );
};

export default MatchIndicator;