import React from 'react';

export type PreflopScenario = 'open' | 'vs_raise' | 'vs_3bet' | 'vs_4bet';

const SCENARIOS: { value: PreflopScenario; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'vs_raise', label: 'vs Raise' },
  { value: 'vs_3bet', label: 'vs 3-Bet' },
  { value: 'vs_4bet', label: 'vs 4-Bet' },
];

interface ScenarioSelectorProps {
  selected: string;
  onChange: (scenario: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600">
        翻前场景
      </label>
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.value}
            onClick={() => onChange(scenario.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
              ${
                selected === scenario.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
              }
            `}
          >
            {scenario.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;