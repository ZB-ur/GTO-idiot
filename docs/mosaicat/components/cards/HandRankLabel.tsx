import React from 'react';

interface HandRankLabelProps {
  rank: string;
  isWinner?: boolean;
}

const HandRankLabel: React.FC<HandRankLabelProps> = ({
  rank,
  isWinner = false,
}) => {
  return (
    <span
      className={`inline-block rounded-lg px-2 py-0.5 text-xs font-semibold ${
        isWinner
          ? 'bg-amber-400/20 text-amber-300'
          : 'bg-gray-800/60 text-gray-300'
      }`}
    >
      {isWinner && (
        <span className="mr-1" aria-hidden="true">
          👑
        </span>
      )}
      {rank}
    </span>
  );
};

export default HandRankLabel;