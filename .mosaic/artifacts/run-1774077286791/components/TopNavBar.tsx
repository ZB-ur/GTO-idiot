import React from 'react';

export interface TopNavBarProps {
  currentPage: 'table' | 'history' | 'replay';
  sessionInfo?: { handCount: number; profitLoss: number };
  onNavigate: (page: string) => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'table',
    label: '牌桌',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: '历史',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'replay',
    label: '复盘',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

const TopNavBar: React.FC<TopNavBarProps> = ({ currentPage, sessionInfo, onNavigate }) => {
  const profitColor = sessionInfo
    ? sessionInfo.profitLoss >= 0
      ? 'text-emerald-400'
      : 'text-red-400'
    : '';
  const profitSign = sessionInfo && sessionInfo.profitLoss >= 0 ? '+' : '';

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-4 h-14 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onNavigate('table')}>
        <span className="text-emerald-400 text-xl font-bold tracking-tight">♠</span>
        <span className="text-white text-lg font-bold">
          GTO<span className="text-emerald-400">Idiot</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Session Info */}
      <div className="flex items-center gap-2">
        {sessionInfo ? (
          <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">局数</span>
              <span className="text-white text-xs font-semibold tabular-nums">{sessionInfo.handCount}</span>
            </div>
            <div className="w-px h-3 bg-gray-600" />
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">盈亏</span>
              <span className={`text-xs font-semibold tabular-nums ${profitColor}`}>
                {profitSign}{sessionInfo.profitLoss.toFixed(1)} BB
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-500" />
            <span className="text-gray-500 text-xs font-medium">无活跃牌局</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavBar;