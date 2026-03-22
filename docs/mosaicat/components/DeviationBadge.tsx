import React from 'react';

interface DeviationBadgeProps {
  severity: 'match' | 'minor' | 'major';
  showLabel?: boolean;
}

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  match: { color: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'GTO Match' },
  minor: { color: 'bg-amber-400', bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Minor Deviation' },
  major: { color: 'bg-red-500', bg: 'bg-red-50 text-red-700 border-red-200', label: 'Major Deviation' },
};

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({
  severity,
  showLabel = false,
}) => {
  const config = severityConfig[severity];

  if (!showLabel) {
    return (
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${config.color}`}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
};

export default DeviationBadge;