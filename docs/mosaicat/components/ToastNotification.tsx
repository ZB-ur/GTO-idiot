import React, { useEffect } from 'react';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  onDismiss: () => void;
  duration?: number;
}

const TOAST_STYLES = {
  success: {
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    icon: '✓',
    iconColor: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-400/10 border-amber-400/30',
    icon: '⚠',
    iconColor: 'text-amber-400',
  },
  error: {
    bg: 'bg-red-400/10 border-red-400/30',
    icon: '✕',
    iconColor: 'text-red-400',
  },
} as const;

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onDismiss,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const style = TOAST_STYLES[type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} text-gray-50 text-sm shadow-md`}
      role="alert"
    >
      <span className={`text-base font-bold ${style.iconColor}`}>{style.icon}</span>
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-gray-500 hover:text-gray-300 transition-colors ml-2"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};