/**
 * ScenarioSelector — toggle group for preflop scenario selection.
 */

import React from 'react';
import type { PreflopScenario } from '../../types/gto';

interface ScenarioSelectorProps {
  selected: PreflopScenario;
  onChange: (scenario: PreflopScenario) => void;
  className?: string;
}

const SCENARIOS: { value: PreflopScenario; label: string }[] = [
  { value: 'open', label: 'Open Raise' },
  { value: 'vs_raise', label: 'vs Raise' },
  { value: 'vs_3bet', label: 'vs 3-Bet' },
  { value: 'vs_4bet', label: 'vs 4-Bet' },
];

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selected,
  onChange,
  className = '',
}) => (
  <div className={`flex flex-wrap gap-1.5 ${className}`} role="radiogroup" aria-label="Scenario">
    {SCENARIOS.map(({ value, label }) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={selected === value}
        onClick={() => onChange(value)}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
          ${
            selected === value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ScenarioSelector;
