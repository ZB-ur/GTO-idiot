import React from 'react';

export function HistorySkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-900 rounded-xl border border-gray-700 animate-pulse">
      {/* Hand number */}
      <div className="w-12 h-4 bg-gray-700 rounded" />
      {/* Date/time */}
      <div className="w-20 h-4 bg-gray-700 rounded" />
      {/* Cards placeholder */}
      <div className="flex gap-1">
        <div className="w-8 h-11 bg-gray-700 rounded" />
        <div className="w-8 h-11 bg-gray-700 rounded" />
      </div>
      {/* Result */}
      <div className="flex-1" />
      <div className="w-16 h-4 bg-gray-700 rounded" />
      {/* Amount */}
      <div className="w-12 h-4 bg-gray-700 rounded" />
    </div>
  );
}