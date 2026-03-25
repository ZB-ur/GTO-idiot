import React from 'react';

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-13 gap-0.5">
      {RANKS.map((row, ri) =>
        RANKS.map((col, ci) => (
          <div
            key={`${ri}-${ci}`}
            className="aspect-square rounded-sm bg-[#1e293b] border border-gray-700/50 animate-pulse"
            style={{ animationDelay: `${(ri + ci) * 30}ms` }}
          />
        ))
      )}
    </div>
  );
};

export default SkeletonGrid;