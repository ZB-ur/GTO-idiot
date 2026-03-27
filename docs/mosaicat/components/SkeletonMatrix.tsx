import React from 'react';

interface SkeletonMatrixProps {
  className?: string;
}

const GRID_SIZE = 13;

export const SkeletonMatrix: React.FC<SkeletonMatrixProps> = ({ className = '' }) => {
  return (
    <div className={`inline-grid gap-0.5 ${className}`} style={{
      gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
    }}>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-sm bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  );
};

export default SkeletonMatrix;