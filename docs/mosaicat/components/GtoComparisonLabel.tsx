import React from 'react';

interface GtoComparisonLabelProps {
  userAction: string;
  deviation: 'match' | 'minor' | 'severe';
  explanation?: string;
}

const deviationStyles: Record<string, { border: string; bg: string; text: string; label: string }> = {
  match: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    label: 'GTO Match',
  },
  minor: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    label: 'Minor Deviation',
  },
  severe: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    label: 'Significant Deviation',
  },
};

export const GtoComparisonLabel: React.FC<GtoComparisonLabelProps> = ({
  userAction,
  deviation,
  explanation,
}) => {
  const style = deviationStyles[deviation];

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} rounded-r-xl px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-50">
          You chose: <span className="text-amber-400">{userAction}</span>
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
          {style.label}
        </span>
      </div>
      {explanation && (
        <p className="text-sm text-gray-400 mt-1">{explanation}</p>
      )}
    </div>
  );
};