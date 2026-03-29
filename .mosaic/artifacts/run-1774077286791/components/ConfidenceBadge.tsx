import React, { useState } from 'react';

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  warning?: string;
}

const LEVEL_CONFIG = {
  high: {
    label: '高置信度',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
  },
  medium: {
    label: '中置信度',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: '低置信度',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
} as const;

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, warning }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = LEVEL_CONFIG[level];

  return (
    <div className="relative inline-flex">
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} cursor-default`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
        {(level === 'medium' || level === 'low') && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
      </span>

      {showTooltip && warning && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-md">
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white" />
          {warning}
        </div>
      )}
    </div>
  );
};

export default ConfidenceBadge;