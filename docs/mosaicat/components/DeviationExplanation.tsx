import React from 'react';

export type DeviationLevel = 'minor_deviation' | 'major_deviation';

export interface DeviationExplanationProps {
  tip: string;
  level: DeviationLevel;
}

const levelConfig: Record<DeviationLevel, { icon: string; borderColor: string; bgColor: string; textColor: string; accentColor: string }> = {
  minor_deviation: {
    icon: '⚠',
    borderColor: 'border-yellow-300',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    accentColor: 'text-yellow-500',
  },
  major_deviation: {
    icon: '⛔',
    borderColor: 'border-red-300',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    accentColor: 'text-red-500',
  },
};

export const DeviationExplanation: React.FC<DeviationExplanationProps> = ({ tip, level }) => {
  const config = levelConfig[level];

  return (
    <div
      className={`
        flex items-start gap-2 px-3 py-2.5
        rounded-lg border
        ${config.borderColor} ${config.bgColor}
      `}
    >
      <span className={`text-base flex-shrink-0 mt-0.5 ${config.accentColor}`}>
        {config.icon}
      </span>
      <p className={`text-sm leading-relaxed ${config.textColor}`}>
        {tip}
      </p>
    </div>
  );
};

export default DeviationExplanation;