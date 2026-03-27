import React, { useState, useRef, useEffect } from 'react';

interface BotStyleDropdownProps {
  value: string;
  onChange: (style: string) => void;
  disabled?: boolean;
}

interface BotStyleOption {
  value: string;
  label: string;
  description: string;
}

const BOT_STYLES: BotStyleOption[] = [
  { value: 'TAG', label: 'TAG', description: 'Tight-Aggressive — selective hands, aggressive bets' },
  { value: 'LAG', label: 'LAG', description: 'Loose-Aggressive — wide range, constant pressure' },
  { value: 'Fish', label: 'Fish', description: 'Recreational — calls too much, weak decisions' },
  { value: 'Nit', label: 'Nit', description: 'Ultra-tight — only plays premium hands' },
  { value: 'CallingStation', label: 'Calling Station', description: 'Passive caller — rarely raises, never folds' },
];

export const BotStyleDropdown: React.FC<BotStyleDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = BOT_STYLES.find((s) => s.value === value) ?? BOT_STYLES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (style: string) => {
    onChange(style);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-64">
      {/* Trigger button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl
          text-sm font-semibold text-left
          transition-colors duration-150
          ${disabled
            ? 'bg-gray-800/50 border border-gray-700/50 text-gray-600 cursor-not-allowed'
            : 'bg-gray-800 border border-gray-700 text-gray-50 hover:border-gray-600 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-amber-500/50 border-amber-500' : ''}
        `}
      >
        <span>{selectedOption.label}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-gray-800 border border-gray-700 shadow-lg shadow-black/40 overflow-hidden">
          {BOT_STYLES.map((style) => {
            const isActive = style.value === value;
            return (
              <button
                key={style.value}
                onClick={() => handleSelect(style.value)}
                className={`
                  w-full flex flex-col px-3 py-2.5 text-left
                  transition-colors duration-100
                  ${isActive
                    ? 'bg-amber-500/15 border-l-2 border-amber-500'
                    : 'border-l-2 border-transparent hover:bg-gray-700/60'
                  }
                `}
              >
                <span className={`text-sm font-semibold ${isActive ? 'text-amber-400' : 'text-gray-50'}`}>
                  {style.label}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BotStyleDropdown;