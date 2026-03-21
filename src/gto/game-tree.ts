// ============================================================
// GTO Idiot — Game Tree for Postflop CFR Solver
// Simplified game tree with 3 bet sizing options (33%, 66%, 100% pot).
// ============================================================

import type { ActionType } from '../types';

// ---------- Types ----------

export type CFRAction = 'fold' | 'check' | 'call' | 'raise_33' | 'raise_66' | 'raise_100';

export interface GameTreeNode {
  /** Unique identifier */
  id: string;
  /** Node type */
  type: 'chance' | 'player' | 'terminal';
  /** Which player acts (0 = hero, 1 = villain). null for terminal/chance */
  player: 0 | 1 | null;
  /** Available actions at this node */
  actions: CFRAction[];
  /** Children keyed by action taken */
  children: Map<CFRAction, GameTreeNode>;
  /** For terminal nodes: payoff for player 0 (hero) in pot fractions */
  payoff: number | null;
  /** Current pot size (pot fraction units) */
  pot: number;
  /** Effective stack remaining (pot fraction units) */
  stackRemaining: number;
}

export interface GameTreeConfig {
  /** Initial pot size (in BB) */
  initialPot: number;
  /** Effective stack (in BB) */
  effectiveStack: number;
  /** Maximum tree depth to prevent explosion */
  maxDepth: number;
  /** Bet sizes as fractions of pot */
  betSizes: number[];
}

// ---------- Default config ----------

export const DEFAULT_TREE_CONFIG: GameTreeConfig = {
  initialPot: 6,        // typical 3bet pot
  effectiveStack: 97,   // 100BB - 3BB invested
  maxDepth: 6,          // limit tree depth
  betSizes: [0.33, 0.66, 1.0],
};

// ---------- Action labels ----------

const BET_SIZE_TO_ACTION: Record<number, CFRAction> = {
  0.33: 'raise_33',
  0.66: 'raise_66',
  1.0: 'raise_100',
};

const ACTION_TO_BET_SIZE: Record<string, number> = {
  raise_33: 0.33,
  raise_66: 0.66,
  raise_100: 1.0,
};

export function actionToBetSize(action: CFRAction): number | null {
  return ACTION_TO_BET_SIZE[action] ?? null;
}

export function actionToLabel(action: CFRAction): string {
  switch (action) {
    case 'fold': return 'Fold';
    case 'check': return 'Check';
    case 'call': return 'Call';
    case 'raise_33': return '33% pot';
    case 'raise_66': return '66% pot';
    case 'raise_100': return '100% pot';
  }
}

export function cfrActionToActionType(action: CFRAction): ActionType {
  switch (action) {
    case 'fold': return 'fold';
    case 'check': return 'check';
    case 'call': return 'call';
    case 'raise_33':
    case 'raise_66':
    case 'raise_100':
      return 'raise';
  }
}

// ---------- Game tree builder ----------

let nodeCounter = 0;

/**
 * Build a simplified postflop game tree.
 * Two players alternate actions with simplified bet sizing.
 */
export function buildGameTree(config: GameTreeConfig = DEFAULT_TREE_CONFIG): GameTreeNode {
  nodeCounter = 0;
  return buildNode(0, config.initialPot, config.effectiveStack, config, false, 0);
}

function buildNode(
  player: 0 | 1,
  pot: number,
  stackRemaining: number,
  config: GameTreeConfig,
  facingBet: boolean,
  depth: number,
): GameTreeNode {
  const nodeId = `n${nodeCounter++}`;

  // Depth limit → terminal
  if (depth >= config.maxDepth || stackRemaining <= 0) {
    return {
      id: nodeId,
      type: 'terminal',
      player: null,
      actions: [],
      children: new Map(),
      payoff: 0, // showdown — resolved during CFR with hand evaluation
      pot,
      stackRemaining,
    };
  }

  const actions: CFRAction[] = [];
  const children = new Map<CFRAction, GameTreeNode>();
  const opponent = (1 - player) as 0 | 1;

  if (facingBet) {
    // Player faces a bet: fold, call, or re-raise
    actions.push('fold');
    actions.push('call');

    // Add raise options if stack allows
    for (const size of config.betSizes) {
      const raiseAmount = pot * size;
      if (raiseAmount <= stackRemaining) {
        const action = BET_SIZE_TO_ACTION[size];
        if (action) actions.push(action);
      }
    }
  } else {
    // Player can check or bet
    actions.push('check');

    for (const size of config.betSizes) {
      const betAmount = pot * size;
      if (betAmount <= stackRemaining) {
        const action = BET_SIZE_TO_ACTION[size];
        if (action) actions.push(action);
      }
    }
  }

  // Build children
  for (const action of actions) {
    if (action === 'fold') {
      // Terminal: opponent wins the pot
      const payoff = player === 0 ? -pot / 2 : pot / 2;
      children.set(action, {
        id: `n${nodeCounter++}`,
        type: 'terminal',
        player: null,
        actions: [],
        children: new Map(),
        payoff,
        pot,
        stackRemaining,
      });
    } else if (action === 'check') {
      if (facingBet) {
        // Can't check when facing a bet — skip (shouldn't happen)
        continue;
      }
      // Check: opponent acts next (not facing a bet)
      // If both check (second check in round), go to terminal/showdown
      const child = buildNode(
        opponent,
        pot,
        stackRemaining,
        config,
        false,
        depth + 1,
      );
      children.set(action, child);
    } else if (action === 'call') {
      // Call: match the bet, go to showdown/next street (terminal for simplified tree)
      children.set(action, {
        id: `n${nodeCounter++}`,
        type: 'terminal',
        player: null,
        actions: [],
        children: new Map(),
        payoff: 0, // Showdown — resolved during CFR
        pot,
        stackRemaining,
      });
    } else {
      // Raise/bet action
      const betSize = ACTION_TO_BET_SIZE[action] ?? 0.5;
      const betAmount = pot * betSize;
      const newPot = pot + betAmount;
      const newStack = stackRemaining - betAmount;

      const child = buildNode(
        opponent,
        newPot,
        Math.max(0, newStack),
        config,
        true,
        depth + 1,
      );
      children.set(action, child);
    }
  }

  return {
    id: nodeId,
    type: 'player',
    player,
    actions,
    children,
    payoff: null,
    pot,
    stackRemaining,
  };
}

/**
 * Count total nodes in the game tree (for diagnostics).
 */
export function countNodes(node: GameTreeNode): number {
  let count = 1;
  for (const child of node.children.values()) {
    count += countNodes(child);
  }
  return count;
}
