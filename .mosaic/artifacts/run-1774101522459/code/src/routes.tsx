// ============================================================
// Route definitions — lazy-loaded pages
// ============================================================

import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Eagerly loaded pages (lightweight)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GamePage = lazy(() => import('./pages/GamePage'));

// Lazily loaded heavy pages (replay + stats include charts/recharts)
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

// Fallback 404
const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <span className="text-6xl mb-4">🤷</span>
    <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
    <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn-primary">
      Back to Dashboard
    </a>
  </div>
);

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/game',
        element: <GamePage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/stats',
        element: <StatsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// ============================================================
// Stub page components for route targets
// These will be replaced by actual page modules.
// They are in separate files so lazy() works with default exports.
// ============================================================
