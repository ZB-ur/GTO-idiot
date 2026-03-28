'use client';

import type { ActionType } from '@/engine/types';

type DecisionQuality = 'optimal' | 'good' | 'minor_mistake' | 'major_mistake';

interface GTORecommendation {
  action: ActionType;
  frequency: number;
  betSize?: string;
  betAmount?: number;
  ev?: number;
}

interface GTOActionComparisonProps {
  userAction: { action: ActionType; amount?: number };
  gtoRecommendations: GTORecommendation[];
  quality: DecisionQuality;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All In',
};

const QUALITY_CONFIG: Record<DecisionQuality, { label: string; color: string; bg: string }> = {
  optimal: { label: 'Optimal', color: 'text-green-400', bg: 'bg-green-500/20' },
  good: { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  minor_mistake: { label: 'Minor Mistake', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  major_mistake: { label: 'Major Mistake', color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function GTOActionComparison({
  userAction,
  gtoRecommendations,
  quality,
}: GTOActionComparisonProps) {
  const config = QUALITY_CONFIG[quality];
  const topRec = gtoRecommendations.reduce((a, b) => (a.frequency > b.frequency ? a : b), gtoRecommendations[0]);
  const userRec = gtoRecommendations.find((r) => r.action === userAction.action);
  const userFreq = userRec?.frequency ?? 0;
  const evDiff = topRec.ev != null && userRec?.ev != null ? userRec.ev - topRec.ev : null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      {/* Quality badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        {evDiff !== null && (
          <span className={`text-xs font-mono font-bold ${evDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {evDiff >= 0 ? '+' : ''}{evDiff.toFixed(2)} BB EV
          </span>
        )}
      </div>

      {/* Comparison row */}
      <div className="grid grid-cols-2 gap-3">
        {/* User action */}
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Your Action</div>
          <div className="text-white font-bold text-sm">
            {ACTION_LABELS[userAction.action]}
            {userAction.amount != null && (
              <span className="text-yellow-400 ml-1">{userAction.amount}</span>
            )}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            GTO freq: {(userFreq * 100).toFixed(0)}%
          </div>
        </div>

        {/* GTO recommended */}
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">GTO Optimal</div>
          <div className="text-white font-bold text-sm">
            {ACTION_LABELS[topRec.action]}
            {topRec.betSize && (
              <span className="text-blue-400 ml-1 text-xs">{topRec.betSize}</span>
            )}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Freq: {(topRec.frequency * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}