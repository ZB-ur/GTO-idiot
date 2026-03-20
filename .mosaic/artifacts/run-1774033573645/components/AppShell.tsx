import React, { useState, useCallback, useEffect } from 'react';
import TopNav from './TopNav';
import PageContainer from './PageContainer';
import Toast from './Toast';
import HomePage from './HomePage';
import GameTable from './GameTable';
import HandHistoryList from './HandHistoryList';
import HandReplayView from './HandReplayView';
import StatsDashboard from './StatsDashboard';

type ToastType = 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type Route =
  | { page: 'home' }
  | { page: 'play'; sessionId?: string }
  | { page: 'history' }
  | { page: 'replay'; handId: string }
  | { page: 'stats' };

interface ActiveSession {
  id: string;
  status: string;
  handCount: number;
}

export interface AppShellContext {
  navigate: (path: string, params?: Record<string, string>) => void;
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const AppShellCtx = React.createContext<AppShellContext | null>(null);

export function useAppShell(): AppShellContext {
  const ctx = React.useContext(AppShellCtx);
  if (!ctx) throw new Error('useAppShell must be used within AppShell');
  return ctx;
}

function parseRoute(path: string, params?: Record<string, string>): Route {
  if (path === '/play') return { page: 'play', sessionId: params?.sessionId };
  if (path === '/history') return { page: 'history' };
  if (path === '/replay') return { page: 'replay', handId: params?.handId ?? '' };
  if (path === '/stats') return { page: 'stats' };
  return { page: 'home' };
}

function routeToPath(route: Route): string {
  switch (route.page) {
    case 'play': return '/play';
    case 'history': return '/history';
    case 'replay': return '/replay';
    case 'stats': return '/stats';
    default: return '/';
  }
}

const AppShell: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'home' });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | undefined>();

  // Fetch active session on mount
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/sessions?status=active&limit=1');
        const data = await res.json();
        if (data.sessions?.length > 0) {
          const s = data.sessions[0];
          setActiveSession({
            id: s.id,
            status: s.status,
            handCount: s.handCount,
          });
        }
      } catch {
        // silently ignore — session badge just won't show
      }
    };
    fetchActive();
  }, []);

  const navigate = useCallback((path: string, params?: Record<string, string>) => {
    setRoute(parseRoute(path, params));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const currentPath = routeToPath(route);

  const ctxValue: AppShellContext = { navigate, showToast };

  const needsFullWidth = route.page === 'play' || route.page === 'replay';

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return (
          <PageContainer>
            <HomePage
              onNewSession={() => navigate('/play')}
              onContinueSession={(sessionId) => navigate('/play', { sessionId })}
              onViewSession={(sessionId) => navigate('/play', { sessionId })}
            />
          </PageContainer>
        );
      case 'play':
        return (
          <PageContainer fullWidth>
            <GameTable sessionId={route.sessionId} />
          </PageContainer>
        );
      case 'history':
        return (
          <PageContainer>
            <HandHistoryList
              onSelectHand={(handId: string) => navigate('/replay', { handId })}
            />
          </PageContainer>
        );
      case 'replay':
        return (
          <PageContainer fullWidth>
            <HandReplayView
              handId={route.handId}
              onBack={() => navigate('/history')}
            />
          </PageContainer>
        );
      case 'stats':
        return (
          <PageContainer>
            <StatsDashboard />
          </PageContainer>
        );
      default:
        return null;
    }
  };

  return (
    <AppShellCtx.Provider value={ctxValue}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Navigation */}
        <TopNav
          activeSession={activeSession}
          currentPath={currentPath}
          onNavigate={navigate}
        />

        {/* Main Content */}
        <div className="flex-1">{renderPage()}</div>

        {/* Toast Layer */}
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
    </AppShellCtx.Provider>
  );
};

export default AppShell;