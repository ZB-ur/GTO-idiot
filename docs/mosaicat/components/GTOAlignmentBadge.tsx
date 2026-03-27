import React from 'react';

interface GTOAlignmentBadgeProps {
  isAligned: boolean;
}

export const GTOAlignmentBadge: React.FC<GTOAlignmentBadgeProps> = ({
  isAligned,
}) => {
  const classes = isAligned
    ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
    : 'bg-orange-400/15 text-orange-400 border-orange-400/30';

  const icon = isAligned ? '✓' : '✗';
  const label = isAligned ? 'GTO Aligned' : 'Deviation';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${classes}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};