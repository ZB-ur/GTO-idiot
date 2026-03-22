import React, { useState, useCallback } from 'react';
import { NavHeader } from './NavHeader';
import { LandingPage } from '../pages/LandingPage';
import { PokerTable } from '../game/PokerTable';
import { HandReplayView } from '../review/HandReplayView';
import { StatsDashboard } from '../stats/StatsDashboard';
import { GTOReferenceView } from '../gto/GTOReferenceView';
import { SessionSummary } from '../session/SessionSummary';
import { Toast, ToastMessage } from '../feedback/Toast';

/** Application route definitions */
export type AppRoute =
  | { page: 'landing' }
  | { page: 'table'; sessionId: string }
  | { page: 'replay'; sessionId: string; handId: string }
  | { page: 'stats' }
  | { page: 'gto-reference' }
  | { page: 'session-summary'; sessionId: string };

export interface AppShellProps {}

let toastIdCounter = 0;

export const AppShell: React.FC<AppShellProps> = () => {
  const [route, setRoute] = useState<AppRoute>({ page: 'landing' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const navigate = useCallback((next: AppRoute) => {
    setRoute(next);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info', duration = 4000) => {
      const id = `toast-${++toastIdCounter}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renderPage = () => {
    switch (route.page) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'table':
        return (
          <PokerTable
            sessionId={route.sessionId}
            onNavigate={navigate}
            onToast={showToast}
          />
        );
      case 'replay':
        return (
          <HandReplayView
            sessionId={route.sessionId}
            handId={route.handId}
            onNavigate={navigate}
          />
        );
      case 'stats':
        return <StatsDashboard onNavigate={navigate} />;
      case 'gto-reference':
        return <GTOReferenceView onNavigate={navigate} />;
      case 'session-summary':
        return (
          <SessionSummary
            sessionId={route.sessionId}
            onNavigate={navigate}
          />
        );
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  const isInGame = route.page === 'table';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation header — hidden during active gameplay for immersion */}
      {!isInGame && (
        <NavHeader
          currentPage={route.page}
          onNavigate={navigate}
        />
      )}

      {/* Main content area */}
      <main className={`flex-1 ${isInGame ? '' : 'max-w-7xl w-full mx-auto'}`}>
        {renderPage()}
      </main>

      {/* Global toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </div>
  );
};

export default AppShell;