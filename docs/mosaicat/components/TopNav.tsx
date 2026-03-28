import React from 'react';

interface TopNavProps {
  currentRoute: string;
}

const NAV_LINKS = [
  { label: 'Play', href: '/play', icon: 'cards' },
  { label: 'History', href: '/history', icon: 'clock' },
  { label: 'Stats', href: '/stats', icon: 'chart' },
] as const;

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'cards':
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="12" height="16" rx="2" />
          <rect x="10" y="4" width="12" height="16" rx="2" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

export function TopNav({ currentRoute }: TopNavProps) {
  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-amber-400 font-bold text-lg tracking-tight">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PokerLab
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = currentRoute === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-amber-400'
                    : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800'
                }`}
              >
                <NavIcon icon={link.icon} className={isActive ? 'text-amber-400' : ''} />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}