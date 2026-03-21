// ============================================================
// ReplayTimeline — Interactive timeline with street segments,
// step markers, decision point indicators, and navigation
// ============================================================

import React, { useMemo, useCallback } from 'react';
import type { HandReplayData, DecisionQuality, Street } from '../../types';
import type { ReplayState } from '../../replay/replay-engine';
import {
  buildTimelineSteps,
  buildTimelineSegments,
  getTimelineProgress,
  type TimelineSegment,
} from '../../replay/timeline';

interface ReplayTimelineProps {
  replayData: HandReplayData;
  state: ReplayState;
  onGoToStep: (step: number) => void;
  onGoToDecision: (dpIndex: number) => void;
}

// ============================================================
// Quality dot colors
// ============================================================

const QUALITY_DOT: Record<DecisionQuality, string> = {
  good: 'bg-green-400',
  minor_deviation: 'bg-yellow-400',
  major_deviation: 'bg-red-400',
};

const STREET_COLORS: Record<Street, string> = {
  preflop: 'bg-gray-600',
  flop: 'bg-blue-600',
  turn: 'bg-purple-600',
  river: 'bg-amber-600',
};

// ============================================================
// Main Component
// ============================================================

const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  replayData,
  state,
  onGoToStep,
  onGoToDecision,
}) => {
  const { handHistory, decisionPoints, timelineMarkers } = replayData;
  const userSeat = useMemo(() => {
    const human = handHistory.seats.find((s) => s.isHuman);
    return human?.seat ?? 0;
  }, [handHistory]);

  const steps = useMemo(
    () => buildTimelineSteps(handHistory.actionSequence, userSeat, decisionPoints),
    [handHistory, userSeat, decisionPoints],
  );

  const segments = useMemo(
    () => buildTimelineSegments(steps, timelineMarkers),
    [steps, timelineMarkers],
  );

  const progress = getTimelineProgress(state.stepIndex, state.totalSteps);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const step = Math.round(pct * (state.totalSteps - 1));
      onGoToStep(Math.max(0, Math.min(step, state.totalSteps - 1)));
    },
    [state.totalSteps, onGoToStep],
  );

  return (
    <div className="space-y-2">
      {/* Street segment labels */}
      <div className="flex gap-1">
        {segments.map((seg) => (
          <SegmentLabel
            key={seg.street}
            segment={seg}
            totalSteps={state.totalSteps}
            isActive={state.street === seg.street}
            onClick={() => onGoToStep(seg.startStep)}
          />
        ))}
      </div>

      {/* Main timeline track */}
      <div
        className="relative h-6 bg-gray-800 rounded-full cursor-pointer group"
        onClick={handleTrackClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={state.totalSteps - 1}
        aria-valuenow={state.stepIndex}
        aria-label="Replay timeline"
        tabIndex={0}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />

        {/* Street segment dividers */}
        {segments.slice(1).map((seg) => {
          const pct = ((seg.startStep) / (state.totalSteps - 1)) * 100;
          return (
            <div
              key={seg.street}
              className="absolute top-0 w-0.5 h-full bg-gray-600/50"
              style={{ left: `${pct}%` }}
            />
          );
        })}

        {/* Decision point markers */}
        {steps.filter((s) => s.isUserDecision).map((step) => {
          const pct = ((step.index) / (state.totalSteps - 1)) * 100;
          const dp = step.decisionPointIndex >= 0
            ? decisionPoints[step.decisionPointIndex]
            : null;
          const dotColor = dp ? QUALITY_DOT[dp.quality] : 'bg-gray-400';

          return (
            <button
              key={step.index}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gray-900
                         ${dotColor} hover:scale-150 transition-transform z-10`}
              style={{ left: `${pct}%`, marginLeft: '-6px' }}
              onClick={(e) => {
                e.stopPropagation();
                if (step.decisionPointIndex >= 0) {
                  onGoToDecision(step.decisionPointIndex);
                } else {
                  onGoToStep(step.index);
                }
              }}
              title={dp ? `Decision: ${dp.quality.replace('_', ' ')} (${dp.evDiffBB.toFixed(2)} BB)` : 'User action'}
            />
          );
        })}

        {/* Current position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg
                     shadow-blue-500/30 border-2 border-blue-400 transition-all duration-150 z-20"
          style={{ left: `${progress}%`, marginLeft: '-8px' }}
        />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Step {state.stepIndex + 1} / {state.totalSteps}
        </span>
        <span className="capitalize">
          {state.street}
          {state.lastAction && (
            <span className="text-gray-400 ml-1">
              — {state.lastAction.playerName} {state.lastAction.action.replace('_', '-')}
              {state.lastAction.amount != null && state.lastAction.amount > 0 && (
                <span> {state.lastAction.amount.toFixed(1)} BB</span>
              )}
            </span>
          )}
        </span>
        <span>
          {decisionPoints.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Good
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Minor
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Major
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

// ============================================================
// Segment Label
// ============================================================

function SegmentLabel({
  segment,
  totalSteps,
  isActive,
  onClick,
}: {
  segment: TimelineSegment;
  totalSteps: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const widthPct = (segment.stepCount / totalSteps) * 100;
  const streetColor = STREET_COLORS[segment.street];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase
                 transition-colors ${
                   isActive
                     ? 'bg-gray-700 text-white'
                     : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'
                 }`}
      style={{ flex: `${widthPct} 0 0%`, minWidth: 'fit-content' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${streetColor}`} />
      {segment.label}
      {segment.decisionPointIndices.length > 0 && (
        <span className="text-gray-600">({segment.decisionPointIndices.length})</span>
      )}
    </button>
  );
}

export default React.memo(ReplayTimeline);
