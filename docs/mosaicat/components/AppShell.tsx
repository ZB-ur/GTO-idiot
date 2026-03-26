import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';

// --- Toast System ---
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// --- Confirm Dialog System ---
export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

export interface DialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextType>({
  confirm: () => Promise.resolve(false),
});

export const useConfirmDialog = () => useContext(DialogContext);

// --- Navigation ---
type AppView = 'table' | 'seat-selection' | 'history' | 'replay' | 'stats';

export interface NavigationContextType {
  currentView: AppView;
  navigate: (view: AppView) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  currentView: 'seat-selection',
  navigate: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

// --- TopNavBar ---
interface TopNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasActiveSession: boolean;
  onLeaveTable: () => void;
}

const navItems: { view: AppView; label: string; icon: string; requiresSession?: boolean }[] = [
  { view: 'table', label: '牌桌', icon: '🃏', requiresSession: true },
  { view: 'history', label: '历史', icon: '📋' },
  { view: 'stats', label: '统计', icon: '📊' },
];

function TopNavBar({ currentView, onNavigate, hasActiveSession, onLeaveTable }: TopNavBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">GTO Idiot</span>
        <span className="text-xs text-gray-400 hidden sm:inline">6-Max NL Hold'em Trainer</span>
      </div>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const disabled = item.requiresSession && !hasActiveSession;
          const active = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => !disabled && onNavigate(item.view)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        {hasActiveSession && (
          <button
            onClick={onLeaveTable}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            离开牌桌
          </button>
        )}
      </div>
    </header>
  );
}

// --- Toast Component ---
function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  const colorMap: Record<ToastMessage['type'], string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-600',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${colorMap[toast.type]} text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between gap-3 animate-slide-in`}
        >
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="text-white/70 hover:text-white shrink-0">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// --- ConfirmDialog Component ---
function ConfirmDialogOverlay({
  options,
  onConfirm,
  onCancel,
}: {
  options: ConfirmDialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = options.variant === 'danger';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{options.title}</h3>
        <p className="text-sm text-gray-600 mb-6">{options.message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {options.cancelLabel || '取消'}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {options.confirmLabel || '确认'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- PageContainer ---
function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-auto bg-slate-50">
      {children}
    </main>
  );
}

// --- AppShell ---
export interface AppShellProps {
  children?: ReactNode;
  hasActiveSession?: boolean;
  onLeaveTable?: () => void;
  initialView?: AppView;
}

export default function AppShell({
  children,
  hasActiveSession = false,
  onLeaveTable,
  initialView = 'seat-selection',
}: AppShellProps) {
  const [currentView, setCurrentView] = useState<AppView>(initialView);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dialogState, setDialogState] = useState<{
    options: ConfirmDialogOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    dialogState?.resolve(true);
    setDialogState(null);
  };

  const handleCancel = () => {
    dialogState?.resolve(false);
    setDialogState(null);
  };

  const handleLeaveTable = async () => {
    const confirmed = await confirm({
      title: '离开牌桌',
      message: '确定要离开当前牌桌吗？当前牌局进度将被保存。',
      confirmLabel: '离开',
      variant: 'danger',
    });
    if (confirmed && onLeaveTable) {
      onLeaveTable();
    }
  };

  return (
    <NavigationContext.Provider value={{ currentView, navigate: setCurrentView }}>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        <DialogContext.Provider value={{ confirm }}>
          <div className="h-screen flex flex-col bg-slate-50">
            <TopNavBar
              currentView={currentView}
              onNavigate={setCurrentView}
              hasActiveSession={hasActiveSession}
              onLeaveTable={handleLeaveTable}
            />
            <PageContainer>{children}</PageContainer>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            {dialogState && (
              <ConfirmDialogOverlay
                options={dialogState.options}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            )}
          </div>
        </DialogContext.Provider>
      </ToastContext.Provider>
    </NavigationContext.Provider>
  );
}