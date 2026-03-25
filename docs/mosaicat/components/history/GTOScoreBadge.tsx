import React from 'react';

interface GTOScoreBadgeProps {
  score: number;
}

export const GTOScoreBadge: React.FC<GTOScoreBadgeProps> = ({ score }) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  const getStyle = (s: number): { bg: string; text: string; label: string } => {
    if (s >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Optimal' };
    if (s >= 50) return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Decent' };
    return { bg: 'bg-red-50', text: 'text-red-700', label: 'Deviation' };
  };

  const style = getStyle(clampedScore);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span>{clampedScore}</span>
      <span className="opacity-70">·</span>
      <span>{style.label}</span>
    </span>
  );
};

export default GTOScoreBadge;