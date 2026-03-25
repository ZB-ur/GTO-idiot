import React, { useEffect, useCallback } from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  visible: boolean;
  onDismiss?: () => void;
}

const toastConfig: Record<
  NonNullable<ToastProps['type']>,
  { icon: string; bgClass: string; textClass: string; borderClass: string }
> = {
  info: {
    icon: 'ℹ',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  success: {
    icon: '✓',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
  },
  warning: {
    icon: '⚠',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
  },
  error: {
    icon: '✕',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info', visible, onDismiss }) => {
  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(handleDismiss, 3000);
    return () => clearTimeout(timer);
  }, [visible, handleDismiss]);

  if (!visible) return null;

  const config = toastConfig[type];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-md transition-all duration-300 ${config.bgClass} ${config.borderClass} ${config.textClass}`}
      role="alert"
    >
      <span className="text-base leading-none">{config.icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleDismiss}
        className={`ml-2 text-sm opacity-60 hover:opacity-100 transition-opacity ${config.textClass}`}
        aria-label="关闭通知"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;