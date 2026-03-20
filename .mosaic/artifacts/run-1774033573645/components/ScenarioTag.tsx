import React from 'react';

interface ScenarioTagProps {
  tag: string;
  className?: string;
}

const tagColorMap: Record<string, string> = {
  '3bet_pot': 'bg-purple-50 text-purple-700 border-purple-200',
  'river_bluff': 'bg-red-50 text-red-700 border-red-200',
  'cbet': 'bg-blue-50 text-blue-700 border-blue-200',
  'check_raise': 'bg-amber-50 text-amber-700 border-amber-200',
  'open_raise': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'squeeze': 'bg-orange-50 text-orange-700 border-orange-200',
  'donk_bet': 'bg-pink-50 text-pink-700 border-pink-200',
  'probe_bet': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'fold_to_3bet': 'bg-gray-50 text-gray-700 border-gray-200',
};

const defaultColor = 'bg-slate-50 text-slate-700 border-slate-200';

function formatTagLabel(tag: string): string {
  return tag
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/3bet/i, '3-Bet')
    .replace(/Cbet/i, 'C-Bet');
}

export const ScenarioTag: React.FC<ScenarioTagProps> = ({ tag, className = '' }) => {
  const colorClasses = tagColorMap[tag] ?? defaultColor;

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        text-xs font-medium
        rounded-lg border
        ${colorClasses}
        ${className}
      `}
    >
      {formatTagLabel(tag)}
    </span>
  );
};

export default ScenarioTag;