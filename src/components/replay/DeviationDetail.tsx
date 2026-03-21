// ============================================================
// GTO Idiot — Deviation Detail Component
// Shows GTO deviation info for a specific decision point
// ============================================================

import type { Deviation, DeviationSeverity, GTOActionFrequency, ActionType } from '../../types';

interface DeviationDetailProps {
  deviation: Deviation;
  className?: string;
}

const SEVERITY_STYLES: Record<DeviationSeverity, { border: string; bg: string; text: string; label: string }> = {
  minor: {
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/5',
    text: 'text-yellow-400',
    label: 'Minor Deviation',
  },
  moderate: {
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/5',
    text: 'text-orange-400',
    label: 'Moderate Deviation',
  },
  severe: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
    label: 'Severe Deviation',
  },
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-in',
};

const ACTION_COLORS: Record<ActionType, string> = {
  fold: 'bg-gray-600',
  check: 'bg-blue-600',
  call: 'bg-green-600',
  raise: 'bg-orange-600',
  all_in: 'bg-red-600',
};

export default function DeviationDetail({ deviation, className = '' }: DeviationDetailProps) {
  const style = SEVERITY_STYLES[deviation.severity];

  return (
    <div
      className={`rounded-lg border ${style.border} ${style.bg} p-4 ${className}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-sm font-semibold ${style.text}`}>
          {style.label}
        </span>
        <span className="text-xs text-gray-500">
          EV Loss: <span className="text-red-400">-{deviation.ev_loss.toFixed(2)} BB</span>
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-300">{deviation.description}</p>

      {/* Your action vs GTO */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs text-gray-500">Your action:</span>
        <span className="rounded bg-gray-700 px-2 py-0.5 text-xs font-medium text-white">
          {ACTION_LABELS[deviation.hero_action.action]}
          {deviation.hero_action.amount != null && ` ${deviation.hero_action.amount}`}
        </span>
      </div>

      {/* GTO frequency bars */}
      <div className="space-y-2">
        <span className="text-xs text-gray-500">GTO Strategy:</span>
        {deviation.gto_advice
          .filter((a) => a.frequency > 0.01)
          .sort((a, b) => b.frequency - a.frequency)
          .map((advice) => (
            <FrequencyBar
              key={advice.action}
              advice={advice}
              isHeroAction={advice.action === deviation.hero_action.action}
            />
          ))}
      </div>
    </div>
  );
}

// ---------- Frequency Bar ----------

function FrequencyBar({
  advice,
  isHeroAction,
}: {
  advice: GTOActionFrequency;
  isHeroAction: boolean;
}) {
  const pct = Math.round(advice.frequency * 100);
  const barColor = ACTION_COLORS[advice.action];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-14 text-right text-xs ${
          isHeroAction ? 'font-bold text-white' : 'text-gray-400'
        }`}
      >
        {ACTION_LABELS[advice.action]}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-700 h-3">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs text-gray-400">
        {pct}%
      </span>
      <span className="w-16 text-right text-xs text-gray-500">
        EV: {advice.ev >= 0 ? '+' : ''}{advice.ev.toFixed(2)}
      </span>
    </div>
  );
}

// ---------- Compact Deviation Summary ----------

export function DeviationBadge({
  severity,
  className = '',
}: {
  severity: DeviationSeverity;
  className?: string;
}) {
  const style = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${style.border} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
}
