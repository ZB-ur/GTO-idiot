import React from 'react';

export const ReplayLoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-800 rounded-lg" />
          <div className="h-6 w-40 bg-gray-800 rounded-lg" />
        </div>
        <div className="h-8 w-24 bg-gray-800 rounded-lg" />
      </div>

      {/* Timeline skeleton */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-center gap-4 py-3">
          {[0, 1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="h-3 w-8 bg-gray-800 rounded" />
              </div>
              {i < 3 && <div className="flex-1 h-0.5 bg-gray-800 rounded-full max-w-16" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table view skeleton */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 aspect-[16/10] flex items-center justify-center">
          <div className="w-64 h-40 bg-emerald-900/30 rounded-full border-2 border-emerald-800/30 flex items-center justify-center">
            <div className="h-4 w-20 bg-gray-800 rounded" />
          </div>
        </div>

        {/* Side panels skeleton */}
        <div className="space-y-4">
          {/* Action sequence skeleton */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="h-4 w-20 bg-gray-800 rounded" />
            </div>
            <div className="space-y-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/30">
                  <div className="h-3 w-4 bg-gray-800 rounded" />
                  <div className="h-3 w-14 bg-gray-800 rounded" />
                  <div className="h-5 w-16 bg-gray-800 rounded-lg" />
                  <div className="ml-auto h-3 w-12 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Decision panel skeleton */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4">
            <div className="h-4 w-28 bg-gray-800 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg">
                <div className="h-3 w-16 bg-gray-800 rounded" />
                <div className="h-6 w-20 bg-gray-800 rounded" />
              </div>
              <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg">
                <div className="h-3 w-16 bg-gray-800 rounded" />
                <div className="h-6 w-20 bg-gray-800 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-800 rounded" />
              <div className="h-3 w-3/4 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};