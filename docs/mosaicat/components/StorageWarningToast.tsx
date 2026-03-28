import React from 'react';

interface StorageWarningToastProps {
  usedBytes: number;
  totalBytes: number;
  onManage: () => void;
  onDismiss: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const StorageWarningToast: React.FC<StorageWarningToastProps> = ({
  usedBytes,
  totalBytes,
  onManage,
  onDismiss,
}) => {
  const usagePercent = Math.min(Math.round((usedBytes / totalBytes) * 100), 100);
  const isHigh = usagePercent >= 90;

  return (
    <div className="w-full max-w-sm rounded-xl border border-amber-200 bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <svg
            className="h-5 w-5 text-amber-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">存储空间不足</p>
          <p className="mt-0.5 text-xs text-gray-600">
            已使用 {formatBytes(usedBytes)} / {formatBytes(totalBytes)} ({usagePercent}%)
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="关闭"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isHigh ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2.5">
        <button
          onClick={onDismiss}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
        >
          稍后提醒
        </button>
        <button
          onClick={onManage}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
        >
          管理存储
        </button>
      </div>
    </div>
  );
};

export default StorageWarningToast;