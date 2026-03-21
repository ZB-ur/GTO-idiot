// ============================================================
// GTO Idiot — GTO Hint Service
// Provides real-time GTO hints during gameplay.
// Routes preflop to range tables, postflop to CFR solver.
// Records hint views into hand history.
// ============================================================

import type {
  Card,
  Position,
  ActionRecord,
  HandState,
  HintResponse,
  GTOAdvice,
  GTOAdviceDegraded,
  PreflopRangeTable,
  PreflopScenario,
  HandHistoryAction,
} from '../types';
import { getPreflopAdvice } from '../gto/preflop-advisor';
import { solvePostflop } from '../gto/postflop-solver';
import { getPreflopRangeTable } from '../gto/preflop-ranges';

// ============================================================
// Hint request context
// ============================================================

export interface HintContext {
  handId: string;
  handState: HandState;
  heroCards: Card[];
  heroPosition: Position;
  heroSeat: number;
  actionHistory: ActionRecord[];
  /** Decision point index (1-based) for this hint request */
  decisionPoint: number;
}

// ============================================================
// Public API
// ============================================================

/**
 * Get a GTO hint for the current decision point.
 * Automatically routes to preflop range lookup or postflop CFR solver.
 */
export function getHint(context: HintContext): HintResponse {
  const { handId, handState, heroCards, heroPosition, actionHistory, decisionPoint } = context;
  const street = handState.street;

  let advice: GTOAdvice | GTOAdviceDegraded;
  let isDegraded = false;

  if (street === 'preflop') {
    advice = getPreflopAdvice({
      position: heroPosition,
      hole_cards: heroCards,
      action_history: actionHistory,
    });
  } else {
    // Postflop: use CFR solver
    const effectiveStack = getEffectiveStack(handState, context.heroSeat);

    const result = solvePostflop(
      {
        hero_position: heroPosition,
        hero_cards: heroCards,
        community_cards: handState.community_cards,
        pot: handState.pot,
        effective_stack: effectiveStack,
        street,
        action_history: actionHistory,
      },
      { timeBudgetMs: 500, maxIterations: 1000 },
    );

    advice = result.advice;
    isDegraded = 'is_degraded' in advice && advice.is_degraded === true;
  }

  return {
    hand_id: handId,
    street,
    decision_point: decisionPoint,
    advice: {
      actions: advice.actions,
      recommended_action: advice.recommended_action,
      is_approximate: advice.is_approximate,
      computation_time_ms: advice.computation_time_ms,
    },
    hint_viewed: true,
    is_degraded: isDegraded,
  };
}

/**
 * Get preflop range table for display in the UI.
 * Wraps the preflop-ranges module with the API response shape.
 */
export function getPreflopRanges(
  position: Position,
  scenario: PreflopScenario,
  openPosition?: Position,
): PreflopRangeTable {
  return getPreflopRangeTable(position, scenario, openPosition);
}

/**
 * Build a HintContext from the current game state.
 * Helper for the game controller to construct hint requests easily.
 */
export function buildHintContext(
  handState: HandState,
  heroCards: Card[],
  heroPosition: Position,
  heroSeat: number,
  allActions: HandHistoryAction[],
  decisionPoint: number,
): HintContext {
  // Convert HandHistoryAction[] to ActionRecord[]
  // Include only actions before the current decision point
  const actionHistory: ActionRecord[] = allActions
    .filter((a) => a.sequence < decisionPoint)
    .map((a) => ({
      seat: a.seat,
      position: a.position,
      action: a.action,
      amount: a.amount,
      street: a.street,
    }));

  return {
    handId: handState.id,
    handState,
    heroCards,
    heroPosition,
    heroSeat,
    actionHistory,
    decisionPoint,
  };
}

// ============================================================
// Internal helpers
// ============================================================

/**
 * Calculate effective stack (minimum of hero and active villain stacks).
 */
function getEffectiveStack(handState: HandState, heroSeat: number): number {
  const heroPlayer = handState.players.find((p) => p.seat === heroSeat);
  if (!heroPlayer) return 0;

  const activeVillains = handState.players.filter(
    (p) => p.seat !== heroSeat && p.is_active && !p.is_all_in,
  );

  if (activeVillains.length === 0) {
    return heroPlayer.stack;
  }

  // Effective stack = min(hero stack, smallest active villain stack)
  const minVillainStack = Math.min(...activeVillains.map((p) => p.stack));
  return Math.min(heroPlayer.stack, minVillainStack);
}
