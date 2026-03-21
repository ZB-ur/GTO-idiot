import React from 'react';

interface DeviationMarkerProps {
  severity: 'minor' | 'moderate' | 'severe';
  size?: 'sm' | 'md';
  onClick?: () => void;
  tooltip?: string;
}

const severityConfig = {
  minor: {
    bg: 'bg-green-400/20',
    border: 'border-green-400/40',
    dot: 'bg-green-400',
    text: 'text-green-400',
    label: '轻微',
    ring: 'ring-green-400/30',
  },
  moderate: {
    bg: 'bg-yellow-400/20',
    border: 'border-yellow-400/40',
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    label: '中等',
    ring: 'ring-yellow-400/30',
  },
  severe: {
    bg: 'bg-red-400/20',
    border: 'border-red-400/40',
    dot: 'bg-red-400',
    text: 'text-red-400',
    label: '严重',
    ring: 'ring-red-400/30',
  },
};

export const DeviationMarker: React.FC<DeviationMarkerProps> = ({
  severity,
  size = 'md',
  onClick,
  tooltip,
}) => {
  const config = severityConfig[severity];
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={tooltip}
      className={`
        inline-flex items-center gap-1.5
        ${isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
        ${config.bg} ${config.text} ${config.border}
        border rounded-lg font-medium
        ${onClick ? 'cursor-pointer hover:ring-2 ' + config.ring + ' transition-all' : 'cursor-default'}
        focus:outline-none focus:ring-2 ${config.ring}
      `}
    >
      <span className={`${config.dot} rounded-full ${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      {config.label}
    </button>
  );
};

export default DeviationMarker;