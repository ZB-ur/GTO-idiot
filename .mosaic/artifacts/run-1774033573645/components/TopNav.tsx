import React from 'react';

interface ActiveSession {
  id: string;
  status: string;
  handCount: number;
}

interface TopNavProps {
  activeSession?: ActiveSession;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navLinks = [
  { path: '/play', label: '对战', icon: '♠' },
  { path: '/history', label: '历史', icon: '📋' },
  { path: '/stats', label: '统计', icon: '📊' },
];

function SessionBadge({ session }: { session: ActiveSession }) {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    completed: 'bg-gray-400',
  };

  const statusLabels: Record<string, string> = {
    active: '进行中',
    paused: '已暂停',
    completed: '已结束',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
      <span
        className={`w-2 h-2 rounded-full ${statusColors[session.status] ?? 'bg-gray-400'}`}
      />
      <span className="text-gray-500">
        {statusLabels[session.status] ?? session.status}
      </span>
      <span className="text-gray-300">|</span>
      <span className="text-gray-900 font-medium">
        #{session.handCount}
      </span>
    </div>
  );
}

export default function TopNav({
  activeSession,
  currentPath,
  onNavigate,
}: TopNavProps) {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🃏</span>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            GTO Idiot
          </span>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                  }
                `}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Session Status */}
        <div className="flex items-center">
          {activeSession ? (
            <SessionBadge session={activeSession} />
          ) : (
            <span className="text-sm text-gray-400">无活跃 Session</span>
          )}
        </div>
      </div>
    </nav>
  );
}