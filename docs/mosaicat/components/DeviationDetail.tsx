import React, { useMemo } from 'react';

// ─── API-aligned Types ──────────────────────────────────────
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type DeviationSeverity = 'minor' | 'moderate' | 'severe';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface GTOActionFrequency {
  action: ActionType;
  frequency: number; // 0–1
  ev: number; // BB
  bet_size?: string | null;
}

export interface Deviation {
  decision_point: number;
  street: Street;
  severity: DeviationSeverity;
  hero_action: {
    action: ActionType;
    amount?: number | null;
  };
  gto_advice: GTOActionFrequency[];
  frequency_diff: number;
  ev_loss: number;
  description: string;
}

export interface DeviationDetailProps {
  deviation: Deviation;
  onClose?: () => void;
  layout?: 'drawer' | 'inline';
}

// ─── Constants ──────────────────────────────────────────────
const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

const ACTION_COLORS: Record<ActionType, { bar: string; pill: string }> = {
  fold: { bar: 'bg-gray-400', pill: 'bg-gray-500' },
  check: { bar: 'bg-blue-400', pill: 'bg-blue-500' },
  call: { bar: 'bg-amber-500', pill: 'bg-amber-500' },
  raise: { bar: 'bg-emerald-500', pill: 'bg-emerald-500' },
  all_in: { bar: 'bg-red-500', pill: 'bg-red-500' },
};

const SEVERITY_CONFIG: Record<
  DeviationSeverity,
  { dot: string; text: string; bg: string; border: string; label: string; headerBg: string }
> = {
  minor: {
    dot: 'bg-green-400',
    text: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    label: 'Minor',
    headerBg: 'bg-green-400/5',
  },
  moderate: {
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    label: 'Moderate',
    headerBg: 'bg-yellow-400/5',
  },
  severe: {
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    label: 'Severe',
    headerBg: 'bg-red-400/5',
  },
};

// ─── Sub-components ─────────────────────────────────────────

/** DeviationMarker — Severity badge with colored dot */
function DeviationMarker({ severity }: { severity: DeviationSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/** ActionComparison — Side-by-side your action vs GTO recommendation */
function ActionComparison({
  heroAction,
  gtoAdvice,
}: {
  heroAction: Deviation['hero_action'];
  gtoAdvice: GTOActionFrequency[];
}) {
  const sorted = useMemo(
    () => [...gtoAdvice].sort((a, b) => b.frequency - a.frequency),
    [gtoAdvice]
  );
  const recommended = sorted[0];

  return (
    <div className="space-y-4">
      {/* Action Comparison Header */}
      <div className="grid grid-cols-2 gap-3">
        {/* Your Action */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 font-medium tracking-wider mb-2">
            Your Action
          </p>
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white ${
              ACTION_COLORS[heroAction.action]?.pill ?? 'bg-gray-500'
            }`}
          >
            {ACTION_LABELS[heroAction.action] ?? heroAction.action}
            {heroAction.amount != null && heroAction.amount > 0 && (
              <span className="font-normal opacity-80">
                {heroAction.amount} BB
              </span>
            )}
          </span>
        </div>

        {/* GTO Recommendation */}
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 font-medium tracking-wider mb-2">
            GTO Optimal
          </p>
          {recommended && (
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white ${
                ACTION_COLORS[recommended.action]?.pill ?? 'bg-gray-500'
              }`}
            >
              {ACTION_LABELS[recommended.action] ?? recommended.action}
              {recommended.bet_size && (
                <span className="font-normal opacity-80">
                  {recommended.bet_size}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Frequency Distribution */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          GTO Frequency Distribution
        </h4>
        <div className="space-y-2">
          {sorted.map((a) => {
            const pct = Math.round(a.frequency * 100);
            const isChosen = a.action === heroAction.action;
            const colors = ACTION_COLORS[a.action] ?? ACTION_COLORS.check;

            return (
              <div key={a.action} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        isChosen ? 'text-gray-50' : 'text-gray-400'
                      }`}
                    >
                      {ACTION_LABELS[a.action] ?? a.action}
                    </span>
                    {isChosen && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-700 text-gray-300 border border-gray-600">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs tabular-nums ${
                        isChosen ? 'font-bold text-gray-50' : 'text-gray-500'
                      }`}
                    >
                      {pct}%
                    </span>
                    <span
                      className={`text-xs tabular-nums ${
                        a.ev >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {a.ev >= 0 ? '+' : ''}
                      {a.ev.toFixed(2)} BB
                    </span>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${colors.bar} ${
                      isChosen ? 'opacity-100' : 'opacity-60'
                    }`}
                    style={{
                      width: `${Math.max(pct, 1)}%`,
                      minWidth: pct > 0 ? '4px' : '0',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export const DeviationDetail: React.FC<DeviationDetailProps> = ({
  deviation,
  onClose,
  layout = 'drawer',
}) => {
  const severity = SEVERITY_CONFIG[deviation.severity];
  const isDrawer = layout === 'drawer';

  const formatEV = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)} BB`;
  };

  const freqDiffPct = Math.round(deviation.frequency_diff * 100);

  return (
    <div
      className={`
        flex flex-col bg-gray-900 text-gray-50
        ${isDrawer ? 'h-full w-[420px] border-l border-gray-700' : 'rounded-xl border border-gray-700'}
        overflow-hidden
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b border-gray-700 ${severity.headerBg}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500">
              #{deviation.decision_point}
            </span>
            <span className="text-sm font-semibold text-gray-50">
              {STREET_LABELS[deviation.street]}
            </span>
          </div>
          <DeviationMarker severity={deviation.severity} />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-50 hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Action Comparison (child component) */}
        <ActionComparison
          heroAction={deviation.hero_action}
          gtoAdvice={deviation.gto_advice}
        />

        {/* EV Loss Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            EV Impact
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase text-gray-500 font-medium mb-1">
                Frequency Diff
              </p>
              <p className={`text-xl font-bold ${severity.text}`}>
                {freqDiffPct}%
              </p>
            </div>
            <div
              className={`rounded-xl p-4 text-center border ${
                deviation.ev_loss > 0.5
                  ? 'bg-red-400/10 border-red-400/30'
                  : deviation.ev_loss > 0.1
                    ? 'bg-yellow-400/10 border-yellow-400/30'
                    : 'bg-green-400/10 border-green-400/30'
              }`}
            >
              <p className="text-[10px] uppercase text-gray-500 font-medium mb-1">
                EV Loss
              </p>
              <p
                className={`text-xl font-bold ${
                  deviation.ev_loss > 0.5
                    ? 'text-red-400'
                    : deviation.ev_loss > 0.1
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }`}
              >
                -{deviation.ev_loss.toFixed(2)} BB
              </p>
            </div>
          </div>
        </div>

        {/* Per-action EV table */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Expected Value by Action
          </h4>
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">
                    Action
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                    Freq
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">
                    EV
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...deviation.gto_advice]
                  .sort((a, b) => b.ev - a.ev)
                  .map((a) => {
                    const isChosen = a.action === deviation.hero_action.action;
                    return (
                      <tr
                        key={a.action}
                        className={`border-b border-gray-700/50 last:border-0 ${
                          isChosen ? 'bg-gray-700/30' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                ACTION_COLORS[a.action]?.bar ?? 'bg-gray-400'
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                isChosen ? 'text-gray-50' : 'text-gray-400'
                              }`}
                            >
                              {ACTION_LABELS[a.action] ?? a.action}
                            </span>
                            {isChosen && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-600 text-gray-300 font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">
                          {Math.round(a.frequency * 100)}%
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right tabular-nums font-medium ${
                            a.ev >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatEV(a.ev)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        <div
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${severity.bg} ${severity.border}`}
        >
          <span className={`${severity.dot} w-2 h-2 rounded-full mt-1.5 shrink-0`} />
          <p className={`${severity.text} leading-relaxed`}>
            {deviation.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviationDetail;