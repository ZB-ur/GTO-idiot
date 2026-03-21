import React, { useEffect, useState, useCallback } from 'react';

export type ToastType = 'success' | 'warning' | 'error';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

const typeConfig: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✓',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚠',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '✕',
  },
};

const typeTextColor: Record<ToastType, string> = {
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
};

const typeIconColor: Record<ToastType, string> = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!visible) return null;

  const config = typeConfig[type];

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3
        px-4 py-3 rounded-xl border shadow-md
        ${config.bg} ${config.border}
        transition-all duration-200
        ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <span className={`text-base font-bold ${typeIconColor[type]}`}>
        {config.icon}
      </span>
      <span className={`text-sm font-medium ${typeTextColor[type]}`}>
        {message}
      </span>
      <button
        onClick={handleClose}
        className={`ml-2 text-sm ${typeTextColor[type]} opacity-60 hover:opacity-100 transition-opacity`}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;