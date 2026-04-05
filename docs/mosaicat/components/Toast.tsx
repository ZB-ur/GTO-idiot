import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  visible: boolean;
  onClose: () => void;
}

const TOAST_CONFIG = {
  success: {
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
    icon: '✓',
  },
  warning: {
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    icon: '⚠',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: '✕',
  },
} as const;

const AUTO_DISMISS_MS = 4000;

export const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} shadow-md backdrop-blur-sm transition-all duration-300`}
      role="alert"
    >
      <span className={`${config.text} text-base font-bold`}>{config.icon}</span>
      <span className={`${config.text} text-sm font-medium`}>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};