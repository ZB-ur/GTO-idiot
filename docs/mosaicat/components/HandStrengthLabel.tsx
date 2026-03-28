import React from 'react';

export type HandRank =
  | 'royal_flush'
  | 'straight_flush'
  | 'four_of_a_kind'
  | 'full_house'
  | 'flush'
  | 'straight'
  | 'three_of_a_kind'
  | 'two_pair'
  | 'one_pair'
  | 'high_card';

interface HandStrengthLabelProps {
  handRank: HandRank;
  handDescription: string;
}

const rankColors: Record<HandRank, string> = {
  royal_flush: 'bg-amber-500 text-white',
  straight_flush: 'bg-purple-600 text-white',
  four_of_a_kind: 'bg-red-500 text-white',
  full_house: 'bg-blue-600 text-white',
  flush: 'bg-sky-500 text-white',
  straight: 'bg-teal-500 text-white',
  three_of_a_kind: 'bg-emerald-500 text-white',
  two_pair: 'bg-green-500 text-white',
  one_pair: 'bg-gray-500 text-white',
  high_card: 'bg-gray-400 text-white',
};

export const HandStrengthLabel: React.FC<HandStrengthLabelProps> = ({
  handRank,
  handDescription,
}) => {
  const colorClass = rankColors[handRank] ?? 'bg-gray-400 text-white';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${colorClass}`}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {handDescription}
    </span>
  );
};

export default HandStrengthLabel;