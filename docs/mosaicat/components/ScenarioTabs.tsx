import React from 'react';

const SCENARIOS = [
  { key: 'open_raise', label: 'Open Raise' },
  { key: 'vs_3bet', label: 'vs 3-Bet' },
  { key: 'vs_4bet', label: 'vs 4-Bet' },
] as const;

interface ScenarioTabsProps {
  selectedScenario: string;
  onChange: (scenario: string) => void;
}

export const ScenarioTabs: React.FC<ScenarioTabsProps> = ({ selectedScenario, onChange }) => {
  return (
    <div className="flex gap-1 bg-[#1a1a2e] p-1 rounded-lg">
      {SCENARIOS.map(({ key, label }) => {
        const isActive = selectedScenario === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all
              ${isActive
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#334155]/50'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ScenarioTabs;