// ============================================================
// Skeleton loading placeholders
// ============================================================

import React from 'react';

interface SkeletonProps {
  className?: string;
  /** Width in Tailwind class, e.g. "w-32" */
  width?: string;
  /** Height in Tailwind class, e.g. "h-6" */
  height?: string;
  /** Shape variant */
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  variant = 'text',
}) => {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'rect'
        ? 'rounded-lg'
        : 'rounded';

  return (
    <div
      className={`animate-pulse bg-gray-700 ${shapeClass} ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
};

// Pre-composed skeleton layouts

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="card-container space-y-3">
    <Skeleton height="h-5" width="w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height="h-4" width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-2">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="h-5" width="w-24" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height="h-4" width="w-24" />
        ))}
      </div>
    ))}
  </div>
);
