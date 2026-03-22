import React, { Component, lazy, Suspense, useCallback, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './ui/shared/AppShell';
import LoadingScreen from './ui/shared/LoadingScreen';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import Toast from './ui/shared/Toast';
import './App.css';

const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ReplayPage = lazy(() => import('./pages/ReplayPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// ===== Error Boundary =====

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[GTO Idiot] Uncaught error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-felt-950 flex items-center justify-center p-6">
          <div className="card-surface max-w-md w-full p-8 text-center">
            <div className="text-4xl mb-4">♠</div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button onClick={this.handleReload} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== Toast State =====

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// ===== App Component =====

const App: React.FC = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/play" element={<GamePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:handId/replay" element={<ReplayPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={dismissToast}
          />
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
