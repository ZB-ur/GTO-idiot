import React from 'react';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Title skeleton */}
      <div className="h-5 w-2/5 bg-gray-200 rounded-lg animate-pulse mb-4" />
      {/* Line skeletons */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 bg-gray-200 rounded-lg animate-pulse mb-3 last:mb-0 ${
            i === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export default SkeletonCard;