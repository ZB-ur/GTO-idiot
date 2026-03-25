import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss: () => void;
}

const typeStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: '✓',
    iconBg: 'bg-emerald-500',
    text: 'text-emerald-900',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: '✕',
    iconBg: 'bg-red-500',
    text: 'text-red-900',
  },
  info: {
    bg: 'bg-sky-50 border-sky-200',
    icon: 'i',
    iconBg: 'bg-sky-500',
    text: 'text-sky-900',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 4000,
  onDismiss,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const s = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md ${s.bg}`}
      role="alert"
    >
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${s.iconBg}`}
      >
        {s.icon}
      </span>
      <span className={`text-sm font-medium ${s.text}`}>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;