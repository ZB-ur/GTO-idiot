import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse ${className}`}
    >
      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-4" />
      {/* Subtitle skeleton */}
      <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-6" />
      {/* Content lines */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-5/6" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
      </div>
      {/* Bottom bar */}
      <div className="mt-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  );
};

export default SkeletonCard;