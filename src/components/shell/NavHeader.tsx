import React from 'react';
import { useUIStore, useSessionStore, uiStore } from '../../stores';
import type { AppView } from '../../stores';

interface NavItem {
  view: AppView;
  label: string;
  /** Only shown when there's an active session. */
  requiresSession?: boolean;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home' },
  { view: 'game', label: 'Play', requiresSession: true },
  { view: 'hand-history', label: 'Hands', requiresSession: true },
  { view: 'session-list', label: 'Sessions' },
  { view: 'stats', label: 'Stats' },
];

export const NavHeader: React.FC = () => {
  const activeView = useUIStore((s) => s.activeView);
  const currentSession = useSessionStore((s) => s.currentSession);
  const hasSession = currentSession !== null;

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavigate = (view: AppView) => {
    uiStore.navigateTo(view);
    setMobileMenuOpen(false);
  };

  const visibleItems = navItems.filter(
    (item) => !item.requiresSession || hasSession,
  );

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 text-white font-bold text-lg hover:text-felt-400 transition-colors"
          >
            <span className="text-2xl">🃏</span>
            <span className="hidden sm:inline">GTO Idiot</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavigate(item.view)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-felt-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Session indicator + settings */}
          <div className="flex items-center gap-3">
            {hasSession && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Hand #{currentSession.handCount + 1}</span>
              </div>
            )}
            <button
              onClick={() => uiStore.openModal('settings')}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-2 pb-4 border-t border-gray-800">
            {visibleItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavigate(item.view)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-felt-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
