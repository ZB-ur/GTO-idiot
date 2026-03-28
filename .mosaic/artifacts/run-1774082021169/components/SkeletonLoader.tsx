import React from 'react';

interface SkeletonLoaderProps {
  variant: 'table' | 'row' | 'panel' | 'card';
  count?: number;
  className?: string;
}

const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-3 py-3">
    <SkeletonPulse className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-3 w-3/4" />
      <SkeletonPulse className="h-3 w-1/2" />
    </div>
    <SkeletonPulse className="h-4 w-16 flex-shrink-0" />
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonPulse className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-3 w-1/4" />
      </div>
    </div>
    <SkeletonPulse className="h-3 w-full" />
    <SkeletonPulse className="h-3 w-5/6" />
    <SkeletonPulse className="h-3 w-2/3" />
  </div>
);

const SkeletonPanel: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
    <SkeletonPulse className="h-5 w-1/4 mb-2" />
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-8 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-8 w-full rounded-lg" />
      </div>
    </div>
    <SkeletonPulse className="h-10 w-full rounded-lg" />
  </div>
);

const SkeletonTable: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
      <SkeletonPulse className="h-3 w-20" />
      <SkeletonPulse className="h-3 w-32 flex-1" />
      <SkeletonPulse className="h-3 w-16" />
      <SkeletonPulse className="h-3 w-16" />
    </div>
    {/* Rows */}
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-3 w-32 flex-1" />
        <SkeletonPulse className="h-3 w-16" />
        <SkeletonPulse className="h-3 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading">
      {items.map((_, i) => {
        switch (variant) {
          case 'table':
            return <SkeletonTable key={i} />;
          case 'row':
            return <SkeletonRow key={i} />;
          case 'panel':
            return <SkeletonPanel key={i} />;
          case 'card':
            return <SkeletonCard key={i} />;
        }
      })}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;