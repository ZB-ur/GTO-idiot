import type { SidePot } from '../types';
import type { PlayerState } from './types';

/**
 * Calculate main pot and side pots based on player bets.
 * Handles all-in scenarios by creating side pots for each distinct all-in amount.
 */
export function calculatePots(players: PlayerState[]): { mainPot: number; sidePots: SidePot[] } {
  // Collect all bets from non-folded AND folded players (folded players' bets stay in pot)
  const bets = players.map(p => ({ playerId: p.playerId, bet: p.currentBet, isFolded: p.isFolded, isAllIn: p.isAllIn }));

  // Find distinct all-in amounts (only from all-in players who are not folded)
  const allInAmounts = [...new Set(
    bets.filter(b => b.isAllIn && !b.isFolded && b.bet > 0).map(b => b.bet)
  )].sort((a, b) => a - b);

  if (allInAmounts.length === 0) {
    // No side pots needed
    const total = bets.reduce((sum, b) => sum + b.bet, 0);
    return { mainPot: total, sidePots: [] };
  }

  const sidePots: SidePot[] = [];
  let previousLevel = 0;

  for (const level of allInAmounts) {
    const increment = level - previousLevel;
    let potAmount = 0;
    const eligible: string[] = [];

    for (const b of bets) {
      const contribution = Math.min(b.bet, level) - Math.min(b.bet, previousLevel);
      potAmount += contribution;
      // Eligible if not folded and bet >= this level
      if (!b.isFolded && b.bet >= level) {
        eligible.push(b.playerId);
      }
    }

    if (potAmount > 0 && eligible.length > 0) {
      sidePots.push({ amount: potAmount, eligiblePlayerIds: eligible });
    }
    previousLevel = level;
  }

  // Remaining pot above the highest all-in level
  const maxAllIn = allInAmounts[allInAmounts.length - 1];
  let remainingPot = 0;
  const remainingEligible: string[] = [];

  for (const b of bets) {
    const contribution = Math.max(0, b.bet - maxAllIn);
    remainingPot += contribution;
    if (!b.isFolded && b.bet > maxAllIn) {
      remainingEligible.push(b.playerId);
    }
  }

  if (remainingPot > 0 && remainingEligible.length > 0) {
    sidePots.push({ amount: remainingPot, eligiblePlayerIds: remainingEligible });
  }

  // Main pot is the first side pot; rest are true side pots
  const mainPot = sidePots.length > 0 ? sidePots[0].amount : 0;
  const trueSidePots = sidePots.slice(1);

  // If no all-in players have different bet levels, combine everything
  const totalFromSidePots = sidePots.reduce((s, p) => s + p.amount, 0);
  const totalBets = bets.reduce((s, b) => s + b.bet, 0);

  // Any unaccounted bets from folded players at levels below min all-in
  const unaccounted = totalBets - totalFromSidePots;
  const adjustedMainPot = mainPot + unaccounted;

  return { mainPot: adjustedMainPot, sidePots: trueSidePots };
}

/**
 * Distribute pots to winners.
 * @param mainPot - Main pot amount
 * @param sidePots - Side pots with eligibility
 * @param winners - Map of playerId -> hand rank (higher = better)
 * @returns Map of playerId -> chips won
 */
export function distributePots(
  mainPot: number,
  sidePots: SidePot[],
  winners: Map<string, number>,
): Map<string, number> {
  const payouts = new Map<string, number>();

  // Helper: find best hand rank among eligible players
  function distributeOnePot(amount: number, eligibleIds: string[]): void {
    if (amount === 0 || eligibleIds.length === 0) return;

    let bestRank = -1;
    for (const id of eligibleIds) {
      const rank = winners.get(id);
      if (rank !== undefined && rank > bestRank) {
        bestRank = rank;
      }
    }

    if (bestRank === -1) return;

    // Find all players tied for best
    const potWinners = eligibleIds.filter(id => winners.get(id) === bestRank);
    const share = Math.floor(amount / potWinners.length);
    const remainder = amount - share * potWinners.length;

    for (let i = 0; i < potWinners.length; i++) {
      const playerId = potWinners[i];
      const extra = i < remainder ? 1 : 0;
      payouts.set(playerId, (payouts.get(playerId) ?? 0) + share + extra);
    }
  }

  // Main pot: all non-folded players who have a rank are eligible
  const mainEligible = [...winners.keys()];
  distributeOnePot(mainPot, mainEligible);

  // Side pots: only eligible players
  for (const sidePot of sidePots) {
    const eligible = sidePot.eligiblePlayerIds.filter(id => winners.has(id));
    distributeOnePot(sidePot.amount, eligible);
  }

  return payouts;
}
