import React from 'react';

interface DeviationSummaryCardProps {
  deviations: {
    blunders: number;
    mistakes: number;
    minors: number;
    goods: number;
  };
  className?: string;
}

type Severity = 'blunder' | 'mistake' | 'minor' | 'good';

interface DeviationBadgeProps {
  severity: Severity;
  count: number;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; bg: string; text: string; ring: string }> = {
  blunder: { label: 'Blunders', bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/30' },
  mistake: { label: 'Mistakes', bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-500/30' },
  minor: { label: 'Minor', bg: 'bg-sky-500/20', text: 'text-sky-400', ring: 'ring-sky-500/30' },
  good: { label: 'Good', bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
};

function DeviationBadge({ severity, count }: DeviationBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 p-4 rounded-xl ${config.bg} ring-1 ${config.ring}`}>
      <span className={`text-3xl font-bold ${config.text}`}>{count}</span>
      <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}

export function DeviationSummaryCard({ deviations, className = '' }: DeviationSummaryCardProps) {
  const total = deviations.blunders + deviations.mistakes + deviations.minors + deviations.goods;

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-50">GTO Deviations</h3>
        <span className="text-sm text-gray-400">{total} decisions</span>
      </div>
      <div className="flex gap-3">
        <DeviationBadge severity="blunder" count={deviations.blunders} />
        <DeviationBadge severity="mistake" count={deviations.mistakes} />
        <DeviationBadge severity="minor" count={deviations.minors} />
        <DeviationBadge severity="good" count={deviations.goods} />
      </div>
    </div>
  );
}