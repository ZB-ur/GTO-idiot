// ============================================================
// GTO Idiot — GTO Bot Strategy
// Uses the GTO engine (preflop ranges + postflop CFR solver) to make
// near-optimal decisions. The hardest bot difficulty level.
// ============================================================

import type {
  Card,
  ActionType,
  PlayerActionRequest,
  HandState,
  PlayerState,
  ActionRecord,
} from '../../types';
import { getPreflopAdvice } from '../../gto/preflop-advisor';
import { solvePostflop } from '../../gto/postflop-solver';
import type { BotStrategy, BotDecisionContext } from '../bot-manager';

// ---------- Constants ----------

/** Small random noise to avoid being perfectly predictable */
const NOISE_FACTOR = 0.05;

/** Max time budget for postflop solver when used by bot (faster than user hints) */
const BOT_SOLVE_TIME_MS = 150;

/** Max CFR iterations for bot (lower than user hints for speed) */
const BOT_MAX_ITERATIONS = 500;

// ---------- GTO Bot Strategy ----------

export class GTOBotStrategy implements BotStrategy {
  readonly difficulty = 'gto' as const;

  decide(context: BotDecisionContext): PlayerActionRequest {
    const { handState, seat, holeCards, actionHistory } = context;
    const player = handState.players.find((p) => p.seat === seat);
    if (!player) return { action: 'fold' };

    if (handState.street === 'preflop') {
      return this.decidePreflop(player, holeCards, actionHistory, handState);
    }

    return this.decidePostflop(player, holeCards, actionHistory, handState);
  }

  // ---------- Preflop ----------

  private decidePreflop(
    player: PlayerState,
    holeCards: Card[],
    actionHistory: ActionRecord[],
    state: HandState,
  ): PlayerActionRequest {
    const advice = getPreflopAdvice({
      position: player.position,
      hole_cards: holeCards,
      action_history: actionHistory,
    });

    return this.sampleAction(advice.actions, player, state);
  }

  // ---------- Postflop ----------

  private decidePostflop(
    player: PlayerState,
    holeCards: Card[],
    actionHistory: ActionRecord[],
    state: HandState,
  ): PlayerActionRequest {
    const effectiveStack = this.computeEffectiveStack(player, state);

    const result = solvePostflop(
      {
        hero_position: player.position,
        hero_cards: holeCards,
        community_cards: state.community_cards,
        pot: state.pot,
        effective_stack: effectiveStack,
        street: state.street,
        action_history: actionHistory,
      },
      {
        maxIterations: BOT_MAX_ITERATIONS,
        timeBudgetMs: BOT_SOLVE_TIME_MS,
      },
    );

    return this.sampleAction(result.advice.actions, player, state);
  }

  // ---------- Action sampling ----------

  /**
   * Sample an action from GTO frequency distribution with small noise.
   * Uses mixed strategy — doesn't always pick the highest frequency action.
   */
  private sampleAction(
    actions: Array<{ action: ActionType; frequency: number; bet_size: string | null }>,
    player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    if (actions.length === 0) {
      return { action: 'check' };
    }

    // Add noise to frequencies for slight unpredictability
    const noisyActions = actions.map((a) => ({
      ...a,
      frequency: Math.max(0, a.frequency + (Math.random() - 0.5) * NOISE_FACTOR),
    }));

    // Normalize
    const totalFreq = noisyActions.reduce((sum, a) => sum + a.frequency, 0);
    if (totalFreq <= 0) {
      return { action: 'check' };
    }

    // Sample from distribution
    const roll = Math.random() * totalFreq;
    let cumulative = 0;
    let selectedAction = noisyActions[0];

    for (const a of noisyActions) {
      cumulative += a.frequency;
      if (roll <= cumulative) {
        selectedAction = a;
        break;
      }
    }

    return this.toPlayerAction(selectedAction.action, selectedAction.bet_size, player, state);
  }

  /**
   * Convert a GTO action type + bet size label to a concrete PlayerActionRequest.
   */
  private toPlayerAction(
    action: ActionType,
    betSizeLabel: string | null,
    player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    switch (action) {
      case 'fold':
        return { action: 'fold' };

      case 'check':
        return { action: 'check' };

      case 'call':
        return { action: 'call' };

      case 'all_in':
        return { action: 'all_in' };

      case 'raise': {
        const raiseAmount = this.computeRaiseAmount(betSizeLabel, player, state);
        if (raiseAmount === null) {
          // Can't raise — fall back to call or check
          const highestBet = this.getHighestBet(state);
          return highestBet > player.current_bet
            ? { action: 'call' }
            : { action: 'check' };
        }
        return { action: 'raise', amount: raiseAmount };
      }

      default:
        return { action: 'check' };
    }
  }

  /**
   * Compute raise amount from bet size label (e.g., "33% pot", "66% pot").
   */
  private computeRaiseAmount(
    betSizeLabel: string | null,
    player: PlayerState,
    state: HandState,
  ): number | null {
    const minRaise = state.min_raise;
    const maxRaise = state.max_raise;
    if (minRaise === null || maxRaise === null) return null;

    let potFraction = 0.66; // default bet size

    if (betSizeLabel) {
      const match = betSizeLabel.match(/(\d+)%\s*pot/);
      if (match) {
        potFraction = parseInt(match[1], 10) / 100;
      } else if (betSizeLabel.includes('open')) {
        // Preflop open: 2.5BB standard
        const highestBet = this.getHighestBet(state);
        const targetRaise = Math.round(highestBet * 2.5);
        return Math.max(minRaise, Math.min(targetRaise, maxRaise));
      } else if (betSizeLabel.includes('3bet') || betSizeLabel.includes('3x')) {
        const highestBet = this.getHighestBet(state);
        const targetRaise = Math.round(highestBet * 3);
        return Math.max(minRaise, Math.min(targetRaise, maxRaise));
      } else if (betSizeLabel.includes('4bet') || betSizeLabel.includes('2.5x')) {
        const highestBet = this.getHighestBet(state);
        const targetRaise = Math.round(highestBet * 2.5);
        return Math.max(minRaise, Math.min(targetRaise, maxRaise));
      } else if (betSizeLabel.includes('all-in')) {
        return maxRaise;
      }
    }

    // Pot-fraction based bet
    const betAmount = Math.round(state.pot * potFraction);
    const totalBet = player.current_bet + betAmount;
    const raiseAmount = Math.max(minRaise, Math.min(totalBet, maxRaise));

    return raiseAmount;
  }

  private computeEffectiveStack(player: PlayerState, state: HandState): number {
    // Effective stack = min of hero stack and deepest villain stack
    const villainStacks = state.players
      .filter((p) => p.seat !== player.seat && p.is_active)
      .map((p) => p.stack);

    if (villainStacks.length === 0) return player.stack;
    return Math.min(player.stack, Math.max(...villainStacks));
  }

  private getHighestBet(state: HandState): number {
    return Math.max(...state.players.map((p) => p.current_bet), 0);
  }
}
