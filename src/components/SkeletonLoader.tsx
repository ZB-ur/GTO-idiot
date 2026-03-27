import type { ReactNode } from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

export function SkeletonLoader({ rows = 3, className = '' }: SkeletonLoaderProps): ReactNode {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="加载中">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-4 flex-1 rounded bg-gray-800" />
          {i % 2 === 0 && <div className="h-4 w-1/4 rounded bg-gray-800" />}
        </div>
      ))}
      <span className="sr-only">加载中...</span>
    </div>
  );
}
