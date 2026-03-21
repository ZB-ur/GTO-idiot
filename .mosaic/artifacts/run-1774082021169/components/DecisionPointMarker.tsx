import React from 'react';

interface DecisionPointMarkerProps {
  quality: 'good' | 'minor_deviation' | 'major_deviation';
  frameIndex: number;
  active?: boolean;
  onClick?: (frameIndex: number) => void;
}

const qualityConfig: Record<
  DecisionPointMarkerProps['quality'],
  { color: string; ring: string; label: string }
> = {
  good:            { color: 'bg-green-500', ring: 'ring-green-200', label: 'Good' },
  minor_deviation: { color: 'bg-amber-500', ring: 'ring-amber-200', label: 'Minor' },
  major_deviation: { color: 'bg-rose-500',  ring: 'ring-rose-200',  label: 'Major' },
};

export const DecisionPointMarker: React.FC<DecisionPointMarkerProps> = ({
  quality,
  frameIndex,
  active = false,
  onClick,
}) => {
  const config = qualityConfig[quality];

  return (
    <button
      onClick={() => onClick?.(frameIndex)}
      className={`
        relative flex items-center justify-center
        w-5 h-5 rounded-full ${config.color}
        transition-all duration-150
        ${active ? `ring-4 ${config.ring} scale-125` : 'hover:scale-110'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      title={`Frame ${frameIndex} — ${config.label}`}
      aria-label={`Decision point at frame ${frameIndex}, quality: ${config.label}`}
    >
      <span className="w-2 h-2 rounded-full bg-white/60" />
    </button>
  );
};

export default DecisionPointMarker;