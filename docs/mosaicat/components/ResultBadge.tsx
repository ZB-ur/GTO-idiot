import React from 'react';

type HandResult = 'win' | 'loss' | 'tie';

interface ResultBadgeProps {
  result: HandResult;
  netChips: number;
}

const resultConfig: Record<HandResult, { label: string; bgClass: string; textClass: string; sign: string }> = {
  win: {
    label: '胜',
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
    sign: '+',
  },
  loss: {
    label: '负',
    bgClass: 'bg-red-50',
    textClass: 'text-red-600',
    sign: '',
  },
  tie: {
    label: '平',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-600',
    sign: '±',
  },
};

const ResultBadge: React.FC<ResultBadgeProps> = ({ result, netChips }) => {
  const config = resultConfig[result];
  const chipsDisplay =
    result === 'tie'
      ? `${config.sign}0`
      : `${netChips >= 0 ? '+' : ''}${netChips}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span>{config.label}</span>
      <span className="tabular-nums">{chipsDisplay}</span>
    </span>
  );
};

export default ResultBadge;