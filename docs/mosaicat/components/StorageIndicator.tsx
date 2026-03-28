import React from 'react';

interface StorageIndicatorProps {
  usedBytes: number;
  totalBytes: number;
  currentHandCount: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const StorageIndicator: React.FC<StorageIndicatorProps> = ({
  usedBytes,
  totalBytes,
  currentHandCount,
}) => {
  const usagePercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  const isNearFull = usagePercent >= 80;
  const isCritical = usagePercent >= 95;

  const barColor = isCritical
    ? 'bg-red-500'
    : isNearFull
      ? 'bg-amber-500'
      : 'bg-blue-600';

  const textColor = isCritical
    ? 'text-red-600'
    : isNearFull
      ? 'text-amber-600'
      : 'text-gray-600';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600">
          存储空间
        </span>
        <span className={`text-xs font-medium ${textColor}`}>
          {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">
          {currentHandCount} 手记录
        </span>
        {isNearFull && (
          <span className={`text-xs font-medium ${textColor}`}>
            {isCritical ? '存储空间即将满' : '存储空间不足'}
          </span>
        )}
      </div>
    </div>
  );
};

export default StorageIndicator;