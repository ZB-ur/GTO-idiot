import React from 'react';

// --- Types ---

export type DeviationSeverity = 'none' | 'minor' | 'major';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface KeyDeviation {
  decisionIndex: number;
  street: Street;
  severity: DeviationSeverity;
  evLoss: number;
  description?: string;
}

export interface PerStreetEVLoss {
  preflop?: number;
  flop?: number;
  turn?: number;
  river?: number;
}

export interface HandEVSummary {
  totalEVLoss: number;
  decisionCount: number;
  keyDeviations: KeyDeviation[];
  perStreetEVLoss?: PerStreetEVLoss;
}

// --- Sub-component: DeviationBadge ---

interface DeviationBadgeProps {
  severity: DeviationSeverity;
}

const DeviationBadge: React.FC<DeviationBadgeProps> = ({ severity }) => {
  const config: Record<DeviationSeverity, { label: string; bg: string; text: string; dot: string }> = {
    none: { label: 'OK', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    minor: { label: 'Minor', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    major: { label: 'Major', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const c = config[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// --- Props ---

export interface HandSummaryFooterProps {
  evSummary: HandEVSummary;
  onJumpToDecision: (index: number) => void;
}

// --- Helpers ---

const streetLabel: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const formatEV = (val: number): string => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)} BB`;
};

// --- Component ---

const HandSummaryFooter: React.FC<HandSummaryFooterProps> = ({ evSummary, onJumpToDecision }) => {
  const { totalEVLoss, decisionCount, keyDeviations, perStreetEVLoss } = evSummary;

  const hasDeviations = keyDeviations.length > 0;
  const majorCount = keyDeviations.filter((d) => d.severity === 'major').length;
  const minorCount = keyDeviations.filter((d) => d.severity === 'minor').length;

  // Overall verdict
  const verdictColor =
    totalEVLoss === 0 ? 'text-emerald-600' : totalEVLoss <= 2 ? 'text-amber-600' : 'text-red-600';
  const verdictBg =
    totalEVLoss === 0
      ? 'bg-emerald-50 border-emerald-200'
      : totalEVLoss <= 2
        ? 'bg-amber-50 border-amber-200'
        : 'bg-red-50 border-red-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header row */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${verdictBg}`}>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${verdictColor}`}>
            {totalEVLoss === 0 ? '0.00' : `-${totalEVLoss.toFixed(2)}`} BB
          </div>
          <span className="text-sm text-gray-500">Total EV Loss</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{decisionCount} decisions</span>
          {majorCount > 0 && (
            <span className="text-red-600 font-medium">{majorCount} major</span>
          )}
          {minorCount > 0 && (
            <span className="text-amber-600 font-medium">{minorCount} minor</span>
          )}
        </div>
      </div>

      {/* Per-street EV breakdown */}
      {perStreetEVLoss && (
        <div className="flex items-center gap-0 border-b border-gray-100">
          {(['preflop', 'flop', 'turn', 'river'] as Street[]).map((street) => {
            const loss = perStreetEVLoss[street] ?? 0;
            return (
              <div
                key={street}
                className="flex-1 text-center py-3 border-r border-gray-100 last:border-r-0"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {streetLabel[street]}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    loss === 0 ? 'text-gray-400' : loss <= 1 ? 'text-amber-600' : 'text-red-600'
                  }`}
                >
                  {loss === 0 ? '—' : `-${loss.toFixed(2)}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key deviations list */}
      {hasDeviations ? (
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-3 bg-slate-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Key Deviations
            </span>
          </div>
          {keyDeviations.map((dev) => (
            <button
              key={dev.decisionIndex}
              onClick={() => onJumpToDecision(dev.decisionIndex)}
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <DeviationBadge severity={dev.severity} />
                <span className="text-sm text-gray-600 font-medium">
                  #{dev.decisionIndex + 1} · {streetLabel[dev.street]}
                </span>
                {dev.description && (
                  <span className="text-sm text-gray-400 truncate">{dev.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    dev.severity === 'major' ? 'text-red-600' : 'text-amber-600'
                  }`}
                >
                  {formatEV(-dev.evLoss)}
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <div className="text-emerald-500 text-lg font-semibold mb-1">Perfect Play!</div>
          <div className="text-sm text-gray-400">No deviations from GTO strategy detected.</div>
        </div>
      )}
    </div>
  );
};

export default HandSummaryFooter;