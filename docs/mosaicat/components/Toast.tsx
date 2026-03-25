import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  visible: boolean;
  onDismiss: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-[#1e293b]', border: 'border-gray-600', icon: 'ℹ' },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: '✓' },
  warning: { bg: 'bg-amber-400/10', border: 'border-amber-400/40', icon: '⚠' },
  error: { bg: 'bg-red-500/10', border: 'border-red-500/40', icon: '✕' },
};

const typeTextColors: Record<string, string> = {
  info: 'text-gray-100',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onDismiss,
}) => {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const style = typeStyles[type] ?? typeStyles.info;
  const textColor = typeTextColors[type] ?? typeTextColors.info;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg
        ${style.bg} ${style.border}
        animate-[slideUp_0.2s_ease-out]
      `}
      role="alert"
    >
      <span className={`text-sm ${textColor}`}>{style.icon}</span>
      <span className="text-sm text-gray-100">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-gray-500 hover:text-gray-300 text-sm"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;