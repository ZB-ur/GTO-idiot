import React, { useState, useRef, useEffect } from 'react';

type Difficulty = 'fish' | 'regular' | 'gto';

interface DifficultyDropdownProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

const difficultyOptions: { value: Difficulty; label: string; description: string }[] = [
  { value: 'fish', label: '🐟 Fish', description: 'Loose & passive play' },
  { value: 'regular', label: '♠️ Regular', description: 'Solid TAG style' },
  { value: 'gto', label: '🧠 GTO', description: 'Game-theory optimal' },
];

const DifficultyDropdown: React.FC<DifficultyDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = difficultyOptions.find((o) => o.value === value)!;

  return (
    <div ref={ref} className="relative w-64">
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Difficulty</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 shadow-sm hover:border-blue-400 transition-colors"
      >
        <span>{selected.label}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {difficultyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors ${
                value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DifficultyDropdown;