import React, { useState, useRef, useEffect } from 'react';

export type GTOScenario =
  | 'open_raise_rfi'
  | 'facing_open_ep'
  | 'facing_open_mp'
  | 'facing_open_co'
  | 'facing_open_btn'
  | 'facing_3bet'
  | 'facing_4bet'
  | 'sb_vs_bb'
  | 'bb_vs_sb';

export interface ScenarioDropdownProps {
  scenarios: Array<{ id: GTOScenario; label: string }>;
  selected: GTOScenario;
  onChange: (scenario: GTOScenario) => void;
}

export function ScenarioDropdown({
  scenarios,
  selected,
  onChange,
}: ScenarioDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedScenario = scenarios.find((s) => s.id === selected);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-64">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5
          bg-gray-800 border rounded-xl text-sm font-medium
          transition-all
          ${isOpen
            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 text-gray-50'
            : 'border-gray-700 text-gray-50 hover:border-gray-600'
          }
        `}
      >
        <span className="truncate">{selectedScenario?.label ?? 'Select scenario'}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-black/30 py-1 max-h-64 overflow-y-auto">
          {scenarios.map((scenario) => {
            const isSelected = scenario.id === selected;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  onChange(scenario.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors
                  ${isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-50'
                  }
                `}
              >
                {isSelected && (
                  <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                <span className={isSelected ? '' : 'ml-6'}>{scenario.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}