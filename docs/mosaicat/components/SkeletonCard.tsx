import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-14 h-20 rounded-lg bg-gray-800 border border-gray-700 animate-pulse ${className}`}
    />
  );
};

export default SkeletonCard;