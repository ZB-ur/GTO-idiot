import React from 'react';

interface LanguageToggleProps {
  language: 'en' | 'zh';
  onChange: (lang: 'en' | 'zh') => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onChange,
}) => {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-700 bg-gray-800 p-0.5">
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150
          ${language === 'en'
            ? 'bg-emerald-500 text-gray-950'
            : 'text-gray-400 hover:text-gray-50'
          }
        `}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('zh')}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150
          ${language === 'zh'
            ? 'bg-emerald-500 text-gray-950'
            : 'text-gray-400 hover:text-gray-50'
          }
        `}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageToggle;