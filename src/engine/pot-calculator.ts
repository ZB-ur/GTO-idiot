// ============================================================
// GTO Idiot — Pot Calculator
// Handles main pot, side pots, and pot distribution at showdown.
// ============================================================

import type { Card, PlayerState, SidePot } from '../types';
import { evaluateHand, compareHands, describeHand } from './hand-evaluator';
import type { EvaluatedHand } from './hand-evaluator';

export interface PotWinner {
  seat: number;
  name: string;
  amount_won: number;
  hand_rank: string;
}

export interface PotDistribution {
  winners: PotWinner[];
  /** Player states with updated stacks after pot distribution */
  updatedStacks: Map<number, number>;
}

// ============================================================
// Side pot calculation
// ============================================================

/**
 * Calculate main pot and side pots from player investments.
 * Called when at least one player is all-in.
 */
export function calculateSidePots(players: PlayerState[]): SidePot[] {
  // Get all-in amounts (sorted ascending), these are the tier boundaries
  const activePlayers = players.filter((p) => p.is_active || p.is_all_in);
  const allInAmounts = [...new Set(
    activePlayers
      .filter((p) => p.is_all_in)
      .map((p) => p.total_invested)
  )].sort((a, b) => a - b);

  // If no all-ins, single main pot
  if (allInAmounts.length === 0) {
    const totalPot = activePlayers.reduce((sum, p) => sum + p.total_invested, 0);
    return [{
      amount: totalPot,
      eligible_seats: activePlayers.map((p) => p.seat),
    }];
  }

  const pots: SidePot[] = [];
  let prevLevel = 0;

  for (const level of allInAmounts) {
    const increment = level - prevLevel;
    if (increment <= 0) continue;

    // All players who invested at least this level contribute
    const contributors = activePlayers.filter((p) => p.total_invested >= level);
    // Eligible = those who invested at least this level AND are still active (or all-in at this level)
    const eligible = contributors.filter(
      (p) => p.is_active || p.total_invested >= level,
    );

    const potAmount = increment * contributors.length;
    pots.push({
      amount: potAmount,
      eligible_seats: eligible.map((p) => p.seat),
    });

    prevLevel = level;
  }

  // Remaining pot for players who invested more than the highest all-in
  const maxAllIn = allInAmounts[allInAmounts.length - 1];
  const remainingPlayers = activePlayers.filter(
    (p) => p.total_invested > maxAllIn && p.is_active,
  );

  if (remainingPlayers.length > 0) {
    const extraAmount = remainingPlayers.reduce(
      (sum, p) => sum + (p.total_invested - maxAllIn),
      0,
    );
    if (extraAmount > 0) {
      pots.push({
        amount: extraAmount,
        eligible_seats: remainingPlayers.map((p) => p.seat),
      });
    }
  }

  return pots;
}

/**
 * Calculate the total pot from all player investments.
 */
export function calculateTotalPot(players: PlayerState[]): number {
  return players.reduce((sum, p) => sum + p.total_invested, 0);
}

// ============================================================
// Pot distribution at showdown
// ============================================================

/**
 * Distribute pots to winners at showdown.
 * Evaluates hands and splits pots among eligible winners.
 */
export function distributePots(
  players: PlayerState[],
  communityCards: Card[],
): PotDistribution {
  const pots = calculateSidePots(players);
  const winners: PotWinner[] = [];
  const updatedStacks = new Map<number, number>();

  // Initialize stacks
  for (const p of players) {
    updatedStacks.set(p.seat, p.stack);
  }

  // Evaluate hands for all active/all-in players with known hole cards
  const evaluatedHands = new Map<number, EvaluatedHand>();
  for (const p of players) {
    if ((p.is_active || p.is_all_in) && p.hole_cards && p.hole_cards.length === 2) {
      const allCards = [...p.hole_cards, ...communityCards];
      if (allCards.length >= 5) {
        evaluatedHands.set(p.seat, evaluateHand(allCards));
      }
    }
  }

  // For each pot, find the winner(s) among eligible seats
  for (const pot of pots) {
    const eligibleHands: { seat: number; hand: EvaluatedHand }[] = [];

    for (const seat of pot.eligible_seats) {
      const hand = evaluatedHands.get(seat);
      if (hand) {
        eligibleHands.push({ seat, hand });
      }
    }

    if (eligibleHands.length === 0) continue;

    // Find the best hand(s)
    eligibleHands.sort((a, b) => compareHands(b.hand, a.hand));
    const bestScore = eligibleHands[0].hand.score;
    const potWinners = eligibleHands.filter((h) => h.hand.score === bestScore);

    // Split the pot evenly among winners
    const share = Math.floor(pot.amount / potWinners.length);
    const remainder = pot.amount - share * potWinners.length;

    for (let i = 0; i < potWinners.length; i++) {
      const { seat, hand } = potWinners[i];
      const player = players.find((p) => p.seat === seat)!;
      // First winner gets the remainder (indivisible chips)
      const winAmount = share + (i === 0 ? remainder : 0);

      const existing = winners.find((w) => w.seat === seat);
      if (existing) {
        existing.amount_won += winAmount;
      } else {
        winners.push({
          seat,
          name: player.name,
          amount_won: winAmount,
          hand_rank: describeHand(hand),
        });
      }

      updatedStacks.set(seat, (updatedStacks.get(seat) ?? 0) + winAmount);
    }
  }

  return { winners, updatedStacks };
}

/**
 * Distribute pot when all other players have folded (no showdown).
 */
export function distributeToLastStanding(
  players: PlayerState[],
): PotDistribution {
  const activePlayers = players.filter((p) => p.is_active);
  if (activePlayers.length !== 1) {
    throw new Error('distributeToLastStanding requires exactly one active player');
  }

  const winner = activePlayers[0];
  const totalPot = calculateTotalPot(players);

  const updatedStacks = new Map<number, number>();
  for (const p of players) {
    updatedStacks.set(p.seat, p.stack);
  }
  updatedStacks.set(winner.seat, winner.stack + totalPot);

  return {
    winners: [{
      seat: winner.seat,
      name: winner.name,
      amount_won: totalPot,
      hand_rank: '',
    }],
    updatedStacks,
  };
}

/**
 * Collect bets from all players into the pot (end of a betting round).
 * Returns the new pot total and resets current_bet on each player.
 */
export function collectBets(
  currentPot: number,
  players: PlayerState[],
): { newPot: number; players: PlayerState[] } {
  let betsCollected = 0;
  const updatedPlayers = players.map((p) => {
    betsCollected += p.current_bet;
    return { ...p, current_bet: 0 };
  });

  return {
    newPot: currentPot + betsCollected,
    players: updatedPlayers,
  };
}
