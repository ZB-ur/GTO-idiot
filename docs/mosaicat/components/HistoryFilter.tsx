import React, { useState, useRef, useEffect } from 'react';

interface HistoryFilterProps {
  filterKeyHands: boolean;
  filterPosition?: string;
  onFilterChange: (filters: { keyHands?: boolean; position?: string }) => void;
}

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;

export const HistoryFilter: React.FC<HistoryFilterProps> = ({
  filterKeyHands,
  filterPosition,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = (filterKeyHands ? 1 : 0) + (filterPosition ? 1 : 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
          activeCount > 0
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        筛选
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Key Hands Toggle */}
          <div className="p-4 border-b border-gray-700">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-50">仅关键手牌</span>
              <button
                onClick={() => onFilterChange({ keyHands: !filterKeyHands })}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  filterKeyHands ? 'bg-amber-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    filterKeyHands ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Position Filter */}
          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">按位置筛选</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onFilterChange({ position: undefined })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !filterPosition
                    ? 'bg-amber-500 text-gray-950'
                    : 'bg-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                全部
              </button>
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    onFilterChange({ position: filterPosition === pos ? undefined : pos })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterPosition === pos
                      ? 'bg-amber-500 text-gray-950'
                      : 'bg-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};