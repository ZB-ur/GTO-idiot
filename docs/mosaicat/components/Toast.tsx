import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', icon: '✓' },
  error: { bg: 'bg-red-500/15', border: 'border-red-500/40', icon: '✕' },
  info: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', icon: 'ℹ' },
};

const iconColors: Record<string, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-amber-500',
};

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = typeStyles[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} shadow-lg backdrop-blur-sm`}
      role="alert"
    >
      <span className={`text-lg font-bold ${iconColors[type]}`}>{style.icon}</span>
      <span className="text-gray-50 text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-300 text-sm"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};