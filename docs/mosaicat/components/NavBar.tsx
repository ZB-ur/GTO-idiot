import React from 'react';

interface NavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSettings: () => void;
  hasHistory?: boolean;
}

const navItems = [
  { route: '/new-session', label: 'New Session', icon: 'play' },
  { route: '/history', label: 'Hand History', icon: 'history' },
] as const;

export const NavBar: React.FC<NavBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSettings,
  hasHistory = false,
}) => {
  const renderIcon = (icon: string, className: string) => {
    switch (icon) {
      case 'play':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className={className}>
            <path d="M6 4l8 5-8 5V4z" />
          </svg>
        );
      case 'history':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
            <circle cx="9" cy="9" r="6.5" />
            <path d="M9 5.5V9l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
      {/* Logo */}
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-2 text-gray-50 hover:text-amber-400 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
          <span className="text-gray-950 font-bold text-sm">♠</span>
        </div>
        <span className="text-lg font-bold tracking-tight hidden sm:block">
          Poker<span className="text-amber-500">Coach</span>
        </span>
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          const isDisabled = item.route === '/history' && !hasHistory;

          return (
            <button
              key={item.route}
              onClick={() => !isDisabled && onNavigate(item.route)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400'
                  : isDisabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
              }`}
            >
              {renderIcon(
                item.icon,
                isActive ? 'text-amber-400' : isDisabled ? 'text-gray-600' : 'text-gray-500',
              )}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-800 mx-1" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-50 hover:bg-gray-800 transition-colors"
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="2.5" />
            <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
};