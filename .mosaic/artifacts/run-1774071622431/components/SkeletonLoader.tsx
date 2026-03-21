import React from 'react';

interface SkeletonLoaderProps {
  variant: 'table' | 'list' | 'chart' | 'card';
  count?: number;
}

const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const TableSkeleton: React.FC = () => (
  <div className="w-full space-y-3">
    {/* Header */}
    <div className="flex gap-4 px-4 py-3">
      <SkeletonPulse className="h-4 w-24" />
      <SkeletonPulse className="h-4 w-32" />
      <SkeletonPulse className="h-4 w-20" />
      <SkeletonPulse className="h-4 w-28" />
    </div>
    {/* Rows */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-100">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-4 w-28" />
      </div>
    ))}
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-3/4" />
          <SkeletonPulse className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="space-y-3">
    <SkeletonPulse className="h-4 w-32" />
    <div className="flex items-end gap-2 h-40">
      {[40, 65, 30, 80, 55, 70, 45, 60, 35, 75].map((h, i) => (
        <SkeletonPulse key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="flex justify-between">
      <SkeletonPulse className="h-3 w-8" />
      <SkeletonPulse className="h-3 w-8" />
      <SkeletonPulse className="h-3 w-8" />
    </div>
  </div>
);

const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonPulse className="h-12 w-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-5 w-2/3" />
        <SkeletonPulse className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonPulse className="h-4 w-full" />
    <SkeletonPulse className="h-4 w-4/5" />
    <SkeletonPulse className="h-8 w-24 rounded-lg" />
  </div>
);

const variantMap: Record<SkeletonLoaderProps['variant'], React.FC> = {
  table: TableSkeleton,
  list: ListSkeleton,
  chart: ChartSkeleton,
  card: CardSkeleton,
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1 }) => {
  const Component = variantMap[variant];

  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;