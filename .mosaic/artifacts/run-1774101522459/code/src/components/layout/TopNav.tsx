// ============================================================
// TopNav — Main navigation bar with route links
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/game', label: 'Play', icon: '🎮' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/stats', label: 'Stats', icon: '📊' },
] as const;

export const TopNav: React.FC = () => (
  <nav className="bg-gray-800 border-b border-gray-700 px-4 h-14 flex items-center shrink-0">
    <span className="text-lg font-bold text-white mr-8 select-none">
      GTO Idiot
    </span>

    <div className="flex items-center gap-1">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`
          }
        >
          <span className="mr-1.5" aria-hidden="true">{icon}</span>
          {label}
        </NavLink>
      ))}
    </div>
  </nav>
);
