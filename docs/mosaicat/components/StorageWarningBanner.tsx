import React from 'react';

interface StorageWarningBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

const StorageWarningBanner: React.FC<StorageWarningBannerProps> = ({ visible, onDismiss }) => {
  if (!visible) return null;

  return (
    <div
      className="w-full bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center gap-3"
      role="alert"
    >
      <span className="text-yellow-600 text-base leading-none shrink-0">⚠</span>
      <p className="text-sm text-yellow-700 flex-1">
        浏览器存储不可用，游戏进度和历史记录将无法保存。请检查浏览器隐私设置或尝试关闭无痕模式。
      </p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-sm text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
        aria-label="关闭警告"
      >
        知道了
      </button>
    </div>
  );
};

export default StorageWarningBanner;