// ============================================================
// GTO Idiot — Navigation Sidebar
// Main nav: Home, Play, History, Stats, Ranges
// ============================================================

import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/ui-store';
import { useSessionStore } from '../../stores/session-store';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    path: '/play',
    label: 'Play',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/history',
    label: 'History',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/stats',
    label: 'Stats',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: '/ranges',
    label: 'Ranges',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
];

export default function NavSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const currentSession = useSessionStore((s) => s.currentSession);

  // On mobile, sidebar overlays; on desktop it's always visible
  const isCollapsed = sidebarCollapsed && sidebarOpen;
  const width = isCollapsed ? 'w-16' : 'w-56';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-700 bg-gray-800 transition-all duration-200 lg:relative lg:z-auto ${width} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-700 px-4">
          <span className="text-xl">🃏</span>
          {!isCollapsed && (
            <span className="text-lg font-bold text-white">GTO Idiot</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                // Close mobile sidebar on nav
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Session indicator */}
        {currentSession && !isCollapsed && (
          <div className="border-t border-gray-700 p-3">
            <div className="rounded-lg bg-gray-900 p-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentSession.status === 'active'
                      ? 'animate-pulse bg-green-500'
                      : currentSession.status === 'paused'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {currentSession.status === 'active'
                    ? 'Session Active'
                    : currentSession.status === 'paused'
                      ? 'Session Paused'
                      : 'Session Ended'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Hands: {currentSession.hand_count} | Stack:{' '}
                {currentSession.player_stack.toFixed(0)} BB
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
