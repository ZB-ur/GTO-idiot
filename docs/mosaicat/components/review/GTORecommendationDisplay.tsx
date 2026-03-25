import React from 'react';

export interface GTORecommendation {
  type: string;
  frequency: number;
  amount?: number;
}

export interface GTORecommendationDisplayProps {
  recommendations: GTORecommendation[];
}

const ACTION_STYLES: Record<string, { bg: string; bar: string; label: string }> = {
  raise: {
    bg: 'bg-red-50',
    bar: 'bg-red-500',
    label: 'text-red-700',
  },
  call: {
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-500',
    label: 'text-emerald-700',
  },
  check: {
    bg: 'bg-sky-50',
    bar: 'bg-sky-500',
    label: 'text-sky-700',
  },
  fold: {
    bg: 'bg-gray-50',
    bar: 'bg-gray-400',
    label: 'text-gray-600',
  },
};

function getStyle(type: string) {
  return ACTION_STYLES[type.toLowerCase()] ?? ACTION_STYLES.fold;
}

function formatLabel(rec: GTORecommendation): string {
  const base = rec.type.charAt(0).toUpperCase() + rec.type.slice(1);
  if (rec.amount != null) {
    return `${base} ${rec.amount}`;
  }
  return base;
}

export const GTORecommendationDisplay: React.FC<GTORecommendationDisplayProps> = ({
  recommendations,
}) => {
  const sorted = [...recommendations].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white text-xs font-bold">
          G
        </span>
        GTO Recommendation
      </h4>

      <div className="space-y-2">
        {sorted.map((rec, idx) => {
          const style = getStyle(rec.type);
          return (
            <div key={idx} className={`rounded-lg px-3 py-2.5 ${style.bg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-semibold ${style.label}`}>
                  {formatLabel(rec)}
                </span>
                <span className={`text-sm font-bold tabular-nums ${style.label}`}>
                  {rec.frequency.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.min(rec.frequency, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 italic">No GTO data available</p>
      )}
    </div>
  );
};

export default GTORecommendationDisplay;