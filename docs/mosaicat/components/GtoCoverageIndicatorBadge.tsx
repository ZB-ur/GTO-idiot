import React from 'react';

interface GtoCoverageIndicatorBadgeProps {
  hasData: boolean;
  className?: string;
}

export const GtoCoverageIndicatorBadge: React.FC<GtoCoverageIndicatorBadgeProps> = ({
  hasData,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-medium
        ${hasData
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-gray-800 text-gray-500 border border-gray-700'
        }
        ${className}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-emerald-400' : 'bg-gray-600'}`}
      />
      GTO
    </span>
  );
};