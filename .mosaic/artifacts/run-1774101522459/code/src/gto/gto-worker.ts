// ============================================================
// GTO Web Worker — Runs Monte Carlo simulation off main thread
// ============================================================
//
// This file is the Web Worker entry point. It receives evaluation
// requests from the main thread and runs Monte Carlo simulations.
// Supports timeout and graceful degradation to heuristic fallback.

import { runMonteCarloSimulation, type MonteCarloInput, type MonteCarloConfig } from './monte-carlo';
import { evaluatePostflop, type PostflopContext } from './postflop-heuristic';
import type { GTOEvaluationResult, ActionType } from '../types';

// ============================================================
// Worker message types
// ============================================================

export interface WorkerRequest {
  id: string;
  type: 'evaluate';
  payload: WorkerEvaluatePayload;
}

export interface WorkerEvaluatePayload {
  context: PostflopContext;
  config?: Partial<MonteCarloConfig>;
}

export interface WorkerResponse {
  id: string;
  type: 'result' | 'error';
  payload: GTOEvaluationResult | { message: string };
}

// ============================================================
// Worker message handler
// ============================================================

const ctx = self as unknown as Worker;

ctx.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    switch (request.type) {
      case 'evaluate': {
        const result = handleEvaluate(request.payload);
        const response: WorkerResponse = {
          id: request.id,
          type: 'result',
          payload: result,
        };
        ctx.postMessage(response);
        break;
      }
      default: {
        const response: WorkerResponse = {
          id: request.id,
          type: 'error',
          payload: { message: `Unknown request type: ${request.type}` },
        };
        ctx.postMessage(response);
      }
    }
  } catch (err) {
    const response: WorkerResponse = {
      id: request.id,
      type: 'error',
      payload: { message: err instanceof Error ? err.message : 'Unknown error' },
    };
    ctx.postMessage(response);
  }
});

/**
 * Handle an evaluation request: try Monte Carlo, fall back to heuristic.
 */
function handleEvaluate(payload: WorkerEvaluatePayload): GTOEvaluationResult {
  const { context, config } = payload;
  const timeoutMs = config?.timeoutMs ?? 5000;

  // Build actions to evaluate
  const actionsToEval = buildActionsToEval(context);

  // Try Monte Carlo first
  try {
    const input: MonteCarloInput = {
      holeCards: context.holeCards,
      communityCards: context.communityCards,
      potBB: context.potBB,
      stackBB: context.stackBB,
      actionsToEval,
    };

    const mcConfig: Partial<MonteCarloConfig> = {
      iterations: config?.iterations ?? 1000,
      timeoutMs,
      opponents: Math.max(1, (context.activePlayers ?? 2) - 1),
    };

    const { result: actions, isDegraded, handStrength } = runMonteCarloSimulation(input, mcConfig);

    // Find best action
    const best = actions.reduce((a, b) => (b.evBB > a.evBB ? b : a), actions[0]);

    const potOdds = computePotOdds(context);
    const spr = context.potBB > 0 ? context.stackBB / context.potBB : 99;

    return {
      actions,
      recommendedAction: best.action,
      recommendedAmount: best.amount,
      handStrength,
      potOdds,
      spr: isFinite(spr) ? spr : 99,
      isDegraded,
    };
  } catch {
    // Fall back to heuristic on any error
    return evaluatePostflop(context);
  }
}

/**
 * Determine which actions to evaluate based on game context.
 */
function buildActionsToEval(
  ctx: PostflopContext
): { action: ActionType; amount: number | null }[] {
  const actions: { action: ActionType; amount: number | null }[] = [];
  const facingBet = hasFacingBet(ctx);

  if (facingBet) {
    actions.push({ action: 'fold', amount: null });

    const callAmount = getCallAmount(ctx);
    actions.push({ action: 'call', amount: callAmount });

    // Standard raise sizes
    const minRaise = callAmount * 2;
    if (minRaise <= ctx.stackBB) {
      actions.push({ action: 'raise', amount: Math.round(minRaise * 10) / 10 });
    }
    const potRaise = ctx.potBB + callAmount * 2;
    if (potRaise <= ctx.stackBB && potRaise > minRaise * 1.2) {
      actions.push({ action: 'raise', amount: Math.round(potRaise * 10) / 10 });
    }
  } else {
    actions.push({ action: 'check', amount: null });

    // Bet sizes: 33%, 66%, 100% pot
    const betSizes = [0.33, 0.66, 1.0];
    for (const pct of betSizes) {
      const bet = Math.max(1, Math.round(ctx.potBB * pct * 10) / 10);
      if (bet <= ctx.stackBB) {
        actions.push({ action: 'bet', amount: bet });
      }
    }
  }

  // Always include all-in
  if (ctx.stackBB > 0) {
    actions.push({ action: 'all_in', amount: ctx.stackBB });
  }

  return actions;
}

function hasFacingBet(ctx: PostflopContext): boolean {
  const streetActions = ctx.actionHistory.filter((a) => a.street === ctx.street);
  return streetActions.some(
    (a) => a.action === 'bet' || a.action === 'raise' || a.action === 'all_in'
  );
}

function getCallAmount(ctx: PostflopContext): number {
  const streetActions = ctx.actionHistory.filter((a) => a.street === ctx.street);
  const lastAgg = [...streetActions]
    .reverse()
    .find((a) => a.action === 'bet' || a.action === 'raise' || a.action === 'all_in');
  if (!lastAgg || lastAgg.amount === null) return 1;
  return Math.min(lastAgg.amount, ctx.stackBB);
}

function computePotOdds(ctx: PostflopContext): number {
  if (!hasFacingBet(ctx)) return 0;
  const callAmount = getCallAmount(ctx);
  return callAmount / (ctx.potBB + callAmount);
}
