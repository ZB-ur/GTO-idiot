import React from 'react';

// --- Child component imports (assumed) ---
import { EVDifferenceBadge } from './EVDifferenceBadge';
import { GTOScoreGauge } from './GTOScoreGauge';

// --- Types ---
export interface HandGTOSummary {
  handId: string;
  totalEvDifference: number;
  gtoDeviationScore: number;
  decisionCount: number;
  heroDecisionCount: number;
  worstDecision?: {
    decisionIndex: number;
    evDifference: number;
    description: string;
  };
  verdict: string;
}

export interface HandSummaryCardProps {
  summary: HandGTOSummary;
  onJumpToDecision: (index: number) => void;
}

function getVerdictStyle(score: number) {
  if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '🎯' };
  if (score >= 60) return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', icon: '👍' };
  if (score >= 40) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⚠️' };
  return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '❌' };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

export const HandSummaryCard: React.FC<HandSummaryCardProps> = ({ summary, onJumpToDecision }) => {
  const verdictStyle = getVerdictStyle(summary.gtoDeviationScore);
  const evPositive = summary.totalEvDifference >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Hand Summary</h3>
          <span className="text-sm text-gray-500">
            {summary.heroDecisionCount} / {summary.decisionCount} decisions
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-5 grid grid-cols-2 gap-5">
        {/* Net EV */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Net EV</span>
          <EVDifferenceBadge evDifference={summary.totalEvDifference} size="lg" />
        </div>

        {/* GTO Score */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">GTO Score</span>
          <GTOScoreGauge score={summary.gtoDeviationScore} size="sm" />
        </div>
      </div>

      {/* Worst Decision */}
      {summary.worstDecision && (
        <div className="mx-6 mb-5">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-red-400">Worst Decision</span>
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                      summary.worstDecision.evDifference >= 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {summary.worstDecision.evDifference >= 0 ? '+' : ''}
                    {summary.worstDecision.evDifference.toFixed(1)} BB
                  </span>
                </div>
                <p className="text-sm text-red-700 leading-snug">{summary.worstDecision.description}</p>
              </div>
              <button
                onClick={() => onJumpToDecision(summary.worstDecision!.decisionIndex)}
                className="flex-shrink-0 text-xs font-medium text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                Jump →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verdict */}
      <div className={`mx-6 mb-6 ${verdictStyle.bg} border ${verdictStyle.border} rounded-lg p-4`}>
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">{verdictStyle.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${verdictStyle.text}`}>
                {getScoreLabel(summary.gtoDeviationScore)}
              </span>
            </div>
            <p className={`text-sm ${verdictStyle.text} leading-relaxed opacity-90`}>{summary.verdict}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandSummaryCard;