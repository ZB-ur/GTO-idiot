import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    text: 'text-emerald-400',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    icon: '✕',
  },
  info: {
    bg: 'bg-sky-400/10 border-sky-400/30',
    text: 'text-sky-400',
    icon: 'ℹ',
  },
} as const;

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss, duration = 4000 }) => {
  const config = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border ${config.bg} shadow-lg shadow-black/40 backdrop-blur-sm max-w-md`}
      role="alert"
    >
      <span className={`text-base font-bold ${config.text}`}>{config.icon}</span>
      <span className="text-sm text-gray-50 flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-gray-500 hover:text-gray-300 transition-colors text-sm ml-2"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;