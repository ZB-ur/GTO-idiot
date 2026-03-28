import React, { useEffect, useCallback } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  action?: ToastAction;
  duration?: number;
  onDismiss: () => void;
}

const variantStyles: Record<string, { bg: string; icon: string; border: string }> = {
  success: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-200' },
  warning: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-200' },
  error: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-200' },
  info: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200' },
};

const icons: Record<string, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant,
  action,
  duration = 4000,
  onDismiss,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md ${styles.bg} ${styles.border}`}
      role="alert"
    >
      <span className={`flex-shrink-0 ${styles.icon}`}>{icons[variant]}</span>
      <p className="flex-1 text-sm font-medium text-gray-900">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;