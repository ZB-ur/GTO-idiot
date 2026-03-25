import React from 'react';

export const SkeletonTable: React.FC = () => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
      {/* Felt surface */}
      <div className="absolute inset-0 rounded-[50%] bg-[#2d5a3d] border-4 border-[#3d7a5d] shadow-lg animate-pulse" />

      {/* Center pot area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="h-4 w-20 bg-gray-700/50 rounded-md" />
        <div className="flex gap-1">
          <div className="w-8 h-11 bg-gray-700/40 rounded-md" />
          <div className="w-8 h-11 bg-gray-700/40 rounded-md" />
          <div className="w-8 h-11 bg-gray-700/40 rounded-md" />
          <div className="w-8 h-11 bg-gray-700/40 rounded-md" />
          <div className="w-8 h-11 bg-gray-700/40 rounded-md" />
        </div>
      </div>

      {/* Player seat placeholders */}
      {/* Bottom (Hero) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
      {/* Top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
      {/* Left */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
      {/* Right */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
      {/* Top-left */}
      <div className="absolute top-[15%] left-[10%] flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
      {/* Top-right */}
      <div className="absolute top-[15%] right-[10%] flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-700/50" />
        <div className="h-3 w-16 bg-gray-700/50 rounded-md" />
      </div>
    </div>
  );
};

export default SkeletonTable;