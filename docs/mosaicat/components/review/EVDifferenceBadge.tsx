import React from 'react';

interface EVDifferenceBadgeProps {
  evDifference: number;
}

const EVDifferenceBadge: React.FC<EVDifferenceBadgeProps> = ({ evDifference }) => {
  const isPositive = evDifference >= 0;
  const formatted = `${isPositive ? '+' : ''}${evDifference.toFixed(2)} BB`;

  const colorClasses = isPositive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-red-50 text-red-700 border-red-200';

  const iconPath = isPositive
    ? 'M5 10l7-7m0 0l7 7m-7-7v18' // arrow up
    : 'M19 14l-7 7m0 0l-7-7m7 7V3'; // arrow down

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold rounded-lg border ${colorClasses}`}
      title={`EV Difference: ${formatted}`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {formatted}
    </span>
  );
};

export default EVDifferenceBadge;