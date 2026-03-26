import React from 'react';

interface TopNavBarProps {
  activePage: 'game' | 'history' | 'seat-selection';
  hasActiveGame: boolean;
  onNavigate: (page: string) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  activePage,
  hasActiveGame,
  onNavigate,
}) => {
  const navItems = [
    {
      key: 'game',
      label: '开始牌局',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'history',
      label: '手牌历史',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <button
          onClick={() => onNavigate('game')}
          className="flex items-center gap-2 shrink-0 group"
        >
          <span className="text-2xl" role="img" aria-label="poker">🃏</span>
          <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            GTO Idiot
          </span>
        </button>

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
                {/* Active game indicator dot */}
                {item.key === 'game' && hasActiveGame && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;