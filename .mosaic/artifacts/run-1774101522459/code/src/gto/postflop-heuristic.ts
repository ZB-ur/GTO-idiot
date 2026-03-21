// ============================================================
// Postflop Heuristic EV Engine — Simplified GTO strategy
// ============================================================
//
// Uses hand strength, pot odds, SPR, and board texture to produce
// EV estimates for each legal action. This is a heuristic approximation
// designed to run fast as a fallback when Monte Carlo times out.

import type { Card, Position, Street, ActionLogEntry } from '../types';
import type { GTOActionEV, GTOEvaluationResult } from '../types';
import { estimateHandStrength } from '../engine/hand-evaluator';

export interface PostflopContext {
  holeCards: [Card, Card];
  communityCards: Card[];
  position: Position;
  potBB: number;
  stackBB: number;
  street: Street;
  activePlayers: number;
  actionHistory: ActionLogEntry[];
}

/** Position advantage multiplier for postflop play */
const POSITION_ADVANTAGE: Record<Position, number> = {
  BTN: 1.08,
  CO: 1.04,
  MP: 1.00,
  UTG: 0.96,
  SB: 0.92,
  BB: 0.95,
};

/**
 * Compute heuristic GTO evaluation for a postflop decision point.
 * Returns EV estimates for all legal actions.
 */
export function evaluatePostflop(ctx: PostflopContext): GTOEvaluationResult {
  const handStrength = estimateHandStrength(
    ctx.holeCards,
    ctx.communityCards,
    200 // lighter sim count for heuristic
  );

  const posAdj = POSITION_ADVANTAGE[ctx.position];
  const adjustedStrength = Math.min(1, handStrength * posAdj);

  const potOdds = calculatePotOdds(ctx);
  const spr = ctx.potBB > 0 ? ctx.stackBB / ctx.potBB : Infinity;
  const facingBet = isFacingBet(ctx.actionHistory, ctx.street);
  const betToCall = facingBet ? getAmountToCall(ctx) : 0;

  const actions: GTOActionEV[] = [];

  // --- Fold ---
  if (facingBet) {
    actions.push({
      action: 'fold',
      amount: null,
      evBB: 0, // EV of folding is 0 (we don't lose more)
      frequency: 0,
    });
  }

  // --- Check ---
  if (!facingBet) {
    const checkEV = computeCheckEV(adjustedStrength, ctx.potBB, ctx.activePlayers);
    actions.push({
      action: 'check',
      amount: null,
      evBB: checkEV,
      frequency: 0,
    });
  }

  // --- Call ---
  if (facingBet && betToCall > 0) {
    const callEV = computeCallEV(adjustedStrength, ctx.potBB, betToCall, ctx.activePlayers);
    actions.push({
      action: 'call',
      amount: betToCall,
      evBB: callEV,
      frequency: 0,
    });
  }

  // --- Bet (when not facing a bet) ---
  if (!facingBet) {
    const betSizes = computeBetSizes(ctx.potBB, ctx.stackBB, spr);
    for (const betSize of betSizes) {
      const betEV = computeBetEV(adjustedStrength, ctx.potBB, betSize, ctx.activePlayers, spr);
      actions.push({
        action: 'bet',
        amount: betSize,
        evBB: betEV,
        frequency: 0,
      });
    }
  }

  // --- Raise (when facing a bet) ---
  if (facingBet) {
    const raiseSizes = computeRaiseSizes(betToCall, ctx.potBB, ctx.stackBB);
    for (const raiseSize of raiseSizes) {
      const raiseEV = computeRaiseEV(adjustedStrength, ctx.potBB, raiseSize, betToCall, ctx.activePlayers, spr);
      actions.push({
        action: 'raise',
        amount: raiseSize,
        evBB: raiseEV,
        frequency: 0,
      });
    }
  }

  // --- All-in ---
  if (ctx.stackBB > 0) {
    const allInEV = computeAllInEV(adjustedStrength, ctx.potBB, ctx.stackBB, betToCall, ctx.activePlayers);
    actions.push({
      action: 'all_in',
      amount: ctx.stackBB,
      evBB: allInEV,
      frequency: 0,
    });
  }

  // Compute frequencies from EV values
  assignFrequencies(actions);

  // Find recommended action (highest EV)
  const best = actions.reduce((a, b) => (b.evBB > a.evBB ? b : a), actions[0]);

  return {
    actions,
    recommendedAction: best.action,
    recommendedAmount: best.amount,
    handStrength: adjustedStrength,
    potOdds,
    spr: isFinite(spr) ? spr : 99,
    isDegraded: true, // heuristic is always "degraded"
  };
}

// ============================================================
// EV computation helpers
// ============================================================

function computeCheckEV(strength: number, potBB: number, players: number): number {
  // EV of checking: our equity * pot, discounted by multi-way factor
  const multiWayDiscount = 1 / Math.sqrt(Math.max(players - 1, 1));
  return strength * potBB * multiWayDiscount;
}

function computeCallEV(
  strength: number,
  potBB: number,
  callAmount: number,
  players: number
): number {
  const totalPot = potBB + callAmount;
  const multiWayDiscount = 1 / Math.sqrt(Math.max(players - 1, 1));
  const equity = strength * multiWayDiscount;
  // EV = equity * (pot + call) - (1 - equity) * call
  return equity * totalPot - (1 - equity) * callAmount;
}

function computeBetEV(
  strength: number,
  potBB: number,
  betSize: number,
  players: number,
  _spr: number
): number {
  // Fold equity estimation based on bet size relative to pot
  const betRatio = betSize / Math.max(potBB, 0.5);
  const baseFoldEquity = Math.min(0.7, betRatio * 0.3 + 0.1);
  const foldEquity = baseFoldEquity / Math.sqrt(Math.max(players - 1, 1));

  // When called: our equity * (pot + bet + call) - (1 - equity) * bet
  const calledPot = potBB + betSize * 2;
  const equityWhenCalled = strength;
  const evWhenCalled = equityWhenCalled * calledPot - (1 - equityWhenCalled) * betSize;

  // Blended EV
  const evWhenFold = potBB;
  return foldEquity * evWhenFold + (1 - foldEquity) * evWhenCalled;
}

function computeRaiseEV(
  strength: number,
  potBB: number,
  raiseSize: number,
  callAmount: number,
  players: number,
  _spr: number
): number {
  const totalInvestment = raiseSize;
  const betRatio = raiseSize / Math.max(potBB + callAmount, 0.5);
  const baseFoldEquity = Math.min(0.75, betRatio * 0.25 + 0.15);
  const foldEquity = baseFoldEquity / Math.sqrt(Math.max(players - 1, 1));

  const calledPot = potBB + raiseSize * 2;
  const evWhenCalled = strength * calledPot - (1 - strength) * totalInvestment;
  const evWhenFold = potBB + callAmount;

  return foldEquity * evWhenFold + (1 - foldEquity) * evWhenCalled;
}

function computeAllInEV(
  strength: number,
  potBB: number,
  stackBB: number,
  callAmount: number,
  players: number
): number {
  const totalPot = potBB + stackBB + Math.min(stackBB, callAmount) * (players - 1);
  const multiWayDiscount = 1 / Math.sqrt(Math.max(players - 1, 1));
  const equity = strength * multiWayDiscount;
  return equity * totalPot - (1 - equity) * stackBB;
}

// ============================================================
// Sizing helpers
// ============================================================

function computeBetSizes(potBB: number, stackBB: number, spr: number): number[] {
  const sizes: number[] = [];
  const minBet = 1; // 1 BB minimum

  if (spr <= 1) {
    // Low SPR: just shove or check
    return [];
  }

  // Small bet: 33% pot
  const smallBet = Math.max(minBet, Math.round(potBB * 0.33 * 10) / 10);
  if (smallBet <= stackBB) sizes.push(smallBet);

  // Medium bet: 66% pot
  const medBet = Math.max(minBet, Math.round(potBB * 0.66 * 10) / 10);
  if (medBet <= stackBB && medBet > smallBet) sizes.push(medBet);

  // Large bet: pot
  const largeBet = Math.max(minBet, Math.round(potBB * 10) / 10);
  if (largeBet <= stackBB && largeBet > medBet) sizes.push(largeBet);

  return sizes.length > 0 ? sizes : [minBet];
}

function computeRaiseSizes(
  callAmount: number,
  potBB: number,
  stackBB: number
): number[] {
  const sizes: number[] = [];
  const minRaise = callAmount * 2;

  // Standard raise: 3x the bet
  const stdRaise = Math.max(minRaise, callAmount * 3);
  if (stdRaise <= stackBB) sizes.push(Math.round(stdRaise * 10) / 10);

  // Pot-sized raise
  const potRaise = potBB + callAmount * 2;
  if (potRaise <= stackBB && potRaise > stdRaise * 1.1) {
    sizes.push(Math.round(potRaise * 10) / 10);
  }

  if (sizes.length === 0 && minRaise <= stackBB) {
    sizes.push(Math.round(minRaise * 10) / 10);
  }

  return sizes;
}

// ============================================================
// Action history helpers
// ============================================================

function isFacingBet(actionHistory: ActionLogEntry[], currentStreet: Street): boolean {
  // Look at current street actions for a bet/raise we need to respond to
  const streetActions = actionHistory.filter((a) => a.street === currentStreet);
  if (streetActions.length === 0) return false;

  const lastAggressive = [...streetActions]
    .reverse()
    .find((a) => a.action === 'bet' || a.action === 'raise' || a.action === 'all_in');

  return lastAggressive !== undefined;
}

function getAmountToCall(ctx: PostflopContext): number {
  const streetActions = ctx.actionHistory.filter((a) => a.street === ctx.street);
  const lastAggressive = [...streetActions]
    .reverse()
    .find((a) => a.action === 'bet' || a.action === 'raise' || a.action === 'all_in');

  if (!lastAggressive || lastAggressive.amount === null) return 1; // default 1 BB
  return Math.min(lastAggressive.amount, ctx.stackBB);
}

function calculatePotOdds(ctx: PostflopContext): number {
  const callAmount = isFacingBet(ctx.actionHistory, ctx.street)
    ? getAmountToCall(ctx)
    : 0;
  if (callAmount <= 0) return 0;
  return callAmount / (ctx.potBB + callAmount);
}

// ============================================================
// Frequency assignment
// ============================================================

/**
 * Convert EV values into GTO-like mixed strategy frequencies.
 * Uses softmax-inspired weighting where positive EV actions get
 * proportionally higher frequencies.
 */
function assignFrequencies(actions: GTOActionEV[]): void {
  if (actions.length === 0) return;

  // Shift EVs so minimum is 0, then apply softmax-like weighting
  const minEV = Math.min(...actions.map((a) => a.evBB));
  const shifted = actions.map((a) => Math.max(0, a.evBB - minEV));
  const total = shifted.reduce((s, v) => s + v, 0);

  if (total === 0) {
    // All equal EV: distribute evenly
    const even = 1 / actions.length;
    for (const a of actions) {
      a.frequency = Math.round(even * 100) / 100;
    }
    return;
  }

  for (let i = 0; i < actions.length; i++) {
    actions[i].frequency = Math.round((shifted[i] / total) * 100) / 100;
  }

  // Ensure frequencies sum to 1
  const freqSum = actions.reduce((s, a) => s + a.frequency, 0);
  if (freqSum > 0 && Math.abs(freqSum - 1) > 0.01) {
    const scale = 1 / freqSum;
    for (const a of actions) {
      a.frequency = Math.round(a.frequency * scale * 100) / 100;
    }
  }
}
