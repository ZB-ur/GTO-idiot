import React from 'react';

interface StorageWarningBannerProps {
  usagePercent: number;
  onExport: () => void;
  onDismiss: () => void;
}

export const StorageWarningBanner: React.FC<StorageWarningBannerProps> = ({
  usagePercent,
  onExport,
  onDismiss,
}) => {
  const percentage = Math.round(usagePercent * 100);
  const isCritical = usagePercent >= 0.95;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        isCritical
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
      }`}
    >
      <span className="text-lg flex-shrink-0">{isCritical ? '🚨' : '⚠️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {isCritical
            ? '存储空间即将耗尽'
            : '存储空间使用率较高'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          已使用 {percentage}% — 建议导出数据以释放空间
        </p>
      </div>
      {/* Progress bar */}
      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical ? 'bg-red-500' : 'bg-yellow-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <button
        onClick={onExport}
        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
      >
        导出数据
      </button>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="关闭"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default StorageWarningBanner;