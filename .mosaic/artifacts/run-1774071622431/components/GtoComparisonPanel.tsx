import React from 'react';

interface GtoAction {
  action: string;
  frequency: number;
  amount?: number;
  ev?: number;
}

interface GtoStrategy {
  actions: GtoAction[];
  precision: string;
  isApproximate?: boolean;
}

interface PlayerAction {
  action: string;
  amount?: number;
}

interface GtoComparisonPanelProps {
  playerAction: PlayerAction;
  gtoStrategy: GtoStrategy;
  deviation: 'match' | 'minor_deviation' | 'major_deviation';
  evLoss: number;
}

const deviationStyles = {
  match: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', label: 'Match', text: 'text-emerald-700' },
  minor_deviation: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-400', label: 'Minor Deviation', text: 'text-amber-700' },
  major_deviation: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', label: 'Major Deviation', text: 'text-red-700' },
};

const actionColors: Record<string, string> = {
  fold: 'bg-gray-400',
  check: 'bg-blue-500',
  call: 'bg-green-500',
  bet: 'bg-amber-500',
  raise: 'bg-amber-500',
  'all-in': 'bg-red-500',
};

export const GtoComparisonPanel: React.FC<GtoComparisonPanelProps> = ({
  playerAction,
  gtoStrategy,
  deviation,
  evLoss,
}) => {
  const dStyle = deviationStyles[deviation];

  return (
    <div className={`${dStyle.bg} border ${dStyle.border} rounded-xl p-5 space-y-4`}>
      {/* Header: deviation badge + EV loss */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${dStyle.badge}`}>
          {dStyle.label}
        </span>
        {evLoss > 0 && (
          <span className="text-sm font-mono text-red-500 font-semibold">
            -{evLoss.toFixed(2)} BB EV
          </span>
        )}
      </div>

      {/* Player's action */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Action</div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 text-sm font-semibold text-white rounded-lg capitalize ${
            actionColors[playerAction.action] ?? 'bg-gray-500'
          }`}>
            {playerAction.action}
            {playerAction.amount ? ` ${playerAction.amount}` : ''}
          </span>
        </div>
      </div>

      {/* GTO strategy frequency bars */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">GTO Strategy</div>
        <div className="space-y-2">
          {gtoStrategy.actions.map((ga, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 capitalize">
                  {ga.action}{ga.amount ? ` ${ga.amount}` : ''}
                </span>
                <div className="flex items-center gap-2">
                  {ga.ev !== undefined && (
                    <span className="text-xs text-gray-400 font-mono">EV: {ga.ev > 0 ? '+' : ''}{ga.ev.toFixed(2)}</span>
                  )}
                  <span className="text-xs font-semibold text-gray-600">{(ga.frequency * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${actionColors[ga.action] ?? 'bg-gray-400'}`}
                  style={{ width: `${ga.frequency * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precision disclaimer */}
      {gtoStrategy.isApproximate && (
        <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg border border-gray-200">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-500">
            Simplified calculation ({gtoStrategy.precision}) — for reference only
          </span>
        </div>
      )}
    </div>
  );
};

export default GtoComparisonPanel;