'use client';

import type { ActionType, Street } from '@/engine/types';
import GTOActionComparison from './GTOActionComparison';
import GTOFrequencyBar from './GTOFrequencyBar';

type DecisionQuality = 'optimal' | 'good' | 'minor_mistake' | 'major_mistake';

interface GTORecommendation {
  action: ActionType;
  frequency: number;
  betSize?: string;
  betAmount?: number;
  ev?: number;
}

interface DecisionPointAnalysis {
  frameIndex: number;
  street: Street;
  userAction: { action: ActionType; amount?: number };
  gtoRecommendations: GTORecommendation[];
  quality: DecisionQuality;
  evDifference?: number;
}

interface GTOPanelProps {
  decisionPoint: DecisionPointAnalysis | null;
  loading?: boolean;
}

export default function GTOPanel({ decisionPoint, loading = false }: GTOPanelProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Analyzing decision...</span>
        </div>
      </div>
    );
  }

  if (!decisionPoint) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <p className="text-gray-500 text-sm">
          Select a decision point to see GTO analysis
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-200 text-sm font-semibold">GTO Analysis</h3>
        <span className="text-gray-400 text-xs capitalize bg-gray-700 px-2 py-0.5 rounded">
          {decisionPoint.street}
        </span>
      </div>

      {/* Action comparison */}
      <GTOActionComparison
        userAction={decisionPoint.userAction}
        gtoRecommendations={decisionPoint.gtoRecommendations}
        quality={decisionPoint.quality}
      />

      {/* Frequency bar */}
      <div>
        <h4 className="text-gray-400 text-xs font-medium mb-2">GTO Frequencies</h4>
        <GTOFrequencyBar
          recommendations={decisionPoint.gtoRecommendations}
          highlightedAction={decisionPoint.userAction.action}
        />
      </div>

      {/* EV difference */}
      {decisionPoint.evDifference != null && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-700">
          <span className="text-gray-400 text-xs">EV Difference:</span>
          <span
            className={`text-sm font-mono font-bold ${
              decisionPoint.evDifference >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {decisionPoint.evDifference >= 0 ? '+' : ''}
            {decisionPoint.evDifference.toFixed(2)} BB
          </span>
        </div>
      )}
    </div>
  );
}