import React from 'react';

interface LanguageToggleProps {
  currentLanguage: 'zh' | 'en';
  onChange: (lang: 'zh' | 'en') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onChange }) => {
  return (
    <div className="inline-flex items-center bg-[#1e293b] border border-gray-700 rounded-lg p-0.5">
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currentLanguage === 'zh'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={() => onChange('zh')}
      >
        中文
      </button>
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currentLanguage === 'en'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={() => onChange('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;