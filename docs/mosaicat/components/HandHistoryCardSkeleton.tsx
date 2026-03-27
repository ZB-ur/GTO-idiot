import React from 'react';

export const HandHistoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        {/* Left: cards + position */}
        <div className="flex items-center gap-3">
          {/* Two card placeholders */}
          <div className="flex items-center">
            <div className="w-8 h-11 bg-gray-700 rounded-md" />
            <div className="-ml-2 w-8 h-11 bg-gray-700 rounded-md" />
          </div>

          {/* Position badge */}
          <div className="w-10 h-5 bg-gray-700 rounded-full" />
        </div>

        {/* Right: result */}
        <div className="w-16 h-6 bg-gray-700 rounded-lg" />
      </div>

      {/* Bottom row: hand ID + timestamp */}
      <div className="flex items-center justify-between mt-3">
        <div className="w-20 h-3 bg-gray-700/60 rounded" />
        <div className="w-24 h-3 bg-gray-700/60 rounded" />
      </div>
    </div>
  );
};

export default HandHistoryCardSkeleton;