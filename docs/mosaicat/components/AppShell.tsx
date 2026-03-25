import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// ─── Types ───

type Page = 'home' | 'table' | 'history' | 'stats';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface AppShellContextValue {
  currentPage: Page;
  navigate: (page: Page) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
  showGuide: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppShell must be used within <AppShell>');
  return ctx;
}

// ─── Sub-components ───

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: 'home', label: '首页', icon: '🏠' },
  { page: 'table', label: '牌桌', icon: '♠️' },
  { page: 'history', label: '牌局', icon: '📋' },
  { page: 'stats', label: '统计', icon: '📊' },
];

function NavBar({ currentPage, onNavigate }: NavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ page, label, icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Toast ───

const TOAST_STYLES: Record<ToastMessage['type'], { bg: string; icon: string }> = {
  success: { bg: 'bg-green-500', icon: '✓' },
  warning: { bg: 'bg-yellow-500', icon: '⚠' },
  error: { bg: 'bg-red-500', icon: '✕' },
  info: { bg: 'bg-blue-600', icon: 'ℹ' },
};

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const style = TOAST_STYLES[t.type];
        return (
          <div
            key={t.id}
            className={`${style.bg} text-white rounded-lg shadow-md px-4 py-3 flex items-center gap-2 pointer-events-auto animate-slide-down`}
            role="alert"
          >
            <span className="font-bold text-sm">{style.icon}</span>
            <span className="text-sm flex-1">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100 text-sm">✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Storage Warning Banner ───

function StorageWarningBanner({ usagePercent, onCleanup }: { usagePercent: number; onCleanup: () => void }) {
  if (usagePercent < 80) return null;
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-sm">
      <span className="text-yellow-800">
        ⚠ 存储空间已使用 {usagePercent.toFixed(0)}%，建议清理旧记录
      </span>
      <button
        onClick={onCleanup}
        className="text-yellow-700 font-medium hover:text-yellow-900 underline"
      >
        立即清理
      </button>
    </div>
  );
}

// ─── Full Screen Loader ───

function FullScreenLoader({ visible, message }: { visible: boolean; message?: string }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      {message && <p className="text-white text-sm">{message}</p>}
    </div>
  );
}

// ─── Newbie Guide Modal ───

const GUIDE_STEPS = [
  { title: '欢迎来到 GTO Idiot', body: '这是一款德州扑克 GTO 策略训练器，帮助你用科学的方式提升牌技。' },
  { title: '开始牌局', body: '在首页选择盲注级别和买入量，点击"开始新牌局"即可入座 6 人桌。' },
  { title: 'GTO 提示', body: '每手牌结束后会显示 GTO 对比复盘，绿色代表符合 GTO，红色代表偏离。' },
  { title: '查看统计', body: '在统计页面追踪你的胜率、盈亏曲线和各位置表现。祝你好运！' },
];

function NewbieGuideModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  if (!visible) return null;

  const current = GUIDE_STEPS[step];
  const isLast = step === GUIDE_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{current.body}</p>
        </div>
        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {GUIDE_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-3 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            跳过
          </button>
          <button
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {isLast ? '开始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AppShell ───

interface AppShellProps {
  children?: ReactNode;
  /** Render prop receiving current page for routing */
  renderPage?: (page: Page) => ReactNode;
  /** Initial page, defaults to 'home' */
  initialPage?: Page;
}

let toastIdCounter = 0;

export default function AppShell({ children, renderPage, initialPage = 'home' }: AppShellProps) {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [guideVisible, setGuideVisible] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);

  // Check onboarding & storage on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (!settings.onboardingComplete) {
            setGuideVisible(true);
          }
        }
      } catch {
        // Ignore — settings unavailable
      }

      try {
        const res = await fetch('/api/storage/status');
        if (res.ok) {
          const status = await res.json();
          setStorageUsage(status.usagePercent);
        }
      } catch {
        // Ignore
      }
    })();
  }, []);

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${++toastIdCounter}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration ?? 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setLoadingState(loading);
    setLoadingMessage(message);
  }, []);

  const showGuide = useCallback(() => setGuideVisible(true), []);

  const handleGuideClose = useCallback(async () => {
    setGuideVisible(false);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingComplete: true }),
      });
    } catch {
      // Best-effort
    }
  }, []);

  const handleStorageCleanup = useCallback(async () => {
    setLoading(true, '正在清理存储…');
    try {
      const res = await fetch('/api/storage/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: 'auto' }),
      });
      if (res.ok) {
        const result = await res.json();
        setStorageUsage(result.currentUsagePercent);
        showToast({ type: 'success', message: result.message || '清理完成' });
      }
    } catch {
      showToast({ type: 'error', message: '清理失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  }, [setLoading, showToast]);

  const contextValue: AppShellContextValue = {
    currentPage,
    navigate,
    showToast,
    dismissToast,
    setLoading,
    showGuide,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Storage Warning */}
        <StorageWarningBanner usagePercent={storageUsage} onCleanup={handleStorageCleanup} />

        {/* Main Content — with bottom padding for nav bar */}
        <main className="flex-1 pb-16">
          {renderPage ? renderPage(currentPage) : children}
        </main>

        {/* Bottom Navigation */}
        <NavBar currentPage={currentPage} onNavigate={navigate} />

        {/* Overlays */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <FullScreenLoader visible={loading} message={loadingMessage} />
        <NewbieGuideModal visible={guideVisible} onClose={handleGuideClose} />
      </div>
    </AppShellContext.Provider>
  );
}