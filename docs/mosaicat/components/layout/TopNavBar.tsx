import React, { useState } from 'react';

export type NavTab = 'lobby' | 'table' | 'replay' | 'stats';

export interface TopNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  showLeaveButton?: boolean;
  onLeave?: () => void;
}

interface TabConfig {
  key: NavTab;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  {
    key: 'lobby',
    label: '大厅',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
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
    key: 'replay',
    label: '复盘',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'stats',
    label: '统计',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative p-2 rounded-lg transition-colors ${
        enabled
          ? 'text-amber-500 hover:bg-gray-800'
          : 'text-gray-500 hover:bg-gray-800'
      }`}
      aria-label={enabled ? '关闭音效' : '开启音效'}
    >
      {enabled ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.788l4.033-3.07A1 1 0 0112 6.5v11a1 1 0 01-1.467.884L6.5 15.212H4a1 1 0 01-1-1v-4.424a1 1 0 011-1h2.5z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 8.788l4.033-3.07A1 1 0 0112 6.5v11a1 1 0 01-1.467.884L6.5 15.212H4a1 1 0 01-1-1v-4.424a1 1 0 011-1h2.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l-6 6m0-6l6 6" />
        </svg>
      )}
    </button>
  );
}

function LeaveTableButton({ onLeave }: { onLeave?: () => void }) {
  return (
    <button
      onClick={onLeave}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
      </svg>
      离开
    </button>
  );
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onTabChange,
  showLeaveButton = false,
  onLeave,
}) => {
  return (
    <nav className="flex items-center justify-between px-4 h-14 bg-gray-900 border-b border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
          <span className="text-gray-950 font-bold text-sm">♠</span>
        </div>
        <span className="text-gray-50 font-semibold text-base hidden sm:inline">
          Poker Trainer
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-gray-950 rounded-xl p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-800 text-amber-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <SoundToggle />
        {showLeaveButton && <LeaveTableButton onLeave={onLeave} />}
      </div>
    </nav>
  );
};

export default TopNavBar;