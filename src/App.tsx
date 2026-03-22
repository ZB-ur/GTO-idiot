import React from 'react';
import { AppShell } from './components/shell/AppShell';
import { LandingPage } from './components/shell/LandingPage';
import { useUIStore } from './stores';
import { PageLoader } from './components/common/SkeletonLoader';
import { EmptyState } from './components/common/EmptyState';
import type { AppView } from './stores';

/**
 * Placeholder page for views not yet implemented by other modules.
 * Will be replaced as game-table, review, stats modules are built.
 */
const PlaceholderPage: React.FC<{ view: AppView }> = ({ view }) => (
  <EmptyState
    icon="🚧"
    title={`${view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')} — Coming Soon`}
    description="This feature is under construction."
    action={{ label: 'Go Home', onClick: () => import('./stores').then(m => m.uiStore.navigateTo('home')) }}
  />
);

/**
 * Main App component — uses the UI store's activeView to render the
 * appropriate page. AppShell provides the nav header, footer, toasts,
 * and error boundary wrapper.
 */
const App: React.FC = () => {
  const activeView = useUIStore((s) => s.activeView);

  const renderView = (): React.ReactNode => {
    switch (activeView) {
      case 'home':
        return <LandingPage />;
      case 'game':
        return <PlaceholderPage view="game" />;
      case 'review':
        return <PlaceholderPage view="review" />;
      case 'hand-history':
        return <PlaceholderPage view="hand-history" />;
      case 'stats':
        return <PlaceholderPage view="stats" />;
      case 'settings':
        return <PlaceholderPage view="settings" />;
      case 'session-list':
        return <PlaceholderPage view="session-list" />;
      default:
        return <PageLoader message="Loading..." />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
};

export default App;
