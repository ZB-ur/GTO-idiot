import React, { useRef } from 'react';

export interface ReplayTimelineProps {
  totalEvents: number;
  currentIndex: number;
  userDecisionIndices: number[];
  onJump: (index: number) => void;
}

export function ReplayTimeline({
  totalEvents,
  currentIndex,
  userDecisionIndices,
  onJump,
}: ReplayTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(fraction * (totalEvents - 1));
    onJump(idx);
  };

  const progressPercent = totalEvents > 1 ? (currentIndex / (totalEvents - 1)) * 100 : 0;
  const userDecisionSet = new Set(userDecisionIndices);

  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">Event {currentIndex + 1} / {totalEvents}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-8 cursor-pointer group"
        onClick={handleTrackClick}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-700 rounded-full" />
        {/* Progress fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Event dots and diamonds */}
        {Array.from({ length: totalEvents }).map((_, idx) => {
          const leftPercent = totalEvents > 1 ? (idx / (totalEvents - 1)) * 100 : 50;
          const isUserDecision = userDecisionSet.has(idx);
          const isCurrent = idx === currentIndex;
          const isPast = idx <= currentIndex;

          return (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); onJump(idx); }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 focus:outline-none"
              style={{ left: `${leftPercent}%` }}
              title={`Event ${idx + 1}${isUserDecision ? ' (Your decision)' : ''}`}
            >
              {isUserDecision ? (
                <div
                  className={`
                    w-3.5 h-3.5 rotate-45 border-2 transition-all
                    ${isCurrent
                      ? 'bg-emerald-400 border-emerald-300 scale-125 shadow-lg shadow-emerald-500/40'
                      : isPast
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-gray-600 border-gray-500'
                    }
                  `}
                />
              ) : (
                <div
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${isCurrent
                      ? 'bg-emerald-400 scale-150 shadow-lg shadow-emerald-500/40'
                      : isPast
                        ? 'bg-gray-400'
                        : 'bg-gray-600'
                    }
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-500">Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rotate-45 bg-emerald-500 border border-emerald-400" />
          <span className="text-xs text-gray-500">Your Decision</span>
        </div>
      </div>
    </div>
  );
}