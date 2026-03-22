import React from 'react';

export type DeviationLevel = 'conforming' | 'minor' | 'major';

export interface ActionInfo {
  actionType: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  amount?: number;
  sizing?: string;
}

export interface GTOComparison {
  userAction: ActionInfo;
  gtoAction: ActionInfo & { sizing?: string };
  deviationLevel: DeviationLevel;
  evLoss?: number;
  explanation?: string;
}

interface GTOComparisonBadgeProps {
  comparison: GTOComparison;
}

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-in',
};

const DEVIATION_CONFIG: Record<DeviationLevel, { bg: string; text: string; border: string; icon: string; label: string }> = {
  conforming: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: '✓',
    label: 'GTO',
  },
  minor: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: '~',
    label: '微偏差',
  },
  major: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '✗',
    label: '大偏差',
  },
};

export const GTOComparisonBadge: React.FC<GTOComparisonBadgeProps> = ({ comparison }) => {
  const config = DEVIATION_CONFIG[comparison.deviationLevel];
  const userLabel = ACTION_LABELS[comparison.userAction.actionType] || comparison.userAction.actionType;
  const gtoLabel = comparison.gtoAction.sizing || ACTION_LABELS[comparison.gtoAction.actionType] || comparison.gtoAction.actionType;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium ${config.bg} ${config.text} ${config.border}`}
      title={comparison.explanation}
    >
      <span className="font-bold">{config.icon}</span>
      {comparison.deviationLevel === 'conforming' ? (
        <span>{userLabel} — {config.label}</span>
      ) : (
        <>
          <span>{userLabel}</span>
          <span className="opacity-50">→</span>
          <span>{gtoLabel}</span>
          {comparison.evLoss != null && comparison.evLoss > 0 && (
            <span className="ml-0.5 opacity-75">(-{comparison.evLoss.toFixed(1)}BB)</span>
          )}
        </>
      )}
    </span>
  );
};

export default GTOComparisonBadge;