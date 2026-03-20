import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{
          width: width || '40px',
          height: height || width || '40px',
        }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`${baseClasses} rounded-lg ${className}`}
        style={{
          width: width || '100%',
          height: height || '120px',
        }}
      />
    );
  }

  // variant === 'text'
  return (
    <div className={`space-y-2 ${className}`} style={{ width: width || '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} rounded-lg`}
          style={{
            height: height || '16px',
            width: i === lines - 1 && lines > 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

export default Skeleton;