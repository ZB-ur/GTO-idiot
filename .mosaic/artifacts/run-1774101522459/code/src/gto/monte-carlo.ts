// ============================================================
// Monte Carlo GTO Simulation — EV estimation via simulation
// ============================================================
//
// Runs Monte Carlo simulations to estimate EV for each possible action.
// Designed to run in a Web Worker for non-blocking computation.

import type { Card, ActionType } from '../types';
import type { GTOActionEV } from '../types';
import { evaluateHand, compareHands } from '../engine/hand-evaluator';
import { RANKS, SUITS } from '../types';
import type { Rank, Suit } from '../types';

export interface MonteCarloConfig {
  /** Number of simulations per action (default 1000) */
  iterations: number;
  /** Timeout in ms (default 5000) */
  timeoutMs: number;
  /** Number of opponent players to simulate against */
  opponents: number;
}

export interface MonteCarloInput {
  holeCards: [Card, Card];
  communityCards: Card[];
  potBB: number;
  stackBB: number;
  /** Actions to evaluate with their bet amounts */
  actionsToEval: { action: ActionType; amount: number | null }[];
}

const DEFAULT_CONFIG: MonteCarloConfig = {
  iterations: 1000,
  timeoutMs: 5000,
  opponents: 1,
};

/**
 * Run Monte Carlo simulation to estimate EV for each action.
 * Returns results or partial results if timeout is reached.
 */
export function runMonteCarloSimulation(
  input: MonteCarloInput,
  config: Partial<MonteCarloConfig> = {}
): { result: GTOActionEV[]; isDegraded: boolean; handStrength: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  const knownCards = new Set(
    [...input.holeCards, ...input.communityCards].map(cardKey)
  );
  const remainingDeck = buildRemainingDeck(knownCards);
  const communityNeeded = 5 - input.communityCards.length;

  let totalWins = 0;
  let totalSims = 0;
  let timedOut = false;

  // First pass: estimate raw hand strength
  const strengthIterations = Math.min(cfg.iterations, 500);
  for (let i = 0; i < strengthIterations; i++) {
    if (Date.now() - startTime > cfg.timeoutMs * 0.4) {
      timedOut = true;
      break;
    }

    const shuffled = fisherYatesShuffle(remainingDeck);
    let idx = 0;

    const fullCommunity = [...input.communityCards];
    for (let j = 0; j < communityNeeded; j++) {
      fullCommunity.push(shuffled[idx++]);
    }

    let wins = 0;
    let ties = 0;
    for (let opp = 0; opp < cfg.opponents; opp++) {
      const oppHole: [Card, Card] = [shuffled[idx++], shuffled[idx++]];
      const myHand = evaluateHand([...input.holeCards, ...fullCommunity]);
      const oppHand = evaluateHand([...oppHole, ...fullCommunity]);
      const cmp = compareHands(myHand, oppHand);
      if (cmp > 0) wins++;
      else if (cmp === 0) ties++;
    }

    if (wins === cfg.opponents) totalWins++;
    else if (wins + ties >= cfg.opponents) totalWins += 0.5;
    totalSims++;
  }

  const handStrength = totalSims > 0 ? totalWins / totalSims : 0.5;

  // Second pass: compute EV for each action
  const actionResults: GTOActionEV[] = [];

  for (const actionSpec of input.actionsToEval) {
    if (Date.now() - startTime > cfg.timeoutMs * 0.9) {
      timedOut = true;
      // Use heuristic fallback for remaining actions
      actionResults.push({
        action: actionSpec.action,
        amount: actionSpec.amount,
        evBB: estimateActionEV(actionSpec, handStrength, input.potBB, input.stackBB),
        frequency: 0,
      });
      continue;
    }

    const ev = simulateActionEV(
      actionSpec,
      input,
      remainingDeck,
      communityNeeded,
      cfg,
      handStrength,
      startTime
    );

    actionResults.push({
      action: actionSpec.action,
      amount: actionSpec.amount,
      evBB: Math.round(ev * 100) / 100,
      frequency: 0,
    });
  }

  // Assign frequencies based on EV
  assignFrequencies(actionResults);

  return {
    result: actionResults,
    isDegraded: timedOut,
    handStrength,
  };
}

/**
 * Simulate the EV of a specific action via Monte Carlo.
 */
function simulateActionEV(
  actionSpec: { action: ActionType; amount: number | null },
  input: MonteCarloInput,
  deck: Card[],
  communityNeeded: number,
  cfg: MonteCarloConfig,
  handStrength: number,
  startTime: number
): number {
  const iterPerAction = Math.floor(cfg.iterations / Math.max(input.actionsToEval.length, 1));
  let totalEV = 0;
  let count = 0;

  for (let i = 0; i < iterPerAction; i++) {
    if (Date.now() - startTime > cfg.timeoutMs * 0.85) break;

    const shuffled = fisherYatesShuffle(deck);
    let idx = 0;

    const fullCommunity = [...input.communityCards];
    for (let j = 0; j < communityNeeded; j++) {
      fullCommunity.push(shuffled[idx++]);
    }

    // Simulate opponent hands
    let weWin = true;
    let isTie = true;
    for (let opp = 0; opp < cfg.opponents; opp++) {
      const oppHole: [Card, Card] = [shuffled[idx++], shuffled[idx++]];
      const myHand = evaluateHand([...input.holeCards, ...fullCommunity]);
      const oppHand = evaluateHand([...oppHole, ...fullCommunity]);
      const cmp = compareHands(myHand, oppHand);
      if (cmp < 0) {
        weWin = false;
        isTie = false;
        break;
      }
      if (cmp > 0) isTie = false;
    }

    totalEV += computeSimulatedEV(
      actionSpec,
      weWin,
      isTie,
      input.potBB,
      input.stackBB
    );
    count++;
  }

  return count > 0 ? totalEV / count : estimateActionEV(actionSpec, handStrength, input.potBB, input.stackBB);
}

/**
 * Compute EV for a single simulation outcome.
 */
function computeSimulatedEV(
  actionSpec: { action: ActionType; amount: number | null },
  weWin: boolean,
  isTie: boolean,
  potBB: number,
  stackBB: number
): number {
  const amount = actionSpec.amount ?? 0;

  switch (actionSpec.action) {
    case 'fold':
      return 0;

    case 'check':
      if (weWin) return potBB;
      if (isTie) return potBB * 0.5;
      return 0;

    case 'call':
      if (weWin) return potBB + amount;
      if (isTie) return (potBB + amount) * 0.5 - amount * 0.5;
      return -amount;

    case 'bet':
    case 'raise': {
      // Simplified: assume opponent calls ~40% of the time
      const foldProb = 0.6;
      if (weWin) {
        return foldProb * potBB + (1 - foldProb) * (potBB + amount * 2);
      }
      if (isTie) {
        return foldProb * potBB + (1 - foldProb) * ((potBB + amount * 2) * 0.5 - amount * 0.5);
      }
      return foldProb * potBB + (1 - foldProb) * (-amount);
    }

    case 'all_in': {
      const foldProb = 0.7;
      if (weWin) {
        return foldProb * potBB + (1 - foldProb) * (potBB + stackBB * 2);
      }
      if (isTie) {
        return foldProb * potBB + (1 - foldProb) * ((potBB + stackBB * 2) * 0.5 - stackBB * 0.5);
      }
      return foldProb * potBB + (1 - foldProb) * (-stackBB);
    }

    default:
      return 0;
  }
}

/**
 * Quick heuristic EV estimate (fallback when simulation times out).
 */
function estimateActionEV(
  actionSpec: { action: ActionType; amount: number | null },
  handStrength: number,
  potBB: number,
  stackBB: number
): number {
  const amount = actionSpec.amount ?? 0;

  switch (actionSpec.action) {
    case 'fold':
      return 0;
    case 'check':
      return handStrength * potBB;
    case 'call':
      return handStrength * (potBB + amount) - (1 - handStrength) * amount;
    case 'bet':
    case 'raise': {
      const foldEq = Math.min(0.6, amount / Math.max(potBB, 0.5) * 0.3);
      return foldEq * potBB + (1 - foldEq) * (handStrength * (potBB + amount * 2) - (1 - handStrength) * amount);
    }
    case 'all_in': {
      const foldEq = 0.5;
      return foldEq * potBB + (1 - foldEq) * (handStrength * (potBB + stackBB * 2) - (1 - handStrength) * stackBB);
    }
    default:
      return 0;
  }
}

// ============================================================
// Utility functions
// ============================================================

function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

function buildRemainingDeck(knownCards: Set<string>): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const key = `${rank}${suit}`;
      if (!knownCards.has(key)) {
        deck.push({ rank: rank as Rank, suit: suit as Suit });
      }
    }
  }
  return deck;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function assignFrequencies(actions: GTOActionEV[]): void {
  if (actions.length === 0) return;

  const minEV = Math.min(...actions.map((a) => a.evBB));
  const shifted = actions.map((a) => Math.max(0, a.evBB - minEV));
  const total = shifted.reduce((s, v) => s + v, 0);

  if (total === 0) {
    const even = 1 / actions.length;
    for (const a of actions) {
      a.frequency = Math.round(even * 100) / 100;
    }
    return;
  }

  for (let i = 0; i < actions.length; i++) {
    actions[i].frequency = Math.round((shifted[i] / total) * 100) / 100;
  }
}
