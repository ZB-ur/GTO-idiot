import React from 'react';

// --- Types ---

interface GtoRecommendedAction {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  frequency: number;
  amount?: number | null;
}

type GtoDeviation = 'match' | 'minor' | 'severe' | 'no_data';

interface GtoAnalysis {
  hasData: boolean;
  recommendedActions?: GtoRecommendedAction[];
  userAction?: string;
  userActionFrequency?: number;
  deviation: GtoDeviation;
  explanation?: string;
}

// --- Sub-components ---

interface GtoActionBarProps {
  actions: GtoRecommendedAction[];
  userAction?: string;
}

function GtoActionBar({ actions, userAction }: GtoActionBarProps) {
  const sorted = [...actions].sort((a, b) => b.frequency - a.frequency);
  const colorMap: Record<string, string> = {
    fold: 'bg-red-500',
    check: 'bg-emerald-500',
    call: 'bg-emerald-500',
    bet: 'bg-amber-400',
    raise: 'bg-amber-400',
    all_in: 'bg-red-400',
  };

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-800">
        {sorted.map((a) => (
          <div
            key={a.action}
            className={`${colorMap[a.action] ?? 'bg-gray-500'} transition-all`}
            style={{ width: `${a.frequency}%` }}
            title={`${a.action} ${a.frequency}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {sorted.map((a) => {
          const isUser = a.action === userAction;
          const label = a.amount != null ? `${a.action} ${a.amount}BB` : a.action;
          return (
            <div key={a.action} className="flex items-center gap-1.5 text-sm">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-sm ${colorMap[a.action] ?? 'bg-gray-500'}`}
              />
              <span className={isUser ? 'font-semibold text-gray-50' : 'text-gray-400'}>
                {label}
              </span>
              <span className="text-gray-500">{a.frequency}%</span>
              {isUser && (
                <span className="ml-0.5 rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300">
                  YOU
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface GtoComparisonLabelProps {
  deviation: GtoDeviation;
  userActionFrequency?: number;
}

function GtoComparisonLabel({ deviation, userActionFrequency }: GtoComparisonLabelProps) {
  const config: Record<GtoDeviation, { label: string; bg: string; text: string; ring: string }> = {
    match: { label: 'GTO Match', bg: 'bg-emerald-900/60', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    minor: { label: 'Minor Deviation', bg: 'bg-yellow-900/40', text: 'text-yellow-400', ring: 'ring-yellow-500/30' },
    severe: { label: 'Severe Deviation', bg: 'bg-red-900/40', text: 'text-red-400', ring: 'ring-red-500/30' },
    no_data: { label: 'No GTO Data', bg: 'bg-gray-800', text: 'text-gray-400', ring: 'ring-gray-600/30' },
  };
  const c = config[deviation];

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1 ${c.bg} ${c.ring}`}>
      <span className={`text-sm font-semibold ${c.text}`}>{c.label}</span>
      {userActionFrequency != null && deviation !== 'no_data' && (
        <span className="text-xs text-gray-400">({userActionFrequency}% freq)</span>
      )}
    </div>
  );
}

function GtoUnavailableNotice() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-gray-500">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm text-gray-400">Select a decision point to view GTO analysis</p>
    </div>
  );
}

interface GtoCoverageBadgeProps {
  hasData: boolean;
}

function GtoCoverageBadge({ hasData }: GtoCoverageBadgeProps) {
  return hasData ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-emerald-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      GTO Data
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-700">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
      No Data
    </span>
  );
}

// --- Main Component ---

interface GtoPanelProps {
  gtoAnalysis: GtoAnalysis | null;
  userAction?: string;
  className?: string;
}

export function GtoPanel({ gtoAnalysis, userAction, className = '' }: GtoPanelProps) {
  if (!gtoAnalysis) {
    return (
      <div className={`rounded-xl border border-gray-700 bg-gray-900 p-5 ${className}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            GTO Analysis
          </h3>
        </div>
        <GtoUnavailableNotice />
      </div>
    );
  }

  const { hasData, recommendedActions, userActionFrequency, deviation, explanation } = gtoAnalysis;

  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-900 p-5 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          GTO Analysis
        </h3>
        <GtoCoverageBadge hasData={hasData} />
      </div>

      {/* Deviation Label */}
      <div className="mb-4">
        <GtoComparisonLabel deviation={deviation} userActionFrequency={userActionFrequency} />
      </div>

      {/* Action Distribution */}
      {hasData && recommendedActions && recommendedActions.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Action Distribution
          </p>
          <GtoActionBar
            actions={recommendedActions}
            userAction={userAction ?? gtoAnalysis.userAction}
          />
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="rounded-lg bg-gray-800/60 px-4 py-3">
          <p className="text-sm leading-relaxed text-gray-300">{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default GtoPanel;