import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ── Toast System ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// ── Loading Context ───────────────────────────────────────────────────────────

interface LoadingContextValue {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  loadingMessage: '',
  setLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

// ── Toast Component ───────────────────────────────────────────────────────────

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: 'bg-emerald-50', icon: '✓', border: 'border-emerald-500' },
  warning: { bg: 'bg-amber-50', icon: '⚠', border: 'border-amber-500' },
  error: { bg: 'bg-red-50', icon: '✕', border: 'border-red-500' },
  info: { bg: 'bg-blue-50', icon: 'ℹ', border: 'border-blue-500' },
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const style = toastStyles[toast.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 ${style.bg} ${style.border} shadow-md animate-slide-in`}
      role="alert"
    >
      <span className="text-lg leading-none mt-0.5">{style.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-lg font-semibold text-gray-900">{message || 'Loading…'}</p>
        <div className="flex gap-1.5">
          {['♠', '♥', '♦', '♣'].map((suit, i) => (
            <span
              key={suit}
              className="text-xl opacity-40 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {suit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Top Nav ───────────────────────────────────────────────────────────────────

type NavRoute = 'game' | 'history' | 'report' | 'settings';

const navItems: { route: NavRoute; label: string; icon: string }[] = [
  { route: 'game', label: 'Play', icon: '🃏' },
  { route: 'history', label: 'History', icon: '📋' },
  { route: 'report', label: 'Report', icon: '📊' },
  { route: 'settings', label: 'Settings', icon: '⚙️' },
];

function TopNav({ activeRoute, onNavigate }: { activeRoute: NavRoute; onNavigate: (route: NavRoute) => void }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">♠</span>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              GTO Idiot
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeRoute === item.route
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Page Container ────────────────────────────────────────────────────────────

function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {children}
    </main>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
  activeRoute?: NavRoute;
  onNavigate?: (route: NavRoute) => void;
}

export default function AppShell({
  children,
  activeRoute = 'game',
  onNavigate,
}: AppShellProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setLoading = useCallback((loading: boolean, message = '') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  }, []);

  const handleNavigate = useCallback(
    (route: NavRoute) => {
      onNavigate?.(route);
    },
    [onNavigate],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <LoadingContext.Provider value={{ isLoading, loadingMessage, setLoading }}>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <TopNav activeRoute={activeRoute} onNavigate={handleNavigate} />
          <PageContainer>{children}</PageContainer>
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
          {isLoading && <LoadingScreen message={loadingMessage} />}
        </div>
      </LoadingContext.Provider>
    </ToastContext.Provider>
  );
}