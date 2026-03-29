import React, { useState, useEffect, useCallback } from 'react';
import TopNavBar from './TopNavBar';
import DesktopOnlyGuard from './DesktopOnlyGuard';
import Toast from './Toast';
import LandingScreen from './LandingScreen';
import PokerTable from './PokerTable';
import HistoryList from './HistoryList';
import ReplayView from './ReplayView';
import SessionSummary from './SessionSummary';

// --- Types ---

type Route =
  | { page: 'landing' }
  | { page: 'table'; sessionId: string }
  | { page: 'history' }
  | { page: 'replay'; handId: string }
  | { page: 'summary'; sessionId: string };

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  text: string;
  durationMs?: number;
}

// --- Context ---

interface AppContextValue {
  route: Route;
  navigate: (route: Route) => void;
  showToast: (msg: Omit<ToastMessage, 'id'>) => void;
  isDesktop: boolean;
}

export const AppContext = React.createContext<AppContextValue>({
  route: { page: 'landing' },
  navigate: () => {},
  showToast: () => {},
  isDesktop: true,
});

// --- Hooks ---

const MIN_DESKTOP_WIDTH = 1024;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= MIN_DESKTOP_WIDTH
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_DESKTOP_WIDTH}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { ...msg, id };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, msg.durationMs ?? 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

// --- Component ---

const AppShell: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'landing' });
  const isDesktop = useIsDesktop();
  const { toasts, showToast, dismissToast } = useToasts();

  const navigate = useCallback((next: Route) => {
    setRoute(next);
  }, []);

  // Render the active page based on route
  const renderPage = () => {
    switch (route.page) {
      case 'landing':
        return <LandingScreen />;
      case 'table':
        return <PokerTable sessionId={route.sessionId} />;
      case 'history':
        return <HistoryList />;
      case 'replay':
        return <ReplayView handId={route.handId} />;
      case 'summary':
        return <SessionSummary sessionId={route.sessionId} />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <AppContext.Provider value={{ route, navigate, showToast, isDesktop }}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Navigation */}
        <TopNavBar
          currentPage={route.page}
          onNavigate={navigate}
        />

        {/* Desktop-only guard overlay */}
        {!isDesktop && <DesktopOnlyGuard />}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {renderPage()}
        </main>

        {/* Toast Container */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                type={toast.type}
                message={toast.text}
                onDismiss={() => dismissToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default AppShell;