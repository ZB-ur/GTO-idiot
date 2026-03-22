import React from 'react';

export interface SkeletonLoaderProps {
  variant: 'table' | 'chart' | 'list' | 'card';
  count?: number;
  className?: string;
}

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const TableSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {/* Header */}
    <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-4 w-20" />
      <Shimmer className="h-4 w-16" />
    </div>
    {/* Rows */}
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-16" />
      </div>
    ))}
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-xl p-6">
    <Shimmer className="h-5 w-32 mb-4" />
    <div className="flex items-end gap-2 h-40">
      {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="flex justify-between mt-2">
      <Shimmer className="h-3 w-8" />
      <Shimmer className="h-3 w-8" />
      <Shimmer className="h-3 w-8" />
    </div>
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const CardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-4 w-1/2" />
        <Shimmer className="h-3 w-1/3" />
      </div>
    </div>
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-5/6" />
    <Shimmer className="h-4 w-2/3" />
  </div>
);

const variantMap: Record<string, React.FC> = {
  table: TableSkeleton,
  chart: ChartSkeleton,
  list: ListSkeleton,
  card: CardSkeleton,
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 1,
  className = '',
}) => {
  const Component = variantMap[variant];

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;