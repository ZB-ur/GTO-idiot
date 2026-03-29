import React from 'react';

type Severity = 'none' | 'minor' | 'major';

interface DeviationBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
}

const severityConfig: Record<Severity, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
  none: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    defaultLabel: 'GTO',
  },
  minor: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    defaultLabel: 'Minor Deviation',
  },
  major: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    defaultLabel: 'Major Deviation',
  },
};

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({
  severity,
  label,
  className = '',
}) => {
  const config = severityConfig[severity];
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        text-xs font-semibold
        rounded-lg border
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
};

export default DeviationBadge;