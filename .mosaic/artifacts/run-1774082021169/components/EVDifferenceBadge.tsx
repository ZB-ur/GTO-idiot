import React from 'react';

interface EVDifferenceBadgeProps {
  evDifference: number;
  quality: 'good' | 'minor_deviation' | 'major_deviation';
}

const qualityStyles: Record<
  EVDifferenceBadgeProps['quality'],
  { bg: string; text: string; border: string }
> = {
  good:            { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  minor_deviation: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  major_deviation: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
};

const qualityLabels: Record<EVDifferenceBadgeProps['quality'], string> = {
  good: 'Optimal',
  minor_deviation: 'Minor Leak',
  major_deviation: 'Major Leak',
};

export const EVDifferenceBadge: React.FC<EVDifferenceBadgeProps> = ({ evDifference, quality }) => {
  const style = qualityStyles[quality];
  const sign = evDifference >= 0 ? '+' : '';
  const formattedEV = `${sign}${evDifference.toFixed(2)} BB`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-semibold ${style.bg} ${style.text} ${style.border}`}
      title={`EV Difference: ${formattedEV} (${qualityLabels[quality]})`}
    >
      <span className="text-xs font-normal opacity-75">EV</span>
      <span>{formattedEV}</span>
    </span>
  );
};

export default EVDifferenceBadge;