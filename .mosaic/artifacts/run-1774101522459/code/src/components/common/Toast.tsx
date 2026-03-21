// ============================================================
// Toast notification component — auto-dismiss with severity levels
// ============================================================

import React, { useCallback, useEffect, useState } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  severity: ToastSeverity;
  message: string;
  durationMs?: number;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const SEVERITY_STYLES: Record<ToastSeverity, string> = {
  success: 'bg-green-800 border-green-600 text-green-100',
  error: 'bg-red-800 border-red-600 text-red-100',
  warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
  info: 'bg-blue-800 border-blue-600 text-blue-100',
};

const SEVERITY_ICONS: Record<ToastSeverity, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timeout = setTimeout(
      () => onDismiss(toast.id),
      toast.durationMs ?? 4000,
    );
    return () => clearTimeout(timeout);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        animate-slide-in ${SEVERITY_STYLES[toast.severity]}`}
    >
      <span className="text-lg font-bold">{SEVERITY_ICONS[toast.severity]}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 transition-opacity text-sm"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

// ============================================================
// Toast context for global usage
// ============================================================

interface ToastContextValue {
  addToast: (severity: ToastSeverity, message: string, durationMs?: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (severity: ToastSeverity, message: string, durationMs?: number) => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, severity, message, durationMs }]);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
