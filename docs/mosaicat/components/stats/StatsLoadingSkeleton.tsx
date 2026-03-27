import React from 'react';

interface SkeletonBlockProps {
  className?: string;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => (
  <div className={`bg-gray-800 rounded-lg animate-pulse ${className}`} />
);

const SkeletonText: React.FC<SkeletonBlockProps> = ({ className = '' }) => (
  <div className={`bg-gray-800 rounded animate-pulse h-4 ${className}`} />
);

export const StatsLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-6">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonText className="w-64" />
      </div>

      {/* Summary Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-card-${i}`}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3"
          >
            <SkeletonText className="w-20 h-3" />
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonText className="w-16 h-3" />
          </div>
        ))}
      </div>

      {/* P/L Chart Skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-32" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        {/* Chart area */}
        <div className="relative h-48 flex items-end gap-1 pt-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`bar-${i}`}
              className="flex-1 bg-gray-800 rounded-t animate-pulse"
              style={{
                height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 30}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonText key={`x-${i}`} className="w-8 h-3" />
          ))}
        </div>
      </div>

      {/* GTO Metrics + Win Rate Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GTO Compliance Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <SkeletonBlock className="h-6 w-36" />
          <div className="flex items-center gap-6">
            {/* Circular progress placeholder */}
            <SkeletonBlock className="h-24 w-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-3 rounded-full" />
                <SkeletonText className="w-24" />
                <SkeletonText className="w-8 ml-auto" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-3 rounded-full" />
                <SkeletonText className="w-20" />
                <SkeletonText className="w-8 ml-auto" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-3 rounded-full" />
                <SkeletonText className="w-16" />
                <SkeletonText className="w-8 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Session Summary Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <SkeletonBlock className="h-6 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`session-${i}`} className="flex justify-between items-center">
                <SkeletonText className="w-28" />
                <SkeletonText className="w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Hands Table Skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-28" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-800">
          {['w-12', 'w-16', 'w-20', 'w-14', 'w-24'].map((w, i) => (
            <SkeletonText key={`th-${i}`} className={`${w} h-3`} />
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={`row-${row}`}
            className="grid grid-cols-5 gap-4 py-3 border-b border-gray-800/50"
          >
            <SkeletonText className="w-8" />
            <div className="flex gap-1">
              <SkeletonBlock className="h-8 w-6 rounded" />
              <SkeletonBlock className="h-8 w-6 rounded" />
            </div>
            <SkeletonText className="w-14" />
            <SkeletonText className="w-10" />
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, d) => (
                <SkeletonBlock key={`dot-${d}`} className="h-4 w-4 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsLoadingSkeleton;