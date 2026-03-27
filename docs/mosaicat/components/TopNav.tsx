import React from 'react';

interface TopNavProps {
  activePage: string;
  language: 'en' | 'zh';
  onLanguageChange: (lang: 'en' | 'zh') => void;
}

const navLinks = [
  { key: 'home', label: { en: 'Home', zh: '首页' }, href: '/' },
  { key: 'stats', label: { en: 'Statistics', zh: '统计' }, href: '/stats' },
  { key: 'history', label: { en: 'History', zh: '历史' }, href: '/history' },
];

export const TopNav: React.FC<TopNavProps> = ({ activePage, language, onLanguageChange }) => {
  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-950" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <span className="text-gray-50 text-lg font-bold tracking-tight">PokerGTO</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === link.key
                ? 'bg-gray-800 text-emerald-400'
                : 'text-gray-400 hover:text-gray-50 hover:bg-gray-800/50'
            }`}
          >
            {link.label[language]}
          </a>
        ))}
      </div>

      {/* Language Toggle */}
      <button
        onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-gray-50 hover:border-gray-500 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="font-medium">{language === 'en' ? 'EN' : '中文'}</span>
      </button>
    </nav>
  );
};