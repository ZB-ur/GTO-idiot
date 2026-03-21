// ============================================================
// StatCard — Individual metric card for stats overview
// ============================================================

import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional secondary text below the value */
  subtext?: string;
  /** Color accent: positive (green), negative (red), neutral (gray) */
  sentiment?: 'positive' | 'negative' | 'neutral';
  /** Optional icon/emoji */
  icon?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  sentiment = 'neutral',
  icon,
}) => {
  const sentimentColor =
    sentiment === 'positive'
      ? 'text-green-400'
      : sentiment === 'negative'
        ? 'text-red-400'
        : 'text-gray-200';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon && (
          <span className="text-base" role="img" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${sentimentColor}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  );
};
