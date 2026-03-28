/**
 * Pot calculator — handles main pot, side pots, and chip distribution.
 * Correctly manages all-in scenarios with multiple side pots.
 */

import type { SidePot } from '../types/game';
import { roundTo } from './utils';

/** Player contribution for pot calculation */
export interface PlayerContribution {
  readonly playerId: string;
  readonly totalBet: number; // total amount bet across all streets this hand
  readonly isAllIn: boolean;
  readonly isFolded: boolean;
}

/** Result of pot distribution after showdown */
export interface PotDistribution {
  readonly playerId: string;
  readonly amount: number;
}

/**
 * Calculate side pots from player contributions.
 * Uses the standard multi-way all-in side pot algorithm.
 */
export function calculateSidePots(contributions: readonly PlayerContribution[]): SidePot[] {
  // Only consider non-folded players for pots, but folded players' bets are in the pot
  const activePlayers = contributions.filter(c => !c.isFolded);
  const allPlayers = [...contributions];

  if (activePlayers.length === 0) return [];

  // No all-in players — single main pot
  const hasAllIn = activePlayers.some(c => c.isAllIn);
  if (!hasAllIn) {
    const totalPot = allPlayers.reduce((sum, c) => sum + c.totalBet, 0);
    return [{
      amount: roundTo(totalPot, 2),
      eligiblePlayers: activePlayers.map(c => c.playerId),
    }];
  }

  // Sort all-in contributions to process from smallest to largest
  const allInAmounts = [...new Set(
    activePlayers.filter(c => c.isAllIn).map(c => c.totalBet)
  )].sort((a, b) => a - b);

  const pots: SidePot[] = [];
  let processedAmount = 0;

  for (const allInAmount of allInAmounts) {
    const layerAmount = allInAmount - processedAmount;
    if (layerAmount <= 0) continue;

    // Each player contributes up to layerAmount from their remaining bet
    let potAmount = 0;
    const eligible: string[] = [];

    for (const player of allPlayers) {
      const playerRemaining = player.totalBet - processedAmount;
      if (playerRemaining > 0) {
        potAmount += Math.min(playerRemaining, layerAmount);
      }
      // Eligible: active (not folded) AND contributed at least this much
      if (!player.isFolded && player.totalBet >= allInAmount) {
        eligible.push(player.playerId);
      }
    }

    if (potAmount > 0) {
      pots.push({
        amount: roundTo(potAmount, 2),
        eligiblePlayers: eligible,
      });
    }

    processedAmount = allInAmount;
  }

  // Remaining pot (contributions above the largest all-in)
  const maxAllIn = allInAmounts[allInAmounts.length - 1]!;
  let remainingPot = 0;
  const remainingEligible: string[] = [];

  for (const player of allPlayers) {
    const remaining = player.totalBet - maxAllIn;
    if (remaining > 0) {
      remainingPot += remaining;
    }
    if (!player.isFolded && player.totalBet > maxAllIn) {
      remainingEligible.push(player.playerId);
    }
  }

  if (remainingPot > 0 && remainingEligible.length > 0) {
    pots.push({
      amount: roundTo(remainingPot, 2),
      eligiblePlayers: remainingEligible,
    });
  }

  return pots;
}

/**
 * Distribute pot winnings based on hand rankings.
 * Handles split pots and side pot eligibility.
 *
 * @param pots - Side pots (or single main pot) to distribute
 * @param winnersByPot - For each pot index, the list of winning player IDs
 */
export function distributePots(
  pots: readonly SidePot[],
  winnersByPot: readonly (readonly string[])[],
): PotDistribution[] {
  const distributions = new Map<string, number>();

  for (let i = 0; i < pots.length; i++) {
    const pot = pots[i]!;
    const winners = winnersByPot[i] ?? [];

    if (winners.length === 0) continue;

    // Split the pot equally among winners, only eligible players can win
    const eligibleWinners = winners.filter(w => pot.eligiblePlayers.includes(w));
    if (eligibleWinners.length === 0) continue;

    const share = roundTo(pot.amount / eligibleWinners.length, 2);
    for (const winnerId of eligibleWinners) {
      const current = distributions.get(winnerId) ?? 0;
      distributions.set(winnerId, roundTo(current + share, 2));
    }
  }

  return Array.from(distributions.entries()).map(([playerId, amount]) => ({
    playerId,
    amount,
  }));
}

/**
 * Calculate the total pot from all side pots.
 */
export function totalPotAmount(pots: readonly SidePot[]): number {
  return roundTo(pots.reduce((sum, pot) => sum + pot.amount, 0), 2);
}

/**
 * Calculate raise presets based on current pot size.
 */
export function calculateRaisePresets(
  pot: number,
  minRaise: number,
  maxRaise: number,
): { label: string; amount: number }[] {
  const presets: { label: string; amount: number }[] = [];

  const sizes = [
    { label: '⅓ Pot', factor: 1 / 3 },
    { label: '½ Pot', factor: 0.5 },
    { label: '¾ Pot', factor: 0.75 },
    { label: 'Pot', factor: 1 },
    { label: '2x Pot', factor: 2 },
  ];

  for (const size of sizes) {
    const amount = roundTo(pot * size.factor, 2);
    if (amount >= minRaise && amount <= maxRaise) {
      presets.push({ label: size.label, amount });
    }
  }

  return presets;
}
