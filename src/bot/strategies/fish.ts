// ============================================================
// GTO Idiot — Fish Bot Strategy
// Loose-passive player: calls too much, rarely raises, bluffs poorly.
// Designed to be an easy opponent for beginners.
// ============================================================

import type {
  Card,
  PlayerActionRequest,
  HandState,
  PlayerState,
} from '../../types';
import type { BotStrategy, BotDecisionContext } from '../bot-manager';

// ---------- Constants ----------

/** Fish calls way too often preflop */
const PREFLOP_CALL_THRESHOLD = 0.25; // calls with top 75% of hands
/** Rarely raises */
const RAISE_FREQUENCY = 0.08;
/** Rarely folds when facing a bet (calling station behavior) */
const FOLD_TO_BET_FREQ = 0.15;
/** Occasionally makes bad bluffs */
const BLUFF_FREQUENCY = 0.05;

// ---------- Hand Strength (simplified) ----------

const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Simple hand strength estimate for the fish bot.
 * Returns 0-1 where 1 is strongest.
 */
function estimateStrength(
  holeCards: Card[],
  communityCards: Card[],
): number {
  if (holeCards.length < 2) return 0.3;

  const vals = holeCards.map((c) => RANK_VALUES[c.rank] ?? 0);
  const high = Math.max(...vals);
  const low = Math.min(...vals);
  const suited = holeCards[0].suit === holeCards[1].suit;
  const isPair = vals[0] === vals[1];

  let strength = 0;

  // Base from card values
  strength += (high / 14) * 0.3 + (low / 14) * 0.1;

  // Pair bonus
  if (isPair) {
    strength += 0.2 + (high / 14) * 0.1;
  }

  // Suited bonus
  if (suited) {
    strength += 0.05;
  }

  // Connected cards
  const gap = Math.abs(vals[0] - vals[1]);
  if (gap === 1) strength += 0.03;
  else if (gap === 2) strength += 0.01;

  // Board connection (postflop)
  if (communityCards.length > 0) {
    const boardVals = communityCards.map((c) => RANK_VALUES[c.rank] ?? 0);

    for (const hv of vals) {
      if (boardVals.includes(hv)) {
        strength += 0.15 + (hv / 14) * 0.05;
      }
    }

    // Flush draw
    if (suited) {
      const suitCount = [...holeCards, ...communityCards].filter(
        (c) => c.suit === holeCards[0].suit,
      ).length;
      if (suitCount >= 4) strength += 0.15;
      else if (suitCount >= 3) strength += 0.05;
    }
  }

  return Math.min(1, Math.max(0, strength));
}

// ---------- Fish Strategy ----------

export class FishStrategy implements BotStrategy {
  readonly difficulty = 'fish' as const;

  decide(context: BotDecisionContext): PlayerActionRequest {
    const { handState, seat } = context;
    const player = handState.players.find((p) => p.seat === seat);
    if (!player) {
      return { action: 'fold' };
    }

    const holeCards = context.holeCards;
    const strength = estimateStrength(holeCards, handState.community_cards);
    const street = handState.street;

    // Determine what we're facing
    const highestBet = this.getHighestBet(handState);
    const toCall = highestBet - player.current_bet;
    const hasBetToCall = toCall > 0;

    // Preflop decisions
    if (street === 'preflop') {
      return this.decidePreflopFish(strength, hasBetToCall, toCall, player, handState);
    }

    // Postflop decisions
    return this.decidePostflopFish(strength, hasBetToCall, toCall, player, handState);
  }

  private decidePreflopFish(
    strength: number,
    hasBetToCall: boolean,
    _toCall: number,
    player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    const rng = Math.random();

    // Fish plays way too many hands preflop
    if (!hasBetToCall) {
      // No bet to call — limp or raise
      if (strength > 0.6 && rng < RAISE_FREQUENCY * 3) {
        // Occasionally raise with strong hands
        const raiseAmount = this.computeFishRaise(player, state);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'call' };
      }
      // Check (limp) with almost everything
      return { action: 'check' };
    }

    // Facing a raise
    if (strength < PREFLOP_CALL_THRESHOLD && rng > 0.3) {
      // Even fish fold bottom 25% sometimes
      return { action: 'fold' };
    }

    // Calling station: call with most hands
    if (strength > 0.65 && rng < RAISE_FREQUENCY * 2) {
      const raiseAmount = this.computeFishRaise(player, state);
      return raiseAmount
        ? { action: 'raise', amount: raiseAmount }
        : { action: 'call' };
    }

    return { action: 'call' };
  }

  private decidePostflopFish(
    strength: number,
    hasBetToCall: boolean,
    toCall: number,
    player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    const rng = Math.random();

    if (!hasBetToCall) {
      // No bet to call
      if (strength > 0.6 && rng < 0.3) {
        // Sometimes bet with strong hands (but not always — passive)
        const raiseAmount = this.computeFishRaise(player, state);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'check' };
      }
      if (strength < 0.2 && rng < BLUFF_FREQUENCY) {
        // Occasional bad bluff
        const raiseAmount = this.computeFishRaise(player, state);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'check' };
      }
      return { action: 'check' };
    }

    // Facing a bet — calling station behavior
    if (rng < FOLD_TO_BET_FREQ && strength < 0.25) {
      return { action: 'fold' };
    }

    // Very rarely raise when facing a bet
    if (strength > 0.75 && rng < RAISE_FREQUENCY) {
      const raiseAmount = this.computeFishRaise(player, state);
      return raiseAmount
        ? { action: 'raise', amount: raiseAmount }
        : { action: 'call' };
    }

    // Call almost everything
    if (toCall >= player.stack) {
      // Need to go all-in to call — even fish fold sometimes
      if (strength < 0.4) {
        return { action: 'fold' };
      }
      return { action: 'all_in' };
    }

    return { action: 'call' };
  }

  /**
   * Fish uses weird bet sizes — sometimes min-raise, sometimes overbet.
   */
  private computeFishRaise(player: PlayerState, state: HandState): number | null {
    const minRaise = state.min_raise;
    const maxRaise = state.max_raise;

    if (minRaise === null || maxRaise === null) return null;
    if (player.stack <= 0) return null;

    const rng = Math.random();

    if (rng < 0.4) {
      // Min raise (common for fish)
      return minRaise;
    } else if (rng < 0.7) {
      // Random weird size
      const range = maxRaise - minRaise;
      return Math.round(minRaise + range * Math.random() * 0.5);
    } else {
      // Overbet (fish love to overbet sometimes)
      const potRaise = minRaise + state.pot;
      return Math.min(potRaise, maxRaise);
    }
  }

  private getHighestBet(state: HandState): number {
    return Math.max(...state.players.map((p) => p.current_bet), 0);
  }
}
