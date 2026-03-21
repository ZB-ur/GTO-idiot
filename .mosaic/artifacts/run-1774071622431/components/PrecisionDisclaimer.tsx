import React, { useState } from 'react';

interface PrecisionDisclaimerProps {
  precision: 'exact' | 'precomputed' | 'simplified' | 'pseudo_headsup';
  message?: string;
}

const precisionConfig: Record<
  PrecisionDisclaimerProps['precision'],
  { label: string; icon: string; defaultMessage: string; bg: string; text: string }
> = {
  exact: {
    label: 'Exact',
    icon: '✓',
    defaultMessage: 'Full GTO solution',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
  },
  precomputed: {
    label: 'Precomputed',
    icon: '⚡',
    defaultMessage: 'From precomputed strategy table',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
  },
  simplified: {
    label: 'Simplified',
    icon: '≈',
    defaultMessage: 'Simplified calculation — for reference only',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
  },
  pseudo_headsup: {
    label: 'Pseudo HU',
    icon: '⚠',
    defaultMessage: 'Multi-way pot degraded to heads-up model — approximate only',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
  },
};

export const PrecisionDisclaimer: React.FC<PrecisionDisclaimerProps> = ({
  precision,
  message,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = precisionConfig[precision];
  const tooltipText = message || config.defaultMessage;

  return (
    <span
      className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} cursor-help`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-normal whitespace-nowrap shadow-lg z-50">
          {tooltipText}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
};

export default PrecisionDisclaimer;