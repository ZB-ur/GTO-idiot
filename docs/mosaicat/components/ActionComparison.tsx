import React from 'react';
import { FrequencyBar } from './FrequencyBar';

interface GTOAction {
  action: string;
  frequency: number;
  ev: number;
  betSize?: string;
}

interface HeroAction {
  action: string;
  amount?: number;
}

interface ActionComparisonProps {
  heroAction: HeroAction;
  gtoAdvice: GTOAction[];
  severity: 'minor' | 'moderate' | 'severe';
}

const severityConfig = {
  minor: {
    border: 'border-green-400/40',
    bg: 'bg-green-400/10',
    text: 'text-green-400',
    dotBg: 'bg-green-400',
    label: '轻微偏差',
  },
  moderate: {
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-400/10',
    text: 'text-yellow-400',
    dotBg: 'bg-yellow-400',
    label: '中等偏差',
  },
  severe: {
    border: 'border-red-400/40',
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    dotBg: 'bg-red-400',
    label: '严重偏差',
  },
};

const actionLabels: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-in',
};

const actionColors: Record<string, string> = {
  fold: 'bg-blue-500',
  check: 'bg-green-500',
  call: 'bg-emerald-500',
  raise: 'bg-red-500',
  all_in: 'bg-yellow-500',
};

export const ActionComparison: React.FC<ActionComparisonProps> = ({
  heroAction,
  gtoAdvice,
  severity,
}) => {
  const config = severityConfig[severity];
  const heroActionLabel = actionLabels[heroAction.action] || heroAction.action;
  const heroGtoMatch = gtoAdvice.find((a) => a.action === heroAction.action);
  const heroFrequency = heroGtoMatch ? heroGtoMatch.frequency : 0;
  const recommendedAction = [...gtoAdvice].sort((a, b) => b.frequency - a.frequency)[0];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 space-y-4`}>
      {/* Header: severity indicator */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-50 uppercase tracking-wider">
          行动对比
        </h4>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${config.border} ${config.bg} ${config.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
          {config.label}
        </span>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hero action */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            你的行动
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-3 h-3 rounded-sm ${actionColors[heroAction.action] || 'bg-gray-500'}`}
              />
              <span className="text-lg font-bold text-gray-50">{heroActionLabel}</span>
            </div>
            {heroAction.amount !== undefined && (
              <span className="text-sm text-gray-400 mt-0.5 block">
                {heroAction.amount} BB
              </span>
            )}
            <div className="mt-2 text-xs text-gray-500">
              GTO频率:{' '}
              <span className={`font-medium ${heroFrequency < 0.1 ? 'text-red-400' : 'text-gray-300'}`}>
                {(heroFrequency * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* GTO recommended */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            GTO建议
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            {recommendedAction && (
              <>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-sm ${actionColors[recommendedAction.action] || 'bg-gray-500'}`}
                  />
                  <span className="text-lg font-bold text-emerald-400">
                    {actionLabels[recommendedAction.action] || recommendedAction.action}
                  </span>
                </div>
                {recommendedAction.betSize && (
                  <span className="text-sm text-gray-400 mt-0.5 block">
                    {recommendedAction.betSize}
                  </span>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  频率:{' '}
                  <span className="font-medium text-emerald-400">
                    {(recommendedAction.frequency * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* GTO frequency distribution */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">GTO频率分布</div>
        <FrequencyBar
          actions={gtoAdvice.map((a) => ({
            action: a.action,
            frequency: a.frequency,
            ev: a.ev,
            betSize: a.betSize,
          }))}
          highlightAction={heroAction.action}
          showEV
        />
      </div>
    </div>
  );
};

export default ActionComparison;
