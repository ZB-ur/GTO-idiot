import React from 'react';

interface SkeletonProps {
  variant?: 'rect' | 'circle' | 'text';
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses: Record<string, string> = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  const defaultStyles: Record<string, React.CSSProperties> = {
    rect: { width: width || '100%', height: height || '48px' },
    circle: { width: width || '40px', height: height || '40px' },
    text: { width: width || '100%', height: height || '16px' },
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={defaultStyles[variant]}
    />
  );
};

export default Skeleton;