import React from 'react';

interface SkeletonLoaderProps {
  /** Number of skeleton rows to render. Defaults to 3. */
  rows?: number;
  /** Whether to show a card-like container. Defaults to true. */
  card?: boolean;
  /** Optional className for the container. */
  className?: string;
}

const SkeletonBar: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
  <div className={`${width} h-4 bg-gray-700 rounded animate-pulse`} />
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 3,
  card = true,
  className = '',
}) => {
  const content = (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBar width={i === 0 ? 'w-3/4' : i === rows - 1 ? 'w-1/2' : 'w-full'} />
        </div>
      ))}
    </div>
  );

  if (card) {
    return <div className="card">{content}</div>;
  }

  return content;
};

/** Full-page loading state with centered spinner and skeleton. */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="w-8 h-8 border-2 border-felt-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);
