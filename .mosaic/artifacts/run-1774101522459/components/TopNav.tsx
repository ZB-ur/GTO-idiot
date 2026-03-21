import React from 'react';

type Tab = 'game' | 'history' | 'stats';

interface TopNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasActiveSession?: boolean;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'game', label: '对战', icon: '🎴' },
  { key: 'history', label: '历史', icon: '📋' },
  { key: 'stats', label: '统计', icon: '📊' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveSession = false,
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            GTO Idiot
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Session Status Indicator */}
        <div className="flex items-center shrink-0">
          {hasActiveSession ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-green-700">进行中</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="inline-flex rounded-full h-2 w-2 bg-gray-300" />
              <span className="text-sm font-medium text-gray-400">无会话</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;