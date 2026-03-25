import React, { useState, useCallback, createContext, useContext } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type PageName =
  | 'landing'
  | 'poker-table'
  | 'hand-history'
  | 'stats'
  | 'learning-hub'
  | 'postflop-strategy'
  | 'settings';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

interface AppShellContextValue {
  currentPage: PageName;
  setCurrentPage: (page: PageName) => void;
  showToast: (type: ToastMessage['type'], message: string) => void;
  showConfirm: (opts: Omit<ConfirmDialogState, 'open'>) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);
export const useAppShell = () => {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppShell must be used within AppShell');
  return ctx;
};

// ── Props ────────────────────────────────────────────────────────────────────

interface AppShellProps {
  currentPage: string;
  children: React.ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────

export const AppShell: React.FC<AppShellProps> = ({ currentPage: initialPage, children }) => {
  const [currentPage, setCurrentPage] = useState<PageName>(initialPage as PageName);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((opts: Omit<ConfirmDialogState, 'open'>) => {
    setConfirmDialog({ ...opts, open: true });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const toastIconMap: Record<ToastMessage['type'], string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const toastColorMap: Record<ToastMessage['type'], string> = {
    success: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-amber-400/20 border-amber-400 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
  };

  return (
    <AppShellContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        showToast,
        showConfirm,
        isSettingsOpen,
        setSettingsOpen,
        isLoading,
        setLoading,
      }}
    >
      <div className="min-h-screen flex flex-col" style={{ background: '#1a1a2e' }}>
        {/* ── TopNav (slot) ─────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b border-gray-700"
          style={{ background: '#16213e' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 text-xl font-bold tracking-tight">♠ GTO Idiot</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {([
              ['poker-table', '🃏 Play'],
              ['hand-history', '📜 History'],
              ['stats', '📊 Stats'],
              ['learning-hub', '📚 Learn'],
              ['postflop-strategy', '🎯 Postflop'],
            ] as [PageName, string][]).map(([page, label]) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87a6.97 6.97 0 011.08.627c.307.207.678.283 1.05.192l1.248-.332c.53-.14 1.08.12 1.35.6l1.297 2.247a1.125 1.125 0 01-.26 1.431l-1.035.95c-.3.274-.455.66-.44 1.06.01.264.01.528 0 .792a1.504 1.504 0 00.44 1.06l1.035.95c.424.39.534.985.26 1.43l-1.298 2.248a1.125 1.125 0 01-1.35.6l-1.248-.332c-.372-.09-.743-.015-1.05.192a6.97 6.97 0 01-1.08.627c-.332.184-.582.496-.645.87l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.504 1.504 0 00-.645-.87 6.97 6.97 0 01-1.08-.627c-.307-.207-.678-.283-1.05-.192l-1.248.332a1.125 1.125 0 01-1.35-.6l-1.297-2.248a1.125 1.125 0 01.26-1.43l1.035-.95c.3-.274.455-.66.44-1.06a6.6 6.6 0 010-.792 1.504 1.504 0 00-.44-1.06l-1.035-.95a1.125 1.125 0 01-.26-1.431l1.297-2.247a1.125 1.125 0 011.35-.6l1.248.332c.372.09.743.015 1.05-.192a6.97 6.97 0 011.08-.627c.332-.184.582-.496.645-.87l.213-1.281z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* ── Main Content ──────────────────────────────────────── */}
        <main className="flex-1 relative">{children}</main>

        {/* ── Toast Stack ───────────────────────────────────────── */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slide-in ${toastColorMap[toast.type]}`}
            >
              <span className="text-lg font-bold">{toastIconMap[toast.type]}</span>
              <span className="text-sm font-medium text-gray-100">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Confirm Dialog ────────────────────────────────────── */}
        {confirmDialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="w-full max-w-md mx-4 rounded-xl border border-gray-700 shadow-xl p-6"
              style={{ background: '#1e293b' }}
            >
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-gray-400 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    confirmDialog.onCancel();
                    closeConfirm();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    closeConfirm();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    confirmDialog.danger
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  {confirmDialog.confirmLabel || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Overlay ──────────────────────────────────── */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <div
              className="w-full max-w-sm h-full border-l border-gray-700 overflow-y-auto p-6"
              style={{ background: '#16213e' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
                >
                  ✕
                </button>
              </div>
              {/* SettingsOverlay child renders here */}
              <div className="text-sm text-gray-500">Settings panel content</div>
            </div>
          </div>
        )}

        {/* ── Loading Overlay ───────────────────────────────────── */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400 font-medium">Loading…</span>
            </div>
          </div>
        )}
      </div>
    </AppShellContext.Provider>
  );
};

export default AppShell;