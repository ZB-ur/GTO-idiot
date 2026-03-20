import React, { useState, useRef, useEffect } from 'react';

export type BotStyle = 'GTO' | 'LAG' | 'TAG' | 'Fish';

interface BotStylePickerProps {
  value: BotStyle;
  onChange: (style: BotStyle) => void;
  seatLabel: string;
}

const BOT_STYLES: { value: BotStyle; label: string; description: string; icon: string; color: string }[] = [
  { value: 'GTO', label: 'GTO', description: '博弈论最优策略', icon: '🎯', color: 'text-emerald-400' },
  { value: 'TAG', label: 'TAG', description: '紧凶型，范围紧、下注凶', icon: '🛡️', color: 'text-blue-400' },
  { value: 'LAG', label: 'LAG', description: '松凶型，范围宽、攻击性强', icon: '🔥', color: 'text-amber-400' },
  { value: 'Fish', label: 'Fish', description: '鱼型，松被动、容易犯错', icon: '🐟', color: 'text-red-400' },
];

export const BotStylePicker: React.FC<BotStylePickerProps> = ({ value, onChange, seatLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = BOT_STYLES.find((s) => s.value === value) ?? BOT_STYLES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Seat Label */}
      <label className="block text-xs font-medium text-gray-400 mb-1">{seatLabel}</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2
          bg-gray-800 border rounded-lg text-sm text-white
          transition-colors duration-150
          ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-gray-600 hover:border-gray-500'}
        `}
      >
        <span className="flex items-center gap-2">
          <span>{selected.icon}</span>
          <span className={`font-semibold ${selected.color}`}>{selected.label}</span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {BOT_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => {
                onChange(style.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm
                transition-colors duration-100
                ${style.value === value ? 'bg-gray-700' : 'hover:bg-gray-700/60'}
              `}
            >
              <span className="text-base">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${style.color}`}>{style.label}</div>
                <div className="text-xs text-gray-400 truncate">{style.description}</div>
              </div>
              {style.value === value && (
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BotStylePicker;