import React from 'react';

interface AppHeaderProps {
  currentView: 'lobby' | 'table' | 'history' | 'review' | 'summary';
  sessionActive?: boolean;
  onNavigate: (view: string) => void;
  onEndSession?: () => void;
}

const navItems = [
  { key: 'lobby', label: 'Lobby' },
  { key: 'table', label: 'Table' },
  { key: 'history', label: 'History' },
  { key: 'summary', label: 'Summary' },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  sessionActive,
  onNavigate,
  onEndSession,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo + learning badge */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-gray-900">
            GTO <span className="text-blue-600">Idiot</span>
          </div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wider rounded-full">
            Learning Tool
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Session controls */}
        <div className="flex items-center gap-3">
          {sessionActive && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Session Active</span>
              </div>
              <button
                onClick={onEndSession}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                End Session
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;