// ============================================================
// GTO Idiot — Postflop CFR Solver
// Simplified Counterfactual Regret Minimization for postflop play.
// Runs in main thread or delegates to Web Worker for heavy computation.
// ============================================================

import type {
  Card,
  ActionType,
  GTOAdvice,
  GTOAdviceDegraded,
  GTOActionFrequency,
  PostflopSolveRequest,
} from '../types';
import {
  buildGameTree,
  countNodes,
  cfrActionToActionType,
  actionToBetSize,
  type CFRAction,
  type GameTreeNode,
  type GameTreeConfig,
} from './game-tree';

// ---------- CFR data structures ----------

interface InfoSetData {
  /** Cumulative regret for each action */
  regretSum: Float64Array;
  /** Cumulative strategy for each action */
  strategySum: Float64Array;
  /** Action labels for indexing */
  actions: CFRAction[];
}

/**
 * Information set store: maps info-set key → regret/strategy data.
 */
class InfoSetStore {
  private store = new Map<string, InfoSetData>();

  getOrCreate(key: string, actions: CFRAction[]): InfoSetData {
    let data = this.store.get(key);
    if (!data) {
      data = {
        regretSum: new Float64Array(actions.length),
        strategySum: new Float64Array(actions.length),
        actions,
      };
      this.store.set(key, data);
    }
    return data;
  }

  get(key: string): InfoSetData | undefined {
    return this.store.get(key);
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

// ---------- Strategy computation ----------

/**
 * Compute the current strategy from regret-matched values.
 * Positive regrets are normalized to a probability distribution.
 */
function getStrategy(infoSet: InfoSetData): Float64Array {
  const n = infoSet.actions.length;
  const strategy = new Float64Array(n);
  let normalizingSum = 0;

  for (let i = 0; i < n; i++) {
    strategy[i] = Math.max(0, infoSet.regretSum[i]);
    normalizingSum += strategy[i];
  }

  if (normalizingSum > 0) {
    for (let i = 0; i < n; i++) {
      strategy[i] /= normalizingSum;
    }
  } else {
    // Uniform random if all regrets are non-positive
    const uniform = 1 / n;
    for (let i = 0; i < n; i++) {
      strategy[i] = uniform;
    }
  }

  return strategy;
}

/**
 * Get the average strategy (the converged GTO strategy).
 */
function getAverageStrategy(infoSet: InfoSetData): Float64Array {
  const n = infoSet.actions.length;
  const avgStrategy = new Float64Array(n);
  let normalizingSum = 0;

  for (let i = 0; i < n; i++) {
    normalizingSum += infoSet.strategySum[i];
  }

  if (normalizingSum > 0) {
    for (let i = 0; i < n; i++) {
      avgStrategy[i] = infoSet.strategySum[i] / normalizingSum;
    }
  } else {
    const uniform = 1 / n;
    for (let i = 0; i < n; i++) {
      avgStrategy[i] = uniform;
    }
  }

  return avgStrategy;
}

// ---------- Hand strength estimation ----------

/**
 * Simple hand strength heuristic based on card ranks and board texture.
 * Returns a value between 0 and 1.
 */
function estimateHandStrength(holeCards: Card[], communityCards: Card[]): number {
  // Simple strength based on high card values and pair detection
  const allCards = [...holeCards, ...communityCards];
  const rankValues: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  const holeVals = holeCards.map((c) => rankValues[c.rank] ?? 0);
  const boardVals = communityCards.map((c) => rankValues[c.rank] ?? 0);

  let strength = 0;

  // Base strength from hole card values (normalized)
  const highCard = Math.max(...holeVals) / 14;
  const lowCard = Math.min(...holeVals) / 14;
  strength += highCard * 0.3 + lowCard * 0.1;

  // Pair bonus
  if (holeVals[0] === holeVals[1]) {
    strength += 0.2 + (holeVals[0] / 14) * 0.1;
  }

  // Board connection: check for pairs with the board
  for (const hv of holeVals) {
    if (boardVals.includes(hv)) {
      strength += 0.15 + (hv / 14) * 0.05;
    }
  }

  // Suited bonus (flush potential)
  if (holeCards.length >= 2 && holeCards[0].suit === holeCards[1].suit) {
    const suitCount = allCards.filter((c) => c.suit === holeCards[0].suit).length;
    if (suitCount >= 4) strength += 0.15;
    else if (suitCount >= 3) strength += 0.05;
  }

  // Connected cards bonus (straight potential)
  const diff = Math.abs(holeVals[0] - holeVals[1]);
  if (diff === 1) strength += 0.03;
  else if (diff === 2) strength += 0.01;

  return Math.min(1, Math.max(0, strength));
}

// ---------- CFR traversal ----------

/**
 * Single CFR iteration traversal.
 */
function cfrTraverse(
  node: GameTreeNode,
  heroStrength: number,
  villainStrength: number,
  heroReachProb: number,
  villainReachProb: number,
  infoSets: InfoSetStore,
  traversingPlayer: 0 | 1,
): number {
  if (node.type === 'terminal') {
    if (node.payoff !== null && node.payoff !== 0) {
      // Fold node: payoff is already determined
      return node.payoff;
    }
    // Showdown: compare hand strengths
    if (heroStrength > villainStrength) {
      return node.pot / 2;
    } else if (heroStrength < villainStrength) {
      return -node.pot / 2;
    }
    return 0; // tie
  }

  if (node.player === null || node.actions.length === 0) {
    return 0;
  }

  const isTraversingPlayer = node.player === traversingPlayer;
  const infoKey = `${node.player}:${node.id}:${isTraversingPlayer ? Math.round(heroStrength * 10) : Math.round(villainStrength * 10)}`;

  const infoSet = infoSets.getOrCreate(infoKey, node.actions);
  const strategy = getStrategy(infoSet);

  if (!isTraversingPlayer) {
    // Opponent node: weighted sum of child values
    let nodeUtil = 0;
    for (let i = 0; i < node.actions.length; i++) {
      const action = node.actions[i];
      const child = node.children.get(action);
      if (!child) continue;

      const newReachProb = node.player === 0
        ? heroReachProb * strategy[i]
        : villainReachProb * strategy[i];

      const util = cfrTraverse(
        child,
        heroStrength,
        villainStrength,
        node.player === 0 ? newReachProb : heroReachProb,
        node.player === 1 ? newReachProb : villainReachProb,
        infoSets,
        traversingPlayer,
      );

      nodeUtil += strategy[i] * util;
    }

    return nodeUtil;
  }

  // Traversing player's node: compute counterfactual values
  const actionUtils = new Float64Array(node.actions.length);
  let nodeUtil = 0;

  for (let i = 0; i < node.actions.length; i++) {
    const action = node.actions[i];
    const child = node.children.get(action);
    if (!child) continue;

    actionUtils[i] = cfrTraverse(
      child,
      heroStrength,
      villainStrength,
      node.player === 0 ? heroReachProb * strategy[i] : heroReachProb,
      node.player === 1 ? villainReachProb * strategy[i] : villainReachProb,
      infoSets,
      traversingPlayer,
    );

    nodeUtil += strategy[i] * actionUtils[i];
  }

  // Update regrets and strategy
  const opponentReachProb = traversingPlayer === 0 ? villainReachProb : heroReachProb;

  for (let i = 0; i < node.actions.length; i++) {
    const regret = actionUtils[i] - nodeUtil;
    infoSet.regretSum[i] += opponentReachProb * regret;
    infoSet.strategySum[i] += (traversingPlayer === 0 ? heroReachProb : villainReachProb) * strategy[i];
  }

  return nodeUtil;
}

// ---------- Solver ----------

export interface SolverResult {
  advice: GTOAdvice | GTOAdviceDegraded;
  iterations: number;
  infoSets: number;
  treeNodes: number;
}

export interface SolverOptions {
  /** Maximum iterations */
  maxIterations: number;
  /** Time budget in milliseconds */
  timeBudgetMs: number;
  /** Target convergence threshold */
  convergenceThreshold: number;
}

const DEFAULT_OPTIONS: SolverOptions = {
  maxIterations: 1000,
  timeBudgetMs: 500,
  convergenceThreshold: 0.01,
};

/**
 * Run the CFR solver for a postflop situation.
 * Returns GTO-approximate advice.
 */
export function solvePostflop(
  request: PostflopSolveRequest,
  options: Partial<SolverOptions> = {},
): SolverResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = performance.now();

  // Build game tree
  const treeConfig: GameTreeConfig = {
    initialPot: request.pot,
    effectiveStack: request.effective_stack,
    maxDepth: 6,
    betSizes: [0.33, 0.66, 1.0],
  };

  const root = buildGameTree(treeConfig);
  const treeNodes = countNodes(root);
  const infoSets = new InfoSetStore();

  // Estimate hand strengths
  const heroStrength = estimateHandStrength(request.hero_cards, request.community_cards);

  // Sample a few villain strengths for robustness
  const villainStrengths = [0.3, 0.45, 0.55, 0.7]; // representative range

  let iterations = 0;
  let timedOut = false;

  // Run CFR iterations
  for (let iter = 0; iter < opts.maxIterations; iter++) {
    const elapsed = performance.now() - startTime;
    if (elapsed > opts.timeBudgetMs) {
      timedOut = elapsed > 2000;
      break;
    }

    const villainStrength = villainStrengths[iter % villainStrengths.length];

    // Alternate traversing players
    cfrTraverse(root, heroStrength, villainStrength, 1, 1, infoSets, 0);
    cfrTraverse(root, heroStrength, villainStrength, 1, 1, infoSets, 1);

    iterations++;
  }

  const computationTime = performance.now() - startTime;

  // Extract strategy for the root node (hero's first decision)
  const heroInfoKey = `0:${root.id}:${Math.round(heroStrength * 10)}`;
  const heroInfoSet = infoSets.get(heroInfoKey);

  let actions: GTOActionFrequency[];

  if (heroInfoSet) {
    const avgStrategy = getAverageStrategy(heroInfoSet);
    actions = buildActionFrequencies(heroInfoSet.actions, avgStrategy, request.pot);
  } else {
    // Fallback: use hand strength heuristic
    actions = buildHeuristicActions(heroStrength, request.pot);
  }

  // Sort by frequency descending
  actions.sort((a, b) => b.frequency - a.frequency);

  const recommended = actions.length > 0 ? actions[0].action : ('check' as ActionType);

  if (timedOut) {
    const degraded: GTOAdviceDegraded = {
      actions,
      recommended_action: recommended,
      is_approximate: true,
      is_degraded: true,
      degradation_reason: '计算超时，结果可能不够精确',
      computation_time_ms: round2(computationTime),
    };
    return { advice: degraded, iterations, infoSets: infoSets.size, treeNodes };
  }

  const advice: GTOAdvice = {
    actions,
    recommended_action: recommended,
    is_approximate: true,
    computation_time_ms: round2(computationTime),
  };

  return { advice, iterations, infoSets: infoSets.size, treeNodes };
}

// ---------- Helpers ----------

function buildActionFrequencies(
  cfrActions: CFRAction[],
  strategy: Float64Array,
  pot: number,
): GTOActionFrequency[] {
  const result: GTOActionFrequency[] = [];

  for (let i = 0; i < cfrActions.length; i++) {
    const action = cfrActions[i];
    const freq = strategy[i];

    if (freq < 0.01) continue; // skip near-zero frequencies

    const actionType = cfrActionToActionType(action);
    const betSize = actionToBetSize(action);
    const betLabel = betSize !== null ? `${Math.round(betSize * 100)}% pot` : null;

    // Rough EV estimate
    const ev = actionType === 'fold' ? 0
      : actionType === 'check' ? 0
      : freq * pot * 0.3; // simplified

    result.push({
      action: actionType,
      frequency: round3(freq),
      ev: round2(ev),
      bet_size: betLabel,
    });
  }

  // Merge duplicate action types (e.g., multiple raise sizes)
  return mergeActionTypes(result);
}

function mergeActionTypes(actions: GTOActionFrequency[]): GTOActionFrequency[] {
  const merged = new Map<string, GTOActionFrequency>();

  for (const action of actions) {
    const key = action.bet_size
      ? `${action.action}:${action.bet_size}`
      : action.action;

    const existing = merged.get(key);
    if (existing) {
      existing.frequency += action.frequency;
      existing.ev = Math.max(existing.ev, action.ev);
    } else {
      merged.set(key, { ...action });
    }
  }

  return [...merged.values()];
}

function buildHeuristicActions(strength: number, pot: number): GTOActionFrequency[] {
  const actions: GTOActionFrequency[] = [];

  if (strength > 0.7) {
    // Strong hand: bet for value
    actions.push({
      action: 'raise',
      frequency: 0.7,
      ev: round2(pot * 0.5),
      bet_size: '66% pot',
    });
    actions.push({
      action: 'call',
      frequency: 0.2,
      ev: round2(pot * 0.2),
      bet_size: null,
    });
    actions.push({
      action: 'check',
      frequency: 0.1,
      ev: 0,
      bet_size: null,
    });
  } else if (strength > 0.45) {
    // Medium hand: mix of checking and small bets
    actions.push({
      action: 'check',
      frequency: 0.5,
      ev: 0,
      bet_size: null,
    });
    actions.push({
      action: 'raise',
      frequency: 0.3,
      ev: round2(pot * 0.15),
      bet_size: '33% pot',
    });
    actions.push({
      action: 'call',
      frequency: 0.2,
      ev: round2(pot * 0.05),
      bet_size: null,
    });
  } else if (strength > 0.25) {
    // Weak hand: mostly check, occasional bluff
    actions.push({
      action: 'check',
      frequency: 0.6,
      ev: 0,
      bet_size: null,
    });
    actions.push({
      action: 'fold',
      frequency: 0.25,
      ev: 0,
      bet_size: null,
    });
    actions.push({
      action: 'raise',
      frequency: 0.15,
      ev: round2(-pot * 0.1),
      bet_size: '33% pot',
    });
  } else {
    // Very weak: fold or bluff
    actions.push({
      action: 'fold',
      frequency: 0.6,
      ev: 0,
      bet_size: null,
    });
    actions.push({
      action: 'check',
      frequency: 0.3,
      ev: round2(-pot * 0.05),
      bet_size: null,
    });
    actions.push({
      action: 'raise',
      frequency: 0.1,
      ev: round2(-pot * 0.2),
      bet_size: '66% pot',
    });
  }

  return actions;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
