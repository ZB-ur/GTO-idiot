import React from 'react';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: SkeletonVariant;
  count?: number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'rounded-lg',
  rect: 'rounded-xl',
  circle: 'rounded-full',
};

const variantDefaults: Record<SkeletonVariant, { width: string; height: string }> = {
  text: { width: '100%', height: '16px' },
  rect: { width: '100%', height: '80px' },
  circle: { width: '40px', height: '40px' },
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  count = 1,
}) => {
  const resolvedWidth = width ?? variantDefaults[variant].width;
  const resolvedHeight = height ?? variantDefaults[variant].height;

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]}`}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
      }}
      aria-hidden="true"
    />
  ));

  if (count === 1) return items[0]!;

  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {items}
    </div>
  );
};

export default Skeleton;