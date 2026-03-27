import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '大厅' },
  { to: '/hands', label: '牌局记录' },
  { to: '/stats', label: '统计' },
] as const;

export function TopNavBar(): ReactNode {
  return (
    <header className="sticky top-0 z-50 flex h-12 items-center border-b border-gray-800 bg-gray-950/90 px-4 backdrop-blur-sm">
      <NavLink to="/" className="mr-6 text-lg font-bold tracking-tight text-amber-400">
        GTO Idiot
      </NavLink>

      <nav className="flex gap-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
