import React from 'react';

type Quality = 'good' | 'minor_deviation' | 'major_deviation';

interface TimelineMarker {
  label: string;
  street: string;
  decisionPointIndices: number[];
}

interface DecisionQualityItem {
  index: number;
  quality: Quality;
}

interface ReplayTimelineProps {
  markers: TimelineMarker[];
  decisionQualities: DecisionQualityItem[];
  currentIndex: number;
  onJump: (index: number) => void;
  className?: string;
}

const qualityColors: Record<Quality, string> = {
  good: 'bg-emerald-500',
  minor_deviation: 'bg-amber-500',
  major_deviation: 'bg-red-500',
};

const qualityBorder: Record<Quality, string> = {
  good: 'border-emerald-300',
  minor_deviation: 'border-amber-300',
  major_deviation: 'border-red-300',
};

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  markers,
  decisionQualities,
  currentIndex,
  onJump,
  className = '',
}) => {
  const qualityMap = new Map(decisionQualities.map((d) => [d.index, d.quality]));

  // Flatten all decision indices for the progress bar
  const allIndices = markers.flatMap((m) => m.decisionPointIndices);
  const maxIndex = allIndices.length > 0 ? Math.max(...allIndices) : 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Street sections */}
      <div className="flex gap-1">
        {markers.map((marker, mi) => {
          const sectionWidth = marker.decisionPointIndices.length;
          return (
            <div
              key={mi}
              className="flex-1 flex flex-col gap-1"
            >
              {/* Street label */}
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                {marker.label}
              </span>

              {/* Decision dots */}
              <div className="flex items-center justify-center gap-1.5">
                {marker.decisionPointIndices.map((idx) => {
                  const quality = qualityMap.get(idx);
                  const isCurrent = idx === currentIndex;
                  const dotColor = quality ? qualityColors[quality] : 'bg-gray-300';
                  const borderColor = quality ? qualityBorder[quality] : 'border-gray-200';

                  return (
                    <button
                      key={idx}
                      onClick={() => onJump(idx)}
                      className={`
                        w-4 h-4 rounded-full ${dotColor} transition-all
                        ${isCurrent ? `ring-2 ring-offset-1 ${borderColor} scale-125` : 'hover:scale-110'}
                      `}
                      aria-label={`Decision point ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: maxIndex > 0 ? `${(currentIndex / maxIndex) * 100}%` : '0%' }}
        />
      </div>
    </div>
  );
};

export default ReplayTimeline;