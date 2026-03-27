import { type ReactNode, useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ICON_MAP: Record<ToastProps['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLOR_MAP: Record<ToastProps['type'], string> = {
  success: 'border-green-500 bg-green-950/80 text-green-200',
  error: 'border-red-500 bg-red-950/80 text-red-200',
  info: 'border-blue-500 bg-blue-950/80 text-blue-200',
};

const AUTO_DISMISS_MS = 4000;

export function ToastNotification({ message, type, onClose }: ToastProps): ReactNode {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-lg border-l-4 px-4 py-3 shadow-lg transition-all duration-200 ${
        COLOR_MAP[type]
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
      role="alert"
    >
      <span className="text-base font-bold">{ICON_MAP[type]}</span>
      <span className="text-sm">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 200);
        }}
        className="ml-3 text-sm opacity-60 hover:opacity-100"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  );
}
