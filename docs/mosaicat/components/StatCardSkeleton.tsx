import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 animate-pulse">
      {/* Label */}
      <div className="w-20 h-3 bg-gray-700 rounded mb-3" />
      {/* Value */}
      <div className="w-24 h-8 bg-gray-700 rounded mb-2" />
      {/* Subtext */}
      <div className="w-16 h-3 bg-gray-700 rounded" />
    </div>
  );
}