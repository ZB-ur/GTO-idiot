import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const typeConfig: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: {
    bg: 'bg-gray-900',
    border: 'border-emerald-500/30',
    icon: '✓',
    iconColor: 'text-emerald-500 bg-emerald-500/10',
  },
  error: {
    bg: 'bg-gray-900',
    border: 'border-red-500/30',
    icon: '✕',
    iconColor: 'text-red-500 bg-red-500/10',
  },
  warning: {
    bg: 'bg-gray-900',
    border: 'border-yellow-500/30',
    icon: '!',
    iconColor: 'text-yellow-500 bg-yellow-500/10',
  },
  info: {
    bg: 'bg-gray-900',
    border: 'border-gray-500/30',
    icon: 'i',
    iconColor: 'text-gray-400 bg-gray-500/10',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const config = typeConfig[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3
        ${config.bg} border ${config.border} rounded-xl shadow-lg
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center
          font-bold text-sm ${config.iconColor}`}
      >
        {config.icon}
      </div>
      <span className="text-gray-50 text-sm font-medium max-w-xs">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="text-gray-500 hover:text-gray-300 ml-2 text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;