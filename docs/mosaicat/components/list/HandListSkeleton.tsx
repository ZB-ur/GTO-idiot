import React from 'react';

interface HandListSkeletonProps {
  count?: number;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl animate-pulse">
      {/* Hand number */}
      <div className="w-8 h-4 bg-gray-800 rounded shrink-0" />

      {/* Card pair */}
      <div className="flex gap-0.5">
        <div className="w-8 h-10 bg-gray-800 rounded" />
        <div className="w-8 h-10 bg-gray-800 rounded" />
      </div>

      {/* Time + GTO */}
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="w-12 h-3 bg-gray-800 rounded" />
        <div className="w-20 h-3 bg-gray-800 rounded" />
      </div>

      {/* Result */}
      <div className="w-16 h-4 bg-gray-800 rounded shrink-0" />

      {/* Chevron */}
      <div className="w-4 h-4 bg-gray-800 rounded shrink-0" />
    </div>
  );
}

export const HandListSkeleton: React.FC<HandListSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
};