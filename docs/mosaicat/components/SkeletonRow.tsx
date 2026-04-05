import React from 'react';

interface SkeletonRowProps {
  columns?: number;
  className?: string;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-4 py-3 px-4 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gray-800 animate-pulse"
          style={{ flex: i === 0 ? 2 : 1 }}
        />
      ))}
    </div>
  );
};

export default SkeletonRow;