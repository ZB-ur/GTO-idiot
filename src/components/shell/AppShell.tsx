// ============================================================
// GTO Idiot — App Shell
// Top-level layout: sidebar + header + main content area
// ============================================================

import { type ReactNode } from 'react';
import NavSidebar from './NavSidebar';
import SessionControls from '../session/SessionControls';
import ToastContainer from '../common/Toast';
import SessionConfigModal from '../session/SessionConfigModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { useUIStore } from '../../stores/ui-store';
import { useSessionStore } from '../../stores/session-store';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const globalLoading = useUIStore((s) => s.globalLoading);
  const loadingMessage = useUIStore((s) => s.loadingMessage);
  const currentSession = useSessionStore((s) => s.currentSession);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <NavSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
          {/* Left: hamburger (mobile) */}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center: title (desktop shows nothing, mobile shows brand) */}
          <div className="lg:hidden">
            <span className="text-sm font-semibold text-white">GTO Idiot</span>
          </div>
          <div className="hidden lg:block" />

          {/* Right: session controls */}
          {currentSession && currentSession.status !== 'completed' && (
            <SessionControls />
          )}
          {!currentSession && <div />}
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global loading overlay */}
      {globalLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
          <LoadingSpinner size="lg" message={loadingMessage ?? 'Loading...'} />
        </div>
      )}

      {/* Modals */}
      <SessionConfigModal />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
