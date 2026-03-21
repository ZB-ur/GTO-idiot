import React from 'react';

export interface ActionSummary {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';
  amount?: number;
}

export interface MixedStrategyAction {
  action: ActionSummary;
  frequency: number;
}

export interface GTORecommendation {
  primaryAction: ActionSummary;
  mixedStrategy: MixedStrategyAction[];
  ev?: number;
}

export interface ConfidenceInfo {
  level: 'high' | 'medium' | 'low';
  warning?: string | null;
}

export interface DecisionComparisonProps {
  playerAction: ActionSummary;
  gtoRecommendation: GTORecommendation;
  quality: 'good' | 'minor_deviation' | 'major_deviation';
  qualityColor: string;
  evDifference: number;
  confidence?: ConfidenceInfo;
}

const qualityLabels: Record<string, string> = {
  good: '符合 GTO',
  minor_deviation: '轻微偏差',
  major_deviation: '重大偏差',
};

const qualityStyles: Record<string, string> = {
  good: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  minor_deviation: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  major_deviation: 'bg-red-500/15 border-red-500/30 text-red-400',
};

const qualityBadgeStyles: Record<string, string> = {
  good: 'bg-emerald-500/20 text-emerald-400',
  minor_deviation: 'bg-amber-500/20 text-amber-400',
  major_deviation: 'bg-red-500/20 text-red-400',
};

const confidenceStyles: Record<string, string> = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
};

const formatAction = (a: ActionSummary): string => {
  const label = a.action.charAt(0).toUpperCase() + a.action.slice(1);
  return a.amount !== undefined ? `${label} ${a.amount.toFixed(1)} BB` : label;
};

const DecisionComparison: React.FC<DecisionComparisonProps> = ({
  playerAction,
  gtoRecommendation,
  quality,
  qualityColor,
  evDifference,
  confidence,
}) => {
  return (
    <div className={`rounded-xl border p-4 space-y-4 ${qualityStyles[quality]}`}>
      {/* Quality badge + EV loss */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${qualityBadgeStyles[quality]}`}>
          {qualityLabels[quality]}
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color: qualityColor }}>
          {evDifference === 0 ? 'EV: 0 BB' : `EV: -${evDifference.toFixed(2)} BB`}
        </span>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player action */}
        <div className="bg-black/20 rounded-lg p-3 space-y-1.5">
          <div className="text-gray-400 text-xs font-medium uppercase">你的选择</div>
          <div className="text-white text-sm font-semibold">{formatAction(playerAction)}</div>
        </div>

        {/* GTO recommendation */}
        <div className="bg-black/20 rounded-lg p-3 space-y-1.5">
          <div className="text-gray-400 text-xs font-medium uppercase">GTO 推荐</div>
          <div className="text-white text-sm font-semibold">{formatAction(gtoRecommendation.primaryAction)}</div>
          {gtoRecommendation.ev !== undefined && (
            <div className="text-gray-500 text-xs tabular-nums">EV: {gtoRecommendation.ev.toFixed(2)} BB</div>
          )}
        </div>
      </div>

      {/* Mixed strategy breakdown */}
      {gtoRecommendation.mixedStrategy.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-gray-400 text-xs font-medium">混合策略</div>
          <div className="flex items-center gap-1 h-4 w-full rounded-full overflow-hidden">
            {gtoRecommendation.mixedStrategy.map((ms, i) => {
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500'];
              return (
                <div
                  key={i}
                  className={`h-full ${colors[i % colors.length]}`}
                  style={{ width: `${ms.frequency * 100}%` }}
                  title={`${formatAction(ms.action)}: ${(ms.frequency * 100).toFixed(0)}%`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {gtoRecommendation.mixedStrategy.map((ms, i) => {
              const colors = ['text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-red-400'];
              const dotColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500'];
              return (
                <div key={i} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                  <span className={`text-xs ${colors[i % colors.length]}`}>
                    {formatAction(ms.action)} {(ms.frequency * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confidence warning */}
      {confidence && confidence.level !== 'high' && confidence.warning && (
        <div className="flex items-start gap-2 bg-black/20 rounded-lg p-2.5">
          <svg className={`w-4 h-4 shrink-0 mt-0.5 ${confidenceStyles[confidence.level]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-gray-400 text-xs">{confidence.warning}</span>
        </div>
      )}
    </div>
  );
};

export default DecisionComparison;