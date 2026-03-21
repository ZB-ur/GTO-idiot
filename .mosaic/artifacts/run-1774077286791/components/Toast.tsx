import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const typeStyles: Record<ToastProps['type'], { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✓',
    text: 'text-green-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚠',
    text: 'text-amber-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '✕',
    text: 'text-red-800',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const styles = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md transition-all duration-300 ${styles.bg} ${styles.border}`}
      role="alert"
    >
      <span className={`text-lg font-bold ${styles.text}`}>{styles.icon}</span>
      <span className={`text-sm font-medium ${styles.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-2 text-sm ${styles.text} opacity-60 hover:opacity-100 transition-opacity`}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;