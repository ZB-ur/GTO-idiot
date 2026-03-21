import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'chart' | 'table';
  rows?: number;
}

const Pulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-700 rounded animate-pulse ${className}`} />
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'list',
  rows = 3,
}) => {
  if (variant === 'card') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
        <Pulse className="h-4 w-1/3" />
        <Pulse className="h-8 w-2/3" />
        <Pulse className="h-3 w-1/2" />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
        <Pulse className="h-4 w-1/4" />
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 8 }).map((_, i) => (
            <Pulse
              key={i}
              className="flex-1"
              style={{ height: `${20 + Math.random() * 80}%` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex gap-4 px-6 py-3 border-b border-gray-700">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-16" />
          <Pulse className="h-3 w-24" />
          <Pulse className="h-3 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-800 last:border-0">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-3 w-16" />
            <Pulse className="h-3 w-24" />
            <Pulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // list (default)
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4"
        >
          <Pulse className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;