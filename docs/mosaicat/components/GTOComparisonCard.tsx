import React, { useState } from 'react';
import { DeviationBadge } from './DeviationBadge';

interface GTOAction {
  action: string;
  frequency: number;
  sizing?: string;
}

interface GTOComparisonCardProps {
  actualAction: string;
  actualAmount?: number;
  gtoActions: GTOAction[];
  deviation: 'match' | 'minor' | 'major';
  explanation: string;
  scenario?: string;
}

const deviationBorder: Record<string, string> = {
  match: 'border-emerald-200 bg-emerald-50/50',
  minor: 'border-amber-200 bg-amber-50/50',
  major: 'border-red-200 bg-red-50/50',
};

export const GTOComparisonCard: React.FC<GTOComparisonCardProps> = ({
  actualAction,
  actualAmount,
  gtoActions,
  deviation,
  explanation,
  scenario,
}) => {
  const [expanded, setExpanded] = useState(false);
  const border = deviationBorder[deviation];
  const maxFreq = Math.max(...gtoActions.map((a) => a.frequency));

  return (
    <div className={`border rounded-xl overflow-hidden ${border}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <DeviationBadge deviation={deviation} />
          <div>
            <span className="text-sm font-semibold text-gray-900">
              You: {actualAction.toUpperCase()}
              {actualAmount !== undefined && ` $${actualAmount}`}
            </span>
            {scenario && (
              <span className="text-xs text-gray-400 ml-2">{scenario}</span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 mt-3">{explanation}</p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">GTO Distribution</p>
            {gtoActions.map((a) => {
              const pct = Math.round(a.frequency * 100);
              const barWidth = (a.frequency / maxFreq) * 100;
              return (
                <div key={a.action} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 w-20 truncate">
                    {a.action}
                    {a.sizing && ` (${a.sizing})`}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-blue-500 rounded-md transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-bold text-gray-600">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};