import React, { useEffect, useCallback, useRef } from 'react';

// ─── Types (from API spec) ─────────────────────────────────────
type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
type Street = 'preflop' | 'flop' | 'turn' | 'river';

interface GTOActionFrequency {
  action: ActionType;
  frequency: number; // 0–1
  ev: number; // EV in BB
  bet_size?: string | null;
}

interface GTOAdvice {
  actions: GTOActionFrequency[];
  recommended_action?: ActionType;
  is_approximate: boolean;
  computation_time_ms?: number;
}

interface HintResponse {
  hand_id: string;
  street: Street;
  decision_point: number;
  advice: GTOAdvice;
  hint_viewed: boolean;
  is_degraded: boolean;
}

// ─── Props ─────────────────────────────────────────────────────
export interface HintPopoverProps {
  open: boolean;
  onClose: () => void;
  hint?: HintResponse;
  loading?: boolean;
  isDegraded?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────
const ACTION_META: Record<ActionType, { label: string; color: string; barColor: string }> = {
  fold:   { label: 'Fold',   color: 'text-red-400',     barColor: 'bg-red-500' },
  check:  { label: 'Check',  color: 'text-gray-400',    barColor: 'bg-gray-400' },
  call:   { label: 'Call',   color: 'text-yellow-400',  barColor: 'bg-yellow-500' },
  raise:  { label: 'Raise',  color: 'text-emerald-400', barColor: 'bg-emerald-500' },
  all_in: { label: 'All-In', color: 'text-blue-400',    barColor: 'bg-blue-500' },
};

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

// ─── FrequencyBar (inline child) ───────────────────────────────
function FrequencyBar({
  action,
  frequency,
  ev,
  betSize,
  isRecommended,
  maxFrequency,
}: {
  action: ActionType;
  frequency: number;
  ev: number;
  betSize?: string | null;
  isRecommended: boolean;
  maxFrequency: number;
}) {
  const meta = ACTION_META[action] ?? ACTION_META.check;
  const pct = Math.round(frequency * 100);
  const widthPct = maxFrequency > 0 ? (frequency / maxFrequency) * 100 : 0;
  const evSign = ev >= 0 ? '+' : '';

  return (
    <div className="group">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${meta.color}`}>
            {meta.label}
          </span>
          {betSize && (
            <span className="text-xs text-gray-500">{betSize}</span>
          )}
          {isRecommended && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              GTO
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 tabular-nums">
            EV: <span className={ev >= 0 ? 'text-emerald-400' : 'text-red-400'}>{evSign}{ev.toFixed(2)} BB</span>
          </span>
          <span className="text-sm font-semibold text-gray-50 tabular-nums w-10 text-right">
            {pct}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-6 w-full bg-gray-800 rounded-lg overflow-hidden">
        <div
          className={`h-full rounded-lg transition-all duration-500 ease-out ${meta.barColor} ${
            isRecommended ? 'opacity-100' : 'opacity-70'
          }`}
          style={{ width: `${Math.max(widthPct, pct > 0 ? 1 : 0)}%` }}
        />
      </div>
    </div>
  );
}

// ─── LoadingSpinner (inline child) ─────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Calculating GTO strategy…</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export const HintPopover: React.FC<HintPopoverProps> = ({
  open,
  onClose,
  hint,
  loading = false,
  isDegraded = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const advice = hint?.advice;
  const sorted = advice
    ? [...advice.actions].sort((a, b) => b.frequency - a.frequency)
    : [];
  const maxFreq = Math.max(...sorted.map((a) => a.frequency), 0.01);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="GTO Hint"
        className="relative w-full max-w-md mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-50">GTO Hint</h3>
              {hint && (
                <p className="text-xs text-gray-500">
                  {STREET_LABELS[hint.street]} · Decision #{hint.decision_point}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Close hint"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {loading ? (
            <LoadingSpinner />
          ) : !advice ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No hint data available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Degraded warning */}
              {(isDegraded || hint?.is_degraded) && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <svg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-yellow-400 leading-relaxed">
                    Approximate result — CFR computation timed out. Strategy may be less precise.
                  </p>
                </div>
              )}

              {/* Frequency distribution */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action Frequency
                </h4>
                <div className="space-y-2">
                  {sorted.map((a) => (
                    <FrequencyBar
                      key={a.action}
                      action={a.action}
                      frequency={a.frequency}
                      ev={a.ev}
                      betSize={a.bet_size}
                      isRecommended={a.action === advice.recommended_action}
                      maxFrequency={maxFreq}
                    />
                  ))}
                </div>
              </div>

              {/* EV summary */}
              {advice.recommended_action && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Recommended Action</p>
                      <p className="text-lg font-bold text-gray-50">
                        {ACTION_META[advice.recommended_action]?.label ?? advice.recommended_action}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Best EV</p>
                      {(() => {
                        const best = sorted.find((a) => a.action === advice.recommended_action);
                        const evVal = best?.ev ?? 0;
                        const sign = evVal >= 0 ? '+' : '';
                        return (
                          <p className={`text-lg font-bold tabular-nums ${evVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {sign}{evVal.toFixed(2)} BB
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Approximate GTO notice */}
              {advice.is_approximate && (
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  ≈ Approximate GTO — based on simplified game tree with 33%/66%/100% pot bet sizings.
                  {advice.computation_time_ms != null && (
                    <span className="text-gray-600"> Computed in {advice.computation_time_ms}ms.</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HintPopover;