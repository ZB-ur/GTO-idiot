import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, className }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-700/60 ${className ?? ''}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
