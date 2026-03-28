import React from 'react';

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = '1rem',
  rounded = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-gray-800 animate-pulse ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width, height }}
    />
  );
};