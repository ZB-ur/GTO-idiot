import React from 'react';

const GRID_SIZE = 13;

export const HeatmapSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-10 bg-gray-700 rounded animate-pulse" />
      </div>

      {/* 13×13 skeleton grid */}
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm bg-gray-700 animate-pulse"
            style={{
              animationDelay: `${(i % GRID_SIZE) * 30 + Math.floor(i / GRID_SIZE) * 30}ms`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
        <div className="h-2 w-8 bg-gray-700 rounded animate-pulse" />
        <div className="flex gap-px flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-sm bg-gray-700 animate-pulse" />
          ))}
        </div>
        <div className="h-2 w-8 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
};