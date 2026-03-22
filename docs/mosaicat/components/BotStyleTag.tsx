import React from 'react';
import { Tooltip } from './Tooltip';

interface BotStyleTagProps {
  style: 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';
}

const styleConfig: Record<string, { bg: string; text: string; description: string }> = {
  TAG: {
    bg: 'bg-blue-100 border-blue-200',
    text: 'text-blue-700',
    description: 'Tight-Aggressive: Plays few hands but bets/raises aggressively',
  },
  LAG: {
    bg: 'bg-purple-100 border-purple-200',
    text: 'text-purple-700',
    description: 'Loose-Aggressive: Plays many hands with aggressive betting',
  },
  Fish: {
    bg: 'bg-emerald-100 border-emerald-200',
    text: 'text-emerald-700',
    description: 'Fish: Passive, calls too often, rarely raises',
  },
  Nit: {
    bg: 'bg-gray-100 border-gray-300',
    text: 'text-gray-700',
    description: 'Nit: Extremely tight, only plays premium hands',
  },
  Maniac: {
    bg: 'bg-red-100 border-red-200',
    text: 'text-red-700',
    description: 'Maniac: Hyper-aggressive, bets and raises at every opportunity',
  },
};

export const BotStyleTag: React.FC<BotStyleTagProps> = ({ style }) => {
  const config = styleConfig[style];

  return (
    <Tooltip content={config.description} position="top">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border cursor-help ${config.bg} ${config.text}`}
      >
        {style}
      </span>
    </Tooltip>
  );
};

export default BotStyleTag;