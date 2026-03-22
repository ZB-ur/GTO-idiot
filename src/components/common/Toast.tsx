import React from 'react';
import { useUIStore, uiStore } from '../../stores';
import type { Toast as ToastType } from '../../stores';

const iconMap: Record<ToastType['type'], string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const bgMap: Record<ToastType['type'], string> = {
  info: 'bg-blue-900/80 border-blue-700',
  success: 'bg-green-900/80 border-green-700',
  warning: 'bg-yellow-900/80 border-yellow-700',
  error: 'bg-red-900/80 border-red-700',
};

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${bgMap[toast.type]} animate-in slide-in-from-right fade-in`}
      role="alert"
    >
      <span className="text-lg flex-shrink-0">{iconMap[toast.type]}</span>
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button
        onClick={() => uiStore.dismissToast(toast.id)}
        className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};
