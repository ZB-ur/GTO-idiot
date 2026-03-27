import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl bg-gray-900 border border-gray-800 p-5 animate-pulse ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded-lg bg-gray-800" />
          <div className="h-3 w-2/5 rounded-lg bg-gray-800" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded-lg bg-gray-800" />
        <div className="h-3 w-4/5 rounded-lg bg-gray-800" />
      </div>
    </div>
  );
};

export default SkeletonCard;