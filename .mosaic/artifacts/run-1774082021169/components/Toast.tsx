import React, { useEffect, useCallback } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<ToastProps['type'], { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-300', icon: '✓', text: 'text-green-800' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-300', icon: '⚠', text: 'text-amber-800' },
  error:   { bg: 'bg-rose-50', border: 'border-rose-300', icon: '✕', text: 'text-rose-800' },
  info:    { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'ℹ', text: 'text-blue-800' },
};

const iconBgStyles: Record<ToastProps['type'], string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error:   'bg-rose-500',
  info:    'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const style = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md ${style.bg} ${style.border} animate-slide-in max-w-sm`}
      role="alert"
    >
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full ${iconBgStyles[type]} text-white flex items-center justify-center text-xs font-bold`}
      >
        {style.icon}
      </span>
      <p className={`text-sm font-medium ${style.text} flex-1`}>{message}</p>
      <button
        onClick={handleClose}
        className={`flex-shrink-0 ${style.text} opacity-60 hover:opacity-100 transition-opacity text-lg leading-none`}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;