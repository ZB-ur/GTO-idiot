import React, { useEffect } from 'react';

interface ToastProps {
  type: 'info' | 'warning' | 'error';
  message: string;
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ',
    iconColor: 'text-blue-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚠',
    iconColor: 'text-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '✕',
    iconColor: 'text-red-500',
  },
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = typeStyles[type];

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3
        px-4 py-3 rounded-lg border shadow-md
        ${style.bg} ${style.border}
        animate-slide-down
        max-w-md w-full
      `}
      role="alert"
    >
      <span className={`${style.iconColor} text-lg flex-shrink-0`}>{style.icon}</span>
      <p className="text-sm text-gray-900 flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0 ml-2"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;