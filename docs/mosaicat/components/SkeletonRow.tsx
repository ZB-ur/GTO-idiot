import React from 'react';

interface SkeletonRowProps {
  count?: number;
  height?: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ count = 3, height = 48 }) => {
  return (
    <div className="space-y-3" role="status" aria-label="加载中">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-xl border border-gray-200 px-4 flex items-center gap-4"
          style={{ height: `${height}px` }}
        >
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex-1" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded-lg" />
        </div>
      ))}
      <span className="sr-only">加载中…</span>
    </div>
  );
};

export default SkeletonRow;