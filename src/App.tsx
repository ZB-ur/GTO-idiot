// ============================================================
// GTO Idiot — Root App Component
// Provides routing within the AppShell layout
// ============================================================

import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import HomePage from './components/shell/HomePage';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-load page-level components (will be added by other modules)
// For now, use placeholder pages that will be replaced by actual implementations
function PlayPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-gray-400">Game table loading...</p>
        <p className="mt-2 text-sm text-gray-500">
          Start a session from the Home page to begin playing.
        </p>
      </div>
    </div>
  );
}

function HistoryPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-lg text-gray-400">Hand history will appear here.</p>
    </div>
  );
}

function StatsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-lg text-gray-400">Statistics dashboard will appear here.</p>
    </div>
  );
}

function RangesPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-lg text-gray-400">Preflop range charts will appear here.</p>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" message="Loading page..." />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/ranges" element={<RangesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
