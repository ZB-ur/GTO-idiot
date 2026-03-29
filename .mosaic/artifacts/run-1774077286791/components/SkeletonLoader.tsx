import React from 'react';

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'table';
  count?: number;
}

const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const CardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonPulse className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonPulse className="h-3 w-full" />
    <SkeletonPulse className="h-3 w-4/5" />
    <SkeletonPulse className="h-3 w-2/3" />
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100">
    <SkeletonPulse className="w-8 h-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-4 w-2/5" />
      <SkeletonPulse className="h-3 w-3/5" />
    </div>
    <SkeletonPulse className="h-4 w-16" />
  </div>
);

const TableSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-3 px-4 border-b border-gray-100">
    <SkeletonPulse className="h-4 w-12" />
    <SkeletonPulse className="h-4 w-24" />
    <SkeletonPulse className="h-4 w-20" />
    <SkeletonPulse className="h-4 w-16" />
    <SkeletonPulse className="h-4 w-20 ml-auto" />
  </div>
);

const variantMap = {
  card: CardSkeleton,
  list: ListSkeleton,
  table: TableSkeleton,
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 3 }) => {
  const Component = variantMap[variant];
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Component key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {variant === 'table' && (
        <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 border-b border-gray-200">
          <div className="h-3 w-12 bg-gray-300 rounded" />
          <div className="h-3 w-24 bg-gray-300 rounded" />
          <div className="h-3 w-20 bg-gray-300 rounded" />
          <div className="h-3 w-16 bg-gray-300 rounded" />
          <div className="h-3 w-20 bg-gray-300 rounded ml-auto" />
        </div>
      )}
      {items.map((i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;