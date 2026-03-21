typescript
import React, { useState, useCallback, useMemo } from 'react';
import TopNav from './TopNav';
import Toast from './Toast';
import PageContainer from './PageContainer';

// -- Route types -------------------------------------------------------

type Route = '/' | '/play' | '/history' | '/history/replay' | '/stats';

interface RouteParams {
  handId?: string;
  sessionId?: string;
}

// -- Toast types -------------------------------------------------------

type ToastType = 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// -- Active session (shared across views) ------------------------------

interface ActiveSession {
  id: string;
  status: string;
  handCount: number;
}

// -- Context for toast & navigation ------------------------------------

interface AppContextValue {
  /** Navigate to a route */
  navigate: (path: Route, params?: RouteParams) => void;
  /** Current route */
  currentRoute: Route;
  /** Route params */
  routeParams: RouteParams;
  /** Show a toast notification */
  showToast: (message: string, type: ToastType, duration?: number) => void;
  /** Active session info (if any) */
  activeSession: ActiveSession | undefined;
  /** Update active session */
  setActiveSession: (session: ActiveSession | undefined) => void;
}

export const AppContext = React.createContext<AppContextValue | null>(null);

/** Hook for consuming AppContext */
export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppShell>');
  return ctx;
}

// -- Lazy page imports (code-split per route) --------------------------
// These would be actual lazy imports in production:
//   const PokerTable   = React.lazy(() => import('./PokerTable'));
//   const HandHistory  = React.lazy(() => import('./HandHistoryList'));
//   const HandReplay   = React.lazy(() => import('./HandReplayView'));
//   const StatsDash    = React.lazy(() => import('./StatsDashboard'));
//   const HomePage     = React.lazy(() => import('./HomePage'));

interface AppShellProps {
  /** Render function per route — allows parent to inject actual page components */
  renderPage?: (route: Route, params: RouteParams) => React.ReactNode;
  /** Initial route */
  initialRoute?: Route;
  /** Initial active session */
  initialSession?: ActiveSession;
}

let toastSeq = 0;

export default function AppShell({
  renderPage,
  initialRoute = '/',
  initialSession,
}: AppShellProps) {
  // -- Routing state ---------------------------------------------------
  const [currentRoute, setCurrentRoute] = useState<Route>(initialRoute);
  const [routeParams, setRouteParams] = useState<RouteParams>({});

  // -- Session state ---------------------------------------------------
  const [activeSession, setActiveSession] = useState<ActiveSession | undefined>(
    initialSession,
  );

  // -- Toast state -----------------------------------------------------
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const navigate = useCallback((path: Route, params?: RouteParams) => {
    setCurrentRoute(path);
    setRouteParams(params ?? {});
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration?: number) => {
      const id = `toast-${++toastSeq}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // -- Context value ---------------------------------------------------
  const contextValue = useMemo<AppContextValue>(
    () => ({
      navigate,
      currentRoute,
      routeParams,
      showToast,
      activeSession,
      setActiveSession,
    }),
    [navigate, currentRoute, routeParams, showToast, activeSession],
  );

  // -- Route → path mapping for TopNav --------------------------------
  const navPath = currentRoute.startsWith('/history')
    ? '/history'
    : currentRoute;

  // -- Default page placeholder when no renderPage is provided ---------
  const pageContent = renderPage ? (
    renderPage(currentRoute, routeParams)
  ) : (
    <PageContainer>
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Route: {currentRoute}
      </div>
    </PageContainer>
  );

  // -- Full-width routes (e.g., poker table) ---------------------------
  const isFullWidth = currentRoute === '/play';

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Navigation */}
        <TopNav
          activeSession={activeSession}
          currentPath={navPath}
          onNavigate={(path) => navigate(path as Route)}
        />

        {/* Page Content */}
        <div className={`flex-1 ${isFullWidth ? '' : ''}`}>
          {pageContent}
        </div>

        {/* Toast Stack */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
}