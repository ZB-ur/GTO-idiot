import React from 'react';

interface HandStrengthIndicatorProps {
  handRank: string;
  className?: string;
}

type StrengthTier = 'nuts' | 'strong' | 'medium' | 'weak' | 'air';

const TIER_STYLES: Record<StrengthTier, { bg: string; text: string; dot: string }> = {
  nuts: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  strong: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  weak: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  air: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' },
};

function classifyRank(handRank: string): StrengthTier {
  const lower = handRank.toLowerCase();
  if (/flush|straight|full house|four of a kind|royal/.test(lower)) return 'nuts';
  if (/two pair|set|three of a kind|overpair|top pair.*top kicker/.test(lower)) return 'strong';
  if (/top pair|middle pair|open.?ended|flush draw/.test(lower)) return 'medium';
  if (/bottom pair|weak|gutshot|backdoor/.test(lower)) return 'weak';
  return 'air';
}

export const HandStrengthIndicator: React.FC<HandStrengthIndicatorProps> = ({
  handRank,
  className = '',
}) => {
  const tier = classifyRank(handRank);
  const style = TIER_STYLES[tier];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        ${style.bg}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className={`text-xs font-medium ${style.text}`}>{handRank}</span>
    </div>
  );
};