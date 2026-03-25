import React from 'react';

interface SkeletonGridProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  rows = 4,
  cols = 6,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-gray-200 rounded-lg animate-pulse"
            style={{ animationDelay: `${(i % cols) * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;