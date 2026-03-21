// ============================================================
// GTO solver types — Evaluation, ranges, analysis
// ============================================================

import type { Card } from './cards';
import type { ActionLogEntry, ActionType, DecisionQuality, Position, Street } from './game';

// --- Preflop ranges ---

export interface PreflopRangeAction {
  handCombo: string;
  frequencies: {
    fold: number;
    call: number;
    raise: number;
  };
}

export type PreflopScenario = 'open' | 'vs_open' | 'vs_3bet' | 'vs_4bet';

export interface PreflopRange {
  position: Position;
  scenario: string;
  actions: PreflopRangeAction[];
}

// --- GTO evaluation ---

export interface GTOEvaluationRequest {
  holeCards: [Card, Card];
  communityCards: Card[];
  position: Position;
  potBB: number;
  stackBB: number;
  street: Street;
  activePlayers?: number;
  actionHistory: ActionLogEntry[];
}

export interface GTOActionEV {
  action: ActionType;
  amount: number | null;
  evBB: number;
  frequency: number;
}

export interface GTOEvaluationResult {
  actions: GTOActionEV[];
  recommendedAction: ActionType;
  recommendedAmount: number | null;
  handStrength: number;
  potOdds: number;
  spr: number;
  isDegraded: boolean;
}

// --- Batch evaluation ---

export interface GTOBatchRequest {
  handId: string;
}

export interface GameSnapshot {
  communityCards: Card[];
  potBB: number;
  playerStacks: {
    seat: number;
    stackBB: number;
    isActive: boolean;
  }[];
  userPosition: Position;
  userHoleCards: Card[];
}

export interface DecisionPointAnalysis {
  index: number;
  street: Street;
  gameSnapshot: GameSnapshot;
  userAction: {
    type: ActionType;
    amount: number | null;
    evBB: number;
  };
  gtoEvaluation: GTOEvaluationResult;
  evDiffBB: number;
  quality: DecisionQuality;
}

export interface GTOBatchResult {
  handId: string;
  decisionPoints: DecisionPointAnalysis[];
  totalEvLossBB: number;
}

// --- Decision quality thresholds (in BB) ---

export const EV_THRESHOLD_GOOD = 0.5;
export const EV_THRESHOLD_MINOR = 2.0;

export function classifyDecisionQuality(evDiffBB: number): DecisionQuality {
  const absLoss = Math.abs(evDiffBB);
  if (absLoss < EV_THRESHOLD_GOOD) return 'good';
  if (absLoss < EV_THRESHOLD_MINOR) return 'minor_deviation';
  return 'major_deviation';
}
