import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface GTOAction {
  action: ActionType;
  frequency: number;
}

export interface GTOComparison {
  eventIndex: number;
  bettingRound?: string;
  userAction: { action: ActionType; amount?: number };
  gtoRecommendation: GTOAction[];
  isAligned: boolean;
  isApproximate: boolean;
  rangeMatrixHighlight?: { row: number; col: number; isSuited: boolean };
}

interface GTOPanelProps {
  comparison?: GTOComparison;
  isVisible: boolean;
  onExpandMatrix: () => void;
}

const ACTION_COLORS: Record<string, string> = {
  raise: 'bg-emerald-400',
  call: 'bg-sky-400',
  fold: 'bg-gray-500',
  bet: 'bg-emerald-400',
  check: 'bg-sky-400',
  all_in: 'bg-amber-400',
};

const ACTION_TEXT_COLORS: Record<string, string> = {
  raise: 'text-emerald-400',
  call: 'text-sky-400',
  fold: 'text-gray-400',
  bet: 'text-emerald-400',
  check: 'text-sky-400',
  all_in: 'text-amber-400',
};

const formatAction = (action: string): string =>
  action === 'all_in' ? 'All-In' : action.charAt(0).toUpperCase() + action.slice(1);

const ApproximateGTOLabel: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-orange-400/10 text-orange-400 border border-orange-400/30">
    ~ Approximate
  </span>
);

const GTOActionComparison: React.FC<{
  userAction: GTOComparison['userAction'];
  gtoRecommendation: GTOAction[];
  isAligned: boolean;
}> = ({ userAction, gtoRecommendation, isAligned }) => (
  <div className="space-y-4">
    {/* User's Action */}
    <div className="space-y-1.5">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Action</div>
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${ACTION_COLORS[userAction.action] || 'bg-gray-500'}`} />
        <span className={`text-base font-semibold ${ACTION_TEXT_COLORS[userAction.action] || 'text-gray-400'}`}>
          {formatAction(userAction.action)}
          {userAction.amount !== undefined && ` ${userAction.amount}`}
        </span>
        {isAligned ? (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
            GTO Aligned
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-orange-400/10 text-orange-400 border border-orange-400/30">
            Deviation
          </span>
        )}
      </div>
    </div>

    {/* GTO Recommendation */}
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">GTO Recommendation</div>
      <div className="space-y-1.5">
        {gtoRecommendation.map((rec) => (
          <div key={rec.action} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ACTION_COLORS[rec.action] || 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300 capitalize">{formatAction(rec.action)}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden mx-2">
              <div
                className={`h-full rounded-full ${ACTION_COLORS[rec.action] || 'bg-gray-500'}`}
                style={{ width: `${rec.frequency}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-50 min-w-[3rem] text-right">
              {rec.frequency}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MiniRangePreview: React.FC<{
  highlightRow?: number;
  highlightCol?: number;
  onExpand: () => void;
}> = ({ onExpand }) => (
  <button
    onClick={onExpand}
    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 hover:border-gray-600 transition-colors text-left"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Range Matrix</span>
      <span className="text-xs text-emerald-400">Expand →</span>
    </div>
    {/* Mini 5x5 preview grid */}
    <div className="grid grid-cols-5 gap-px">
      {[
        ['bg-emerald-400/80','bg-emerald-400/70','bg-emerald-400/60','bg-emerald-400/50','bg-emerald-400/40'],
        ['bg-emerald-400/60','bg-emerald-400/70','bg-sky-400/50','bg-sky-400/40','bg-sky-400/30'],
        ['bg-emerald-400/50','bg-sky-400/40','bg-emerald-400/60','bg-sky-400/30','bg-gray-500/30'],
        ['bg-emerald-400/40','bg-sky-400/30','bg-sky-400/25','bg-emerald-400/50','bg-gray-500/30'],
        ['bg-sky-400/30','bg-gray-500/30','bg-gray-500/25','bg-gray-500/25','bg-emerald-400/40'],
      ].map((row, ri) =>
        row.map((bg, ci) => (
          <div key={`${ri}-${ci}`} className={`w-full aspect-square rounded-sm ${bg}`} />
        ))
      )}
    </div>
  </button>
);

export const GTOPanel: React.FC<GTOPanelProps> = ({
  comparison,
  isVisible,
  onExpandMatrix,
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden w-80">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-50">GTO Analysis</h3>
        {comparison?.isApproximate && <ApproximateGTOLabel />}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {comparison ? (
          <>
            {/* Betting round badge */}
            {comparison.bettingRound && (
              <div className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                {comparison.bettingRound}
              </div>
            )}

            <GTOActionComparison
              userAction={comparison.userAction}
              gtoRecommendation={comparison.gtoRecommendation}
              isAligned={comparison.isAligned}
            />

            {/* Mini Range Matrix */}
            {comparison.rangeMatrixHighlight && (
              <MiniRangePreview
                highlightRow={comparison.rangeMatrixHighlight.row}
                highlightCol={comparison.rangeMatrixHighlight.col}
                onExpand={onExpandMatrix}
              />
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-gray-500 text-sm">Navigate to a decision point to see GTO analysis</div>
          </div>
        )}
      </div>
    </div>
  );
};