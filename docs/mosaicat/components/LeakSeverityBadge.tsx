import React from 'react';

export type LeakSeverity = 'high' | 'medium' | 'low';

export interface LeakSeverityBadgeProps {
  severity: LeakSeverity;
  className?: string;
}

const severityConfig: Record<LeakSeverity, { label: string; bg: string; text: string; dot: string }> = {
  high: {
    label: 'High',
    bg: 'bg-red-400/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-400/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  low: {
    label: 'Low',
    bg: 'bg-sky-400/15',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
  },
};

export const LeakSeverityBadge: React.FC<LeakSeverityBadgeProps> = ({ severity, className = '' }) => {
  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default LeakSeverityBadge;