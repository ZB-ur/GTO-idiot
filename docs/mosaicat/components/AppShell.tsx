import React, { useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// --- Toast System ---
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (variant: ToastVariant, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// --- Confirm Dialog System ---
interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export const useConfirm = () => useContext(ConfirmContext);

// --- Nav Items ---
const NAV_ITEMS = [
  { label: 'Play', path: '/', icon: '♠' },
  { label: 'History', path: '/history', icon: '📋' },
  { label: 'Review', path: '/review', icon: '🔍' },
  { label: 'Stats', path: '/stats', icon: '📊' },
] as const;

// --- Toast Component ---
const TOAST_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const TOAST_COLOR: Record<ToastVariant, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  error: 'bg-red-500/20 border-red-500/40 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  info: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    const timeout = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timeout);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${TOAST_COLOR[toast.variant]} animate-slide-in`}
    >
      <span className="text-lg font-bold">{TOAST_ICON[toast.variant]}</span>
      <span className="text-sm font-medium text-gray-50">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto text-gray-400 hover:text-gray-50 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// --- Confirm Dialog Component ---
function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions;
  onResolve: (result: boolean) => void;
}) {
  const isDanger = options.variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onResolve(false)} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-md p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-50 mb-2">{options.title}</h3>
        <p className="text-sm text-gray-400 mb-6">{options.message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => onResolve(false)}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-50 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {options.cancelLabel ?? 'Cancel'}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              isDanger
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-950'
            }`}
          >
            {options.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Top Nav ---
function TopNav({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  return (
    <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-700">
      <div className="max-w-5xl mx-auto flex items-center h-14 px-4">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          className="flex items-center gap-2 mr-8"
        >
          <span className="text-amber-400 text-xl font-bold tracking-tight">GTO</span>
          <span className="text-gray-50 text-xl font-bold tracking-tight">Idiot</span>
        </a>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); onNavigate(item.path); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// --- Error Boundary ---
interface ErrorScreenProps {
  error: Error | null;
  onRetry?: () => void;
}

function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  if (!error) return null;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-4xl mb-4">💥</div>
      <h2 className="text-xl font-bold text-gray-50 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-400 mb-6 max-w-md">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// --- App Shell ---
interface AppShellProps {
  children: ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

let toastCounter = 0;

export function AppShell({ children, currentPath = '/', onNavigate }: AppShellProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleNavigate = useCallback(
    (path: string) => {
      setError(null);
      onNavigate?.(path);
    },
    [onNavigate],
  );

  const addToast = useCallback((variant: ToastVariant, message: string, duration?: number) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, variant, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        options,
        resolve: (result) => {
          setConfirmState(null);
          resolve(result);
        },
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ConfirmContext.Provider value={{ confirm }}>
        <div className="min-h-screen bg-gray-950 text-gray-50">
          <TopNav currentPath={currentPath} onNavigate={handleNavigate} />
          <main className="max-w-5xl mx-auto px-4 py-6">
            {error ? (
              <ErrorScreen error={error} onRetry={() => setError(null)} />
            ) : (
              children
            )}
          </main>
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
          {confirmState && (
            <ConfirmDialog options={confirmState.options} onResolve={confirmState.resolve} />
          )}
        </div>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

export default AppShell;