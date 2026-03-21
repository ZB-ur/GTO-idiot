// ============================================================
// GTO Idiot — Regular (TAG) Bot Strategy
// Tight-Aggressive player: plays fewer hands but plays them aggressively.
// A competent opponent that follows standard TAG strategy.
// ============================================================

import type {
  Card,
  PlayerActionRequest,
  HandState,
  PlayerState,
  Position,
  Street,
} from '../../types';
import type { BotStrategy, BotDecisionContext } from '../bot-manager';

// ---------- Constants ----------

/** Position-based open raise ranges (% of hands to open) */
const OPEN_RANGE: Record<Position, number> = {
  UTG: 0.15,
  HJ: 0.18,
  CO: 0.27,
  BTN: 0.42,
  SB: 0.36,
  BB: 0.40, // BB defends wide
};

/** 3-bet frequencies by position */
const THREE_BET_FREQ: Record<Position, number> = {
  UTG: 0.03,
  HJ: 0.05,
  CO: 0.07,
  BTN: 0.09,
  SB: 0.08,
  BB: 0.07,
};

/** C-bet frequencies by street */
const CBET_FREQ: Record<Street, number> = {
  preflop: 0,
  flop: 0.65,
  turn: 0.50,
  river: 0.40,
};

// ---------- Hand Strength ----------

const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

function estimateStrength(holeCards: Card[], communityCards: Card[]): number {
  if (holeCards.length < 2) return 0.3;

  const vals = holeCards.map((c) => RANK_VALUES[c.rank] ?? 0);
  const high = Math.max(...vals);
  const low = Math.min(...vals);
  const suited = holeCards[0].suit === holeCards[1].suit;
  const isPair = vals[0] === vals[1];

  let strength = 0;

  // Base from card values
  strength += (high / 14) * 0.25 + (low / 14) * 0.1;

  // Pair bonus (bigger pairs are much stronger)
  if (isPair) {
    strength += 0.2 + (high / 14) * 0.15;
  }

  // Suited bonus
  if (suited) strength += 0.04;

  // Connected cards
  const gap = Math.abs(vals[0] - vals[1]);
  if (gap === 1) strength += 0.03;
  else if (gap === 2) strength += 0.015;

  // Board connection (postflop)
  if (communityCards.length > 0) {
    const boardVals = communityCards.map((c) => RANK_VALUES[c.rank] ?? 0);
    const allCards = [...holeCards, ...communityCards];

    // Pair with board
    let boardPairCount = 0;
    for (const hv of vals) {
      if (boardVals.includes(hv)) {
        boardPairCount++;
        strength += 0.15 + (hv / 14) * 0.08;
      }
    }

    // Two pair
    if (boardPairCount >= 2) strength += 0.15;

    // Trips (pocket pair + board match)
    if (isPair && boardVals.includes(vals[0])) {
      strength += 0.25;
    }

    // Flush draw / made flush
    if (suited) {
      const suitCount = allCards.filter((c) => c.suit === holeCards[0].suit).length;
      if (suitCount >= 5) strength += 0.35;
      else if (suitCount >= 4) strength += 0.12;
      else if (suitCount >= 3) strength += 0.04;
    }

    // Straight potential
    const allVals = [...new Set(allCards.map((c) => RANK_VALUES[c.rank] ?? 0))].sort(
      (a, b) => a - b,
    );
    let maxConsecutive = 1;
    let current = 1;
    for (let i = 1; i < allVals.length; i++) {
      if (allVals[i] === allVals[i - 1] + 1) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 1;
      }
    }
    if (maxConsecutive >= 5) strength += 0.3;
    else if (maxConsecutive >= 4) strength += 0.08;

    // Overpair
    if (isPair && vals[0] > Math.max(...boardVals)) {
      strength += 0.1;
    }
  }

  return Math.min(1, Math.max(0, strength));
}

/**
 * Compute a raw hand ranking for preflop hand selection.
 * Returns 0-1 where higher is better. Used for open-raising decisions.
 */
function preflopHandRank(holeCards: Card[]): number {
  if (holeCards.length < 2) return 0;

  const vals = holeCards.map((c) => RANK_VALUES[c.rank] ?? 0);
  const high = Math.max(...vals);
  const low = Math.min(...vals);
  const suited = holeCards[0].suit === holeCards[1].suit;
  const isPair = vals[0] === vals[1];

  let rank = 0;

  if (isPair) {
    rank = 0.5 + (high / 14) * 0.5; // AA=1.0, 22=0.57
  } else {
    rank = (high / 14) * 0.4 + (low / 14) * 0.15;
    if (suited) rank += 0.08;
    const gap = Math.abs(vals[0] - vals[1]);
    if (gap === 1) rank += 0.04;
    else if (gap === 2) rank += 0.02;
  }

  return Math.min(1, Math.max(0, rank));
}

// ---------- Regular Strategy ----------

export class RegularStrategy implements BotStrategy {
  readonly difficulty = 'regular' as const;

  decide(context: BotDecisionContext): PlayerActionRequest {
    const { handState, seat } = context;
    const player = handState.players.find((p) => p.seat === seat);
    if (!player) return { action: 'fold' };

    const holeCards = context.holeCards;
    const position = player.position;
    const street = handState.street;
    const strength = estimateStrength(holeCards, handState.community_cards);
    const handRank = preflopHandRank(holeCards);

    const highestBet = this.getHighestBet(handState);
    const toCall = highestBet - player.current_bet;
    const hasBetToCall = toCall > 0;
    const potOdds = toCall > 0 ? toCall / (handState.pot + toCall) : 0;

    if (street === 'preflop') {
      return this.decidePreflop(handRank, strength, position, hasBetToCall, toCall, potOdds, player, handState);
    }

    return this.decidePostflop(strength, position, hasBetToCall, toCall, potOdds, player, handState, context);
  }

  private decidePreflop(
    handRank: number,
    strength: number,
    position: Position,
    hasBetToCall: boolean,
    _toCall: number,
    potOdds: number,
    player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    const rng = Math.random();
    const openRange = OPEN_RANGE[position];
    const threeBetFreq = THREE_BET_FREQ[position];

    if (!hasBetToCall) {
      // No bet to call — decide to open or check
      if (handRank >= 1 - openRange) {
        // Open raise
        const raiseAmount = this.computeStandardRaise(player, state, 2.5);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'check' };
      }
      return { action: 'check' };
    }

    // Facing a raise
    const facingRaises = this.countPriorRaises(state);

    if (facingRaises >= 2) {
      // Facing 3bet+: only continue with premium
      if (strength > 0.75) {
        if (rng < 0.4) {
          const raiseAmount = this.computeStandardRaise(player, state, 2.5);
          return raiseAmount
            ? { action: 'raise', amount: raiseAmount }
            : { action: 'call' };
        }
        return { action: 'call' };
      }
      if (strength > 0.55 && potOdds < 0.25) {
        return { action: 'call' };
      }
      return { action: 'fold' };
    }

    // Facing single raise
    if (handRank >= 1 - threeBetFreq && rng < 0.65) {
      // 3-bet with strong hands
      const raiseAmount = this.computeStandardRaise(player, state, 3.0);
      return raiseAmount
        ? { action: 'raise', amount: raiseAmount }
        : { action: 'call' };
    }

    // Call range: wider than 3-bet range
    const callRange = openRange * 0.8;
    if (handRank >= 1 - callRange) {
      return { action: 'call' };
    }

    return { action: 'fold' };
  }

  private decidePostflop(
    strength: number,
    _position: Position,
    hasBetToCall: boolean,
    _toCall: number,
    potOdds: number,
    player: PlayerState,
    state: HandState,
    context: BotDecisionContext,
  ): PlayerActionRequest {
    const rng = Math.random();
    const street = state.street;
    const cbetFreq = CBET_FREQ[street];
    const isAggressor = context.isLastAggressor;

    if (!hasBetToCall) {
      // No bet to call
      if (strength > 0.7) {
        // Value bet with strong hands
        if (rng < 0.75) {
          const betSize = strength > 0.85 ? 0.75 : 0.5;
          const raiseAmount = this.computePotBasedBet(player, state, betSize);
          return raiseAmount
            ? { action: 'raise', amount: raiseAmount }
            : { action: 'check' };
        }
        // Trap/slowplay occasionally
        return { action: 'check' };
      }

      if (strength > 0.4 && isAggressor && rng < cbetFreq) {
        // Continuation bet
        const raiseAmount = this.computePotBasedBet(player, state, 0.5);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'check' };
      }

      if (strength < 0.25 && rng < 0.12) {
        // Occasional bluff
        const raiseAmount = this.computePotBasedBet(player, state, 0.66);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'check' };
      }

      return { action: 'check' };
    }

    // Facing a bet
    if (strength > 0.75) {
      // Strong hand — raise for value
      if (rng < 0.45) {
        const raiseAmount = this.computePotBasedBet(player, state, 0.75);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'call' };
      }
      return { action: 'call' };
    }

    if (strength > 0.4) {
      // Medium strength — call if pot odds are good
      if (potOdds < strength * 0.8) {
        return { action: 'call' };
      }
      // Bluff raise occasionally
      if (rng < 0.08) {
        const raiseAmount = this.computePotBasedBet(player, state, 0.66);
        return raiseAmount
          ? { action: 'raise', amount: raiseAmount }
          : { action: 'call' };
      }
      return potOdds < 0.35 ? { action: 'call' } : { action: 'fold' };
    }

    if (strength > 0.25 && potOdds < 0.2) {
      // Drawing hand with good odds
      return { action: 'call' };
    }

    // Weak hand — fold
    return { action: 'fold' };
  }

  /**
   * Compute a standard preflop raise (multiplier × BB).
   */
  private computeStandardRaise(
    player: PlayerState,
    state: HandState,
    multiplier: number,
  ): number | null {
    const minRaise = state.min_raise;
    const maxRaise = state.max_raise;
    if (minRaise === null || maxRaise === null) return null;

    const highestBet = this.getHighestBet(state);
    const targetRaise = Math.round(highestBet * multiplier);
    const raiseAmount = Math.max(minRaise, Math.min(targetRaise, maxRaise));

    if (raiseAmount - player.current_bet > player.stack) {
      return maxRaise; // All-in
    }

    return raiseAmount;
  }

  /**
   * Compute a pot-based bet size.
   */
  private computePotBasedBet(
    player: PlayerState,
    state: HandState,
    potFraction: number,
  ): number | null {
    const minRaise = state.min_raise;
    const maxRaise = state.max_raise;
    if (minRaise === null || maxRaise === null) return null;

    const betAmount = Math.round(state.pot * potFraction);
    const totalBet = player.current_bet + betAmount;
    const raiseAmount = Math.max(minRaise, Math.min(totalBet, maxRaise));

    return raiseAmount;
  }

  private getHighestBet(state: HandState): number {
    return Math.max(...state.players.map((p) => p.current_bet), 0);
  }

  private countPriorRaises(state: HandState): number {
    // Estimate from player bets — count players who bet above BB
    const bb = 2; // Assume standard BB
    return state.players.filter(
      (p) => p.current_bet > bb && p.last_action?.startsWith('raise'),
    ).length;
  }
}
