import React from 'react';

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded-lg ${className ?? ''}`} />
  );
}

export function TableLoadingSkeleton() {
  // 6 seat positions around an elliptical table
  const seatPositions = [
    { top: '75%', left: '50%' },   // bottom center (user)
    { top: '55%', left: '8%' },    // bottom left
    { top: '15%', left: '12%' },   // top left
    { top: '5%', left: '50%' },    // top center
    { top: '15%', left: '88%' },   // top right
    { top: '55%', left: '92%' },   // bottom right
  ];

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-950 flex items-center justify-center">
      {/* Table felt skeleton */}
      <div className="relative w-[70%] h-[55%]">
        <div className="absolute inset-0 bg-emerald-900/40 rounded-[50%] border-4 border-emerald-700/30 animate-pulse" />

        {/* Community cards skeleton */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonPulse
              key={i}
              className="w-12 h-[68px] !rounded-lg !bg-emerald-800/50"
            />
          ))}
        </div>

        {/* Pot skeleton */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2">
          <SkeletonPulse className="w-24 h-6 !rounded-full" />
        </div>
      </div>

      {/* Seat skeletons */}
      {seatPositions.map((pos, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Avatar */}
          <SkeletonPulse className="w-14 h-14 !rounded-full" />
          {/* Name */}
          <SkeletonPulse className="w-16 h-4" />
          {/* Chips */}
          <SkeletonPulse className="w-12 h-3" />
        </div>
      ))}

      {/* Loading text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-pulse">
        牌桌加载中…
      </div>
    </div>
  );
}