import React from 'react';

interface GtoCoverageBadgeProps {
  hasData: boolean;
  className?: string;
}

export const GtoCoverageBadge: React.FC<GtoCoverageBadgeProps> = ({ hasData, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
        hasData
          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          : 'bg-gray-800 text-gray-500 border border-gray-700'
      } ${className}`}
    >
      {hasData ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          GTO数据可用
        </>
      ) : (
        <>
          <span className="text-gray-600">—</span>
          无GTO数据
        </>
      )}
    </span>
  );
};