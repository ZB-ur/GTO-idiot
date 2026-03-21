import React from 'react';

interface ActiveSession {
  id: string;
  status: string;
  handCount: number;
}

interface NavSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  activeSession?: ActiveSession;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    id: 'game',
    label: '游戏',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: '历史',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: '统计',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const statusLabels: Record<string, string> = {
  active: '进行中',
  paused: '已暂停',
  completed: '已结束',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-yellow-500',
  completed: 'bg-gray-500',
};

export const NavSidebar: React.FC<NavSidebarProps> = ({
  currentPage,
  onNavigate,
  activeSession,
}) => {
  return (
    <aside className="flex flex-col w-64 h-screen bg-gray-900 border-r border-gray-700">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-gray-950 font-bold text-lg">
          G
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-50 leading-tight">GTO Idiot</h1>
          <p className="text-xs text-gray-500">德州扑克GTO训练器</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-50'
                }
              `}
            >
              <span className={isActive ? 'text-emerald-500' : 'text-gray-500'}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Session Card */}
      {activeSession && (
        <div className="mx-3 mb-4 p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              当前牌局
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  statusColors[activeSession.status] ?? 'bg-gray-500'
                } ${activeSession.status === 'active' ? 'animate-pulse' : ''}`}
              />
              <span className="text-xs text-gray-400">
                {statusLabels[activeSession.status] ?? activeSession.status}
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-50">
              {activeSession.handCount}
            </span>
            <span className="text-sm text-gray-500">手</span>
          </div>
          <button
            onClick={() => onNavigate('game')}
            className="mt-3 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-semibold transition-colors duration-150"
          >
            继续游戏
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">v1.0.0</p>
      </div>
    </aside>
  );
};

export default NavSidebar;