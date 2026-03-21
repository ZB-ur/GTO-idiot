'use client';

import type { Street, ActionType } from '@/engine/types';

interface ReplayFrame {
  index: number;
  type: string;
  street: Street;
  action?: {
    playerId: string;
    playerName: string;
    position: string;
    action: ActionType;
    amount?: number;
    street: Street;
    isUserAction?: boolean;
  };
  isUserDecisionPoint?: boolean;
}

interface DecisionPointAnalysis {
  frameIndex: number;
  street: Street;
  quality?: 'optimal' | 'good' | 'minor_mistake' | 'major_mistake';
}

interface ActionTimelineProps {
  frames: ReplayFrame[];
  decisionPoints: DecisionPointAnalysis[];
  currentFrame: number;
  onJumpToFrame: (index: number) => void;
}

const STREET_COLORS: Record<Street, string> = {
  preflop: '#6b7280',
  flop: '#3b82f6',
  turn: '#eab308',
  river: '#ef4444',
};

const QUALITY_COLORS: Record<string, string> = {
  optimal: '#22c55e',
  good: '#3b82f6',
  minor_mistake: '#eab308',
  major_mistake: '#ef4444',
};

export default function ActionTimeline({
  frames,
  decisionPoints,
  currentFrame,
  onJumpToFrame,
}: ActionTimelineProps) {
  const dpSet = new Map(decisionPoints.map((dp) => [dp.frameIndex, dp]));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <h4 className="text-gray-200 text-xs font-semibold uppercase tracking-wide mb-3">Action Timeline</h4>

      <div className="relative flex items-center gap-0.5 overflow-x-auto pb-2">
        {frames.map((frame, i) => {
          const dp = dpSet.get(i);
          const isCurrent = i === currentFrame;
          const isDP = !!dp;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onJumpToFrame(i)}
              className={`relative flex-shrink-0 transition-all ${
                isCurrent ? 'scale-125 z-10' : 'hover:scale-110'
              }`}
              title={frame.action ? `${frame.action.playerName}: ${frame.action.action}` : frame.type}
            >
              {/* Frame marker */}
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isCurrent ? 'border-white' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: isDP
                    ? QUALITY_COLORS[dp.quality ?? 'good']
                    : STREET_COLORS[frame.street],
                  opacity: isCurrent ? 1 : 0.6,
                }}
              />

              {/* Decision point indicator */}
              {isDP && (
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: QUALITY_COLORS[dp.quality ?? 'good'] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2">
        {(['preflop', 'flop', 'turn', 'river'] as Street[]).map((street) => (
          <div key={street} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STREET_COLORS[street] }} />
            <span className="text-gray-500 text-[10px] capitalize">{street}</span>
          </div>
        ))}
        <div className="w-px h-3 bg-gray-700" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500 text-[10px]">Decision</span>
        </div>
      </div>
    </div>
  );
}