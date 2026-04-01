import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: () => void;
}

const toastConfig: Record<
  ToastProps['type'],
  { icon: string; bg: string; border: string; text: string; iconColor: string }
> = {
  error: {
    icon: '✕',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'bg-red-500 text-white',
  },
  warning: {
    icon: '!',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'bg-amber-500 text-white',
  },
  info: {
    icon: 'i',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'bg-blue-500 text-white',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 4000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md ${config.bg} ${config.border} min-w-[300px] max-w-md`}
      >
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${config.iconColor}`}
        >
          {config.icon}
        </span>
        <span className={`text-sm font-medium flex-1 ${config.text}`}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className={`flex-shrink-0 ${config.text} opacity-50 hover:opacity-100 transition-opacity text-lg leading-none`}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;