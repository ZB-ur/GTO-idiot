import React from 'react';

export interface ReplayAction {
  playerId: string;
  playerName?: string;
  position?: string;
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  isPlayerAction: boolean;
  gtoAnalysis?: {
    deviation: 'match' | 'minor' | 'major';
    actualActionFrequency?: number;
    recommendedActions: Array<{ action: string; frequency: number; sizing?: string }>;
    explanation?: string;
    scenario?: string;
  };
}

interface ActionTimelineProps {
  actions: Array<ReplayAction>;
  onActionClick?: (index: number) => void;
}

const deviationColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  match: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  minor: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-400' },
  major: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-500' },
};

const actionLabels: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

const ActionTimeline: React.FC<ActionTimelineProps> = ({ actions, onActionClick }) => {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

      <div className="space-y-3">
        {actions.map((action, index) => {
          const deviation = action.gtoAnalysis?.deviation;
          const colors = deviation ? deviationColors[deviation] : null;
          const isPlayer = action.isPlayerAction;

          return (
            <div
              key={index}
              className={`relative flex items-start gap-3 cursor-pointer group`}
              onClick={() => onActionClick?.(index)}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 top-2.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  colors ? colors.dot : isPlayer ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />

              {/* Action card */}
              <div
                className={`flex-1 rounded-lg border p-3 transition-shadow group-hover:shadow-md ${
                  isPlayer && colors
                    ? `${colors.bg} ${colors.border}`
                    : isPlayer
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 w-8">
                      {action.position || '—'}
                    </span>
                    <span className={`text-sm font-semibold ${isPlayer ? 'text-gray-900' : 'text-gray-600'}`}>
                      {action.playerName || action.playerId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        action.action === 'fold'
                          ? 'text-gray-400'
                          : action.action === 'raise' || action.action === 'all_in'
                          ? 'text-red-600'
                          : action.action === 'call'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {actionLabels[action.action] || action.action}
                    </span>
                    {action.amount != null && (
                      <span className="text-sm font-mono text-gray-500">${action.amount}</span>
                    )}
                  </div>
                </div>

                {/* GTO Analysis */}
                {isPlayer && action.gtoAnalysis && (
                  <div className="mt-2 pt-2 border-t border-gray-200/60">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          colors ? `${colors.bg} ${colors.text}` : ''
                        }`}
                      >
                        {deviation === 'match' ? '✓ GTO Match' : deviation === 'minor' ? '~ Minor Deviation' : '✗ Major Deviation'}
                      </span>
                      {action.gtoAnalysis.actualActionFrequency != null && (
                        <span className="text-xs text-gray-400">
                          {(action.gtoAnalysis.actualActionFrequency * 100).toFixed(0)}% freq
                        </span>
                      )}
                    </div>
                    {/* Recommended distribution */}
                    <div className="flex gap-1 mt-1.5">
                      {action.gtoAnalysis.recommendedActions.map((rec, i) => (
                        <div key={i} className="flex-1 text-center">
                          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deviation === 'match' ? 'bg-emerald-400' : deviation === 'minor' ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${rec.frequency * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 mt-0.5 block">{rec.action}</span>
                        </div>
                      ))}
                    </div>
                    {action.gtoAnalysis.explanation && (
                      <p className="text-xs text-gray-500 mt-1.5">{action.gtoAnalysis.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionTimeline;