import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500',
    text: 'text-green-100',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500',
    text: 'text-red-100',
    icon: 'text-red-400',
  },
  info: {
    bg: 'bg-slate-800/90',
    border: 'border-slate-500',
    text: 'text-slate-100',
    icon: 'text-slate-300',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(showTimer);
  }, []);

  useEffect(() => {
    if (!onClose) return;
    const autoClose = setTimeout(() => handleClose(), 4000);
    return () => clearTimeout(autoClose);
  }, [onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const colors = colorMap[type];

  return (
    <div
      role="alert"
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
        rounded-lg border shadow-lg backdrop-blur-sm
        transition-all duration-200 ease-out
        ${colors.bg} ${colors.border} ${colors.text}
        ${visible && !exiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <span className={`text-lg font-bold ${colors.icon}`}>{iconMap[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={handleClose}
          className="ml-2 p-1 rounded hover:bg-white/10 transition-colors text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;
