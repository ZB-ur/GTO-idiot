// ============================================================
// Timeline — Step/street/decision-point mapping utilities
// ============================================================

import type { Street, ActionLogEntry } from '../types';
import type { TimelineMarker } from '../types';
import type { DecisionPointAnalysis } from '../types';

// ============================================================
// Types
// ============================================================

export interface TimelineStep {
  /** Global step index (0 = initial deal) */
  index: number;
  /** Street this step belongs to */
  street: Street;
  /** Label for display */
  label: string;
  /** Whether this step is a user decision point */
  isUserDecision: boolean;
  /** Decision point index (-1 if not a user decision) */
  decisionPointIndex: number;
  /** The action at this step (null for initial) */
  action: ActionLogEntry | null;
}

export interface TimelineSegment {
  /** Street name */
  street: Street;
  /** Display label */
  label: string;
  /** First step index in this segment */
  startStep: number;
  /** Last step index in this segment (inclusive) */
  endStep: number;
  /** Number of steps in this segment */
  stepCount: number;
  /** Decision points in this segment */
  decisionPointIndices: number[];
}

// ============================================================
// Build timeline steps from action sequence
// ============================================================

export function buildTimelineSteps(
  actions: ActionLogEntry[],
  userSeat: number,
  decisionPoints: DecisionPointAnalysis[],
): TimelineStep[] {
  const steps: TimelineStep[] = [];

  // Step 0: initial deal
  steps.push({
    index: 0,
    street: 'preflop',
    label: 'Deal',
    isUserDecision: false,
    decisionPointIndex: -1,
    action: null,
  });

  let userDecisionCount = 0;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const isUser = action.seat === userSeat;

    let dpIndex = -1;
    if (isUser) {
      dpIndex = decisionPoints.findIndex((dp) => dp.index === userDecisionCount);
      userDecisionCount++;
    }

    const label = formatActionLabel(action);

    steps.push({
      index: i + 1,
      street: action.street,
      label,
      isUserDecision: isUser,
      decisionPointIndex: dpIndex,
      action,
    });
  }

  return steps;
}

// ============================================================
// Build timeline segments (grouped by street)
// ============================================================

export function buildTimelineSegments(
  steps: TimelineStep[],
  markers: TimelineMarker[],
): TimelineSegment[] {
  const segments: TimelineSegment[] = [];

  for (const marker of markers) {
    const streetSteps = steps.filter((s) => s.street === marker.street);
    if (streetSteps.length === 0) continue;

    segments.push({
      street: marker.street,
      label: marker.label,
      startStep: streetSteps[0].index,
      endStep: streetSteps[streetSteps.length - 1].index,
      stepCount: streetSteps.length,
      decisionPointIndices: marker.decisionPointIndices,
    });
  }

  return segments;
}

// ============================================================
// Find next/previous decision point from a step
// ============================================================

export function findNextDecisionStep(
  steps: TimelineStep[],
  fromStep: number,
): number {
  for (let i = fromStep + 1; i < steps.length; i++) {
    if (steps[i].isUserDecision) return steps[i].index;
  }
  return -1;
}

export function findPrevDecisionStep(
  steps: TimelineStep[],
  fromStep: number,
): number {
  for (let i = fromStep - 1; i >= 0; i--) {
    if (steps[i].isUserDecision) return steps[i].index;
  }
  return -1;
}

// ============================================================
// Helpers
// ============================================================

function formatActionLabel(action: ActionLogEntry): string {
  const name = action.playerName.replace('BOT-', '');
  const act = action.action.replace('_', '-');

  if (action.amount != null && action.amount > 0) {
    return `${name} ${act} ${action.amount.toFixed(1)}BB`;
  }
  return `${name} ${act}`;
}

/** Get a progress percentage (0–100) for a given step */
export function getTimelineProgress(step: number, totalSteps: number): number {
  if (totalSteps <= 1) return 100;
  return Math.round((step / (totalSteps - 1)) * 100);
}
