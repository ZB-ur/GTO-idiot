import React from 'react';

export interface StrategyExplanationProps {
  explanation: string;
  street: 'preflop' | 'flop' | 'turn' | 'river';
}

const STREET_ICONS: Record<string, string> = {
  preflop: '🃏',
  flop: '🂠',
  turn: '🂡',
  river: '🂢',
};

const STREET_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const STREET_COLORS: Record<string, string> = {
  preflop: 'border-blue-500/30 bg-blue-500/5',
  flop: 'border-emerald-500/30 bg-emerald-500/5',
  turn: 'border-amber-500/30 bg-amber-500/5',
  river: 'border-purple-500/30 bg-purple-500/5',
};

const STREET_TAG_COLORS: Record<string, string> = {
  preflop: 'bg-blue-500/20 text-blue-400',
  flop: 'bg-emerald-500/20 text-emerald-400',
  turn: 'bg-amber-500/20 text-amber-400',
  river: 'bg-purple-500/20 text-purple-400',
};

const StrategyExplanation: React.FC<StrategyExplanationProps> = ({ explanation, street }) => {
  return (
    <div className={`rounded-xl border p-4 ${STREET_COLORS[street]}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-gray-300 text-sm font-semibold">GTO 策略分析</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STREET_TAG_COLORS[street]}`}>
          {STREET_LABELS[street]}
        </span>
      </div>

      {/* Explanation text */}
      <p className="text-gray-300 text-sm leading-relaxed">{explanation}</p>
    </div>
  );
};

export default StrategyExplanation;