import React from 'react';

export interface SkeletonLoaderProps {
  variant: 'text' | 'card' | 'chart' | 'circle' | 'rect';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const VARIANT_DEFAULTS: Record<string, { width: string; height: string }> = {
  text: { width: '100%', height: '16px' },
  card: { width: '100%', height: '120px' },
  chart: { width: '100%', height: '200px' },
  circle: { width: '48px', height: '48px' },
  rect: { width: '100%', height: '40px' },
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  width,
  height,
  count = 1,
  className = '',
}) => {
  const defaults = VARIANT_DEFAULTS[variant];
  const w = width ?? defaults.width;
  const h = height ?? defaults.height;

  const baseClasses = 'animate-pulse bg-gray-800';
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-lg';

  const items = Array.from({ length: count }, (_, i) => {
    if (variant === 'text' && i > 0) {
      // Vary last text line width for natural look
      const lineWidth = i === count - 1 ? '60%' : w;
      return (
        <div
          key={i}
          className={`${baseClasses} ${shapeClass}`}
          style={{ width: lineWidth, height: h }}
        />
      );
    }

    if (variant === 'card') {
      return (
        <div
          key={i}
          className={`${baseClasses} rounded-xl border border-gray-700/50 p-4`}
          style={{ width: w, height: h }}
        >
          <div className="animate-pulse space-y-3">
            <div className="bg-gray-700 rounded h-4 w-2/3" />
            <div className="bg-gray-700 rounded h-3 w-full" />
            <div className="bg-gray-700 rounded h-3 w-4/5" />
          </div>
        </div>
      );
    }

    if (variant === 'chart') {
      return (
        <div
          key={i}
          className={`${baseClasses} rounded-xl border border-gray-700/50 p-4 flex items-end gap-2`}
          style={{ width: w, height: h }}
        >
          {[40, 65, 30, 80, 55, 70, 45].map((barH, bi) => (
            <div
              key={bi}
              className="bg-gray-700 rounded-t flex-1"
              style={{ height: `${barH}%` }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        key={i}
        className={`${baseClasses} ${shapeClass}`}
        style={{ width: w, height: h }}
      />
    );
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {items}
    </div>
  );
};

export default SkeletonLoader;