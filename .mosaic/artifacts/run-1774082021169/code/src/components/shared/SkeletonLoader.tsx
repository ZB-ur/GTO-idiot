

interface SkeletonLoaderProps {
  readonly width?: string;
  readonly height?: string;
  readonly rounded?: boolean;
  readonly className?: string;
  readonly count?: number;
}

export function SkeletonLoader({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  className = '',
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-700 ${width} ${height} ${
            rounded ? 'rounded-full' : 'rounded'
          } ${className}`}
        />
      ))}
    </>
  );
}
