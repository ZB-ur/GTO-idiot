import React from 'react';

export type DeviationSeverity = 'none' | 'minor' | 'major';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface DrilldownHand {
  handId: string;
  handNumber: number;
  position: Position;
  playerAction: ActionType;
  gtoRecommendation: ActionType;
  deviationSeverity: DeviationSeverity;
  evLoss: number;
  createdAt: string;
}

interface DrilldownPanelProps {
  scenario: string;
  hands: DrilldownHand[];
  total: number;
  isLoading?: boolean;
  onHandClick: (handId: string) => void;
  onClose: () => void;
}

const scenarioLabels: Record<string, string> = {
  open_raise: 'Open Raise',
  '3bet': '3-Bet',
  cbet: 'C-Bet',
  check_raise: 'Check-Raise',
  river_bluff: 'River Bluff',
  fold_to_3bet: 'Fold to 3-Bet',
  fold_to_cbet: 'Fold to C-Bet',
  donk_bet: 'Donk Bet',
  probe_bet: 'Probe Bet',
};

const actionLabels: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

const severityConfig: Record<DeviationSeverity, { bg: string; text: string; dot: string; label: string }> = {
  none: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Optimal' },
  minor: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Minor' },
  major: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Major' },
};

export const DrilldownPanel: React.FC<DrilldownPanelProps> = ({
  scenario,
  hands,
  total,
  isLoading = false,
  onHandClick,
  onClose,
}) => {
  const label = scenarioLabels[scenario] ?? scenario;

  const summaryStats = React.useMemo(() => {
    if (hands.length === 0) return { majorCount: 0, minorCount: 0, totalEvLoss: 0 };
    return {
      majorCount: hands.filter((h) => h.deviationSeverity === 'major').length,
      minorCount: hands.filter((h) => h.deviationSeverity === 'minor').length,
      totalEvLoss: hands.reduce((sum, h) => sum + h.evLoss, 0),
    };
  }, [hands]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">
              {total} hand{total !== 1 ? 's' : ''} in this scenario
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-slate-50 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Major</p>
          <p className="text-lg font-semibold text-red-500">{summaryStats.majorCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Minor</p>
          <p className="text-lg font-semibold text-amber-500">{summaryStats.minorCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total EV Loss</p>
          <p className="text-lg font-semibold text-gray-900">
            {summaryStats.totalEvLoss > 0 ? '-' : ''}
            {summaryStats.totalEvLoss.toFixed(1)} BB
          </p>
        </div>
      </div>

      {/* Hand List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading hands...</span>
          </div>
        ) : hands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No hands found for this scenario</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {hands.map((hand) => {
              const sev = severityConfig[hand.deviationSeverity];
              return (
                <li
                  key={hand.handId}
                  onClick={() => onHandClick(hand.handId)}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {/* Hand # and position */}
                  <div className="flex-shrink-0 w-16">
                    <p className="text-sm font-medium text-gray-900">#{hand.handNumber}</p>
                    <p className="text-xs text-gray-500">{hand.position}</p>
                  </div>

                  {/* Actions comparison */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-700 font-medium">{actionLabels[hand.playerAction]}</span>
                      {hand.deviationSeverity !== 'none' && (
                        <>
                          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-gray-500">{actionLabels[hand.gtoRecommendation]}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Deviation Badge */}
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${sev.bg} ${sev.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                      {sev.label}
                    </span>
                  </div>

                  {/* EV Loss */}
                  <div className="flex-shrink-0 w-20 text-right">
                    <span className={`text-sm font-medium ${hand.evLoss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {hand.evLoss > 0 ? `-${hand.evLoss.toFixed(1)}` : '0.0'} BB
                    </span>
                  </div>

                  {/* Chevron */}
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {hands.length > 0 && hands.length < total && (
        <div className="px-6 py-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {hands.length} of {total} hands
          </p>
        </div>
      )}
    </div>
  );
};

export default DrilldownPanel;