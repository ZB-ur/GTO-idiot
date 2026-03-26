import React from 'react';

interface DeviationBadgeProps {
  status: 'correct' | 'deviation';
}

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({ status }) => {
  const isCorrect = status === 'correct';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isCorrect
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      <span className="text-[10px]">{isCorrect ? '✓' : '✗'}</span>
      {isCorrect ? 'GTO' : 'Deviation'}
    </span>
  );
};

export default DeviationBadge;