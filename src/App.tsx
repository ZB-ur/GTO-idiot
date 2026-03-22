import React, { lazy, Suspense, useCallback, useState } from 'react';
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

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
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
  );
};

export default App;
