import React from 'react';

export type LeakSeverity = 'high' | 'medium' | 'low';

export interface Leak {
  title: string;
  description: string;
  severity: LeakSeverity;
  deviationPercent?: number;
}

interface LeakCardProps {
  leak: Leak;
}

const severityConfig: Record<LeakSeverity, { label: string; bg: string; text: string; border: string; icon: string }> = {
  high: {
    label: 'High',
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    border: 'border-red-400/30',
    icon: '!!',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    border: 'border-amber-400/30',
    icon: '!',
  },
  low: {
    label: 'Low',
    bg: 'bg-sky-400/10',
    text: 'text-sky-400',
    border: 'border-sky-400/30',
    icon: 'i',
  },
};

const LeakSeverityBadge: React.FC<{ severity: LeakSeverity }> = ({ severity }) => {
  const config = severityConfig[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      {config.label}
    </span>
  );
};

export const LeakCard: React.FC<LeakCardProps> = ({ leak }) => {
  const config = severityConfig[leak.severity];

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-5 transition-colors hover:border-gray-600`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-base font-semibold text-gray-50 leading-snug">{leak.title}</h4>
        <LeakSeverityBadge severity={leak.severity} />
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-3">{leak.description}</p>
      {leak.deviationPercent !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">GTO Deviation</span>
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                leak.severity === 'high' ? 'bg-red-400' : leak.severity === 'medium' ? 'bg-amber-400' : 'bg-sky-400'
              }`}
              style={{ width: `${Math.min(leak.deviationPercent, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${config.text}`}>{leak.deviationPercent}%</span>
        </div>
      )}
    </div>
  );
};