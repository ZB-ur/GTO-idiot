/**
 * HandStrengthIndicator — shows the current hand strength for the human player
 * as a colored badge beneath their cards.
 */

import React from 'react';

interface HandStrengthIndicatorProps {
  strength: string | undefined;
  className?: string;
}

function getStrengthColor(strength: string): string {
  const lower = strength.toLowerCase();
  if (
    lower.includes('royal') ||
    lower.includes('straight flush') ||
    lower.includes('four of a kind')
  ) {
    return 'bg-purple-500 text-white';
  }
  if (lower.includes('full house') || lower.includes('flush') || lower.includes('straight')) {
    return 'bg-green-500 text-white';
  }
  if (lower.includes('three') || lower.includes('two pair')) {
    return 'bg-blue-500 text-white';
  }
  if (lower.includes('pair')) {
    return 'bg-yellow-500 text-gray-900';
  }
  return 'bg-gray-500 text-white';
}

export const HandStrengthIndicator: React.FC<HandStrengthIndicatorProps> = ({
  strength,
  className = '',
}) => {
  if (!strength) return null;

  const colorClass = getStrengthColor(strength);

  return (
    <div
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold
        shadow-sm ${colorClass} ${className}`}
    >
      {strength}
    </div>
  );
};

export default HandStrengthIndicator;
