import React from 'react';
import { ConfidenceBadge } from './ConfidenceBadge';

interface EVDisplayProps {
  evDifference: number;
  quality: 'good' | 'minor_deviation' | 'major_deviation';
  confidence?: {
    level: 'high' | 'medium' | 'low';
    warning?: string;
  };
}

const QUALITY_CONFIG = {
  good: {
    color: '#22c55e',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-700',
    label: '符合 GTO',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  minor_deviation: {
    color: '#eab308',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-700',
    label: '轻微偏差',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  major_deviation: {
    color: '#ef4444',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-700',
    label: '严重偏差',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
} as const;

export const EVDisplay: React.FC<EVDisplayProps> = ({
  evDifference,
  quality,
  confidence,
}) => {
  const config = QUALITY_CONFIG[quality];
  const formattedEV = evDifference === 0
    ? '0.00'
    : `-${evDifference.toFixed(2)}`;

  return (
    <div className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 ${config.bgClass} ${config.borderClass}`}>
      {/* Icon */}
      <div className={config.textClass}>
        {config.icon}
      </div>

      {/* EV Value */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: config.color }}
          >
            {formattedEV}
          </span>
          <span className="text-xs font-medium text-gray-400">BB</span>
        </div>
        <span className={`text-xs font-medium ${config.textClass}`}>
          {config.label}
        </span>
      </div>

      {/* Confidence Badge */}
      {confidence && (
        <div className="ml-1 border-l border-gray-200 pl-3">
          <ConfidenceBadge level={confidence.level} warning={confidence.warning} />
        </div>
      )}
    </div>
  );
};

export default EVDisplay;