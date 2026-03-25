import React from 'react';

interface TopNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSettingsClick: () => void;
  currentLanguage: 'zh' | 'en';
  onLanguageChange: (lang: 'zh' | 'en') => void;
}

interface NavItem {
  key: string;
  labelZh: string;
  labelEn: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'play',
    labelZh: '对战',
    labelEn: 'Play',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'review',
    labelZh: '复盘',
    labelEn: 'Review',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'learn',
    labelZh: '学习',
    labelEn: 'Learn',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'stats',
    labelZh: '统计',
    labelEn: 'Stats',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function LanguageToggle({
  currentLanguage,
  onLanguageChange,
}: {
  currentLanguage: 'zh' | 'en';
  onLanguageChange: (lang: 'zh' | 'en') => void;
}) {
  return (
    <button
      onClick={() => onLanguageChange(currentLanguage === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 transition-colors"
      title={currentLanguage === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{currentLanguage === 'zh' ? '中' : 'EN'}</span>
    </button>
  );
}

export default function TopNav({
  currentPage,
  onNavigate,
  onSettingsClick,
  currentLanguage,
  onLanguageChange,
}: TopNavProps) {
  return (
    <nav className="bg-[#16213e] border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('play')}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-gray-100 font-bold text-lg tracking-tight hidden sm:inline">
            Mosaicat Poker
          </span>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/40'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">
                  {currentLanguage === 'zh' ? item.labelZh : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <LanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700/50 transition-colors"
            title={currentLanguage === 'zh' ? '设置' : 'Settings'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}