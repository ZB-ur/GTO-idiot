import React from 'react';

export interface EVDecisionBrief {
  index: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  action: string;
  evDifference: number;
  quality: 'good' | 'minor_deviation' | 'major_deviation';
}

export interface HandSummaryCardProps {
  totalEVLoss: number;
  qualityScore: number;
  decisionCount: number;
  decisions: EVDecisionBrief[];
}

const qualityColors: Record<string, string> = {
  good: 'bg-emerald-500/20 text-emerald-400',
  minor_deviation: 'bg-amber-500/20 text-amber-400',
  major_deviation: 'bg-red-500/20 text-red-400',
};

const qualityDots: Record<string, string> = {
  good: 'bg-emerald-400',
  minor_deviation: 'bg-amber-400',
  major_deviation: 'bg-red-400',
};

const streetLabels: Record<string, string> = {
  preflop: 'PF',
  flop: 'F',
  turn: 'T',
  river: 'R',
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreRing = (score: number): string => {
  if (score >= 80) return 'border-emerald-500';
  if (score >= 50) return 'border-amber-500';
  return 'border-red-500';
};

const HandSummaryCard: React.FC<HandSummaryCardProps> = ({
  totalEVLoss,
  qualityScore,
  decisionCount,
  decisions,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
      {/* Header row: score + stats */}
      <div className="flex items-center gap-4">
        {/* Quality score circle */}
        <div className={`w-16 h-16 rounded-full border-[3px] ${getScoreRing(qualityScore)} flex items-center justify-center shrink-0`}>
          <span className={`text-xl font-bold tabular-nums ${getScoreColor(qualityScore)}`}>
            {qualityScore}
          </span>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-1">
          <div className="text-white text-sm font-semibold">决策质量评分</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">总 EV 损失</span>
              <span className="text-red-400 text-xs font-semibold tabular-nums">
                -{totalEVLoss.toFixed(2)} BB
              </span>
            </div>
            <div className="w-px h-3 bg-gray-600" />
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">决策数</span>
              <span className="text-white text-xs font-semibold tabular-nums">{decisionCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision timeline */}
      <div className="space-y-1.5">
        <div className="text-gray-400 text-xs font-medium">决策详情</div>
        <div className="space-y-1">
          {decisions.map((d) => (
            <div
              key={d.index}
              className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${qualityDots[d.quality]}`} />
              <span className="text-gray-400 text-xs font-medium w-6">{streetLabels[d.street]}</span>
              <span className="text-white text-xs flex-1 capitalize">{d.action}</span>
              <span
                className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded ${qualityColors[d.quality]}`}
              >
                {d.evDifference === 0 ? '0' : `-${d.evDifference.toFixed(2)}`} BB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HandSummaryCard;