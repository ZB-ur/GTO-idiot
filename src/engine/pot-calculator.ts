import type { Player, PotInfo } from '../types';

export interface PotContribution {
  playerId: string;
  amount: number;
}

/**
 * Calculate main pot and side pots from player contributions.
 * Handles all-in scenarios with multiple side pots.
 */
export function calculatePots(_players: Player[], contributions: Map<string, number>): PotInfo {
  // Collect contributions for non-folded or all-in players
  const entries: PotContribution[] = [];
  for (const [playerId, amount] of contributions) {
    if (amount > 0) {
      entries.push({ playerId, amount });
    }
  }

  if (entries.length === 0) {
    return { mainPot: 0 };
  }

  // Sort by contribution amount ascending to compute side pots
  const sorted = [...entries].sort((a, b) => a.amount - b.amount);

  const pots: Array<{ amount: number; eligiblePlayerIds: string[] }> = [];
  let previousLevel = 0;

  for (let i = 0; i < sorted.length; i++) {
    const currentLevel = sorted[i].amount;
    if (currentLevel <= previousLevel) continue;

    const increment = currentLevel - previousLevel;
    // All players who contributed at least this level
    // All players who contributed at least this level
    const allEligible = sorted
      .filter(e => e.amount >= currentLevel)
      .map(e => e.playerId);

    // The pot contribution from each eligible player at this level
    const playersAtOrAbove = entries.filter(e => e.amount >= currentLevel).length;
    const potAmount = increment * playersAtOrAbove;

    pots.push({
      amount: potAmount,
      eligiblePlayerIds: [...new Set(allEligible)],
    });

    previousLevel = currentLevel;
  }

  if (pots.length === 0) {
    return { mainPot: 0 };
  }

  const mainPot = pots[0].amount;
  const sidePots = pots.length > 1 ? pots.slice(1) : undefined;

  return { mainPot, sidePots };
}

/**
 * Simple pot calculation — sum all bets in the current round plus existing pot.
 * Used during a single street when no all-ins complicate things.
 */
export function calculateSimplePot(existingPot: number, players: Player[]): number {
  const currentBets = players.reduce((sum, p) => sum + p.currentBet, 0);
  return existingPot + currentBets;
}

/**
 * Collect current round bets into the pot and reset player bets.
 * Returns the new pot total and mutates players (resetting currentBet to 0).
 */
export function collectBetsIntoPot(pot: PotInfo, players: Player[]): PotInfo {
  const roundBets = players.reduce((sum, p) => sum + p.currentBet, 0);

  // Check if any player is all-in — need to create side pots
  const allInPlayers = players.filter(p => p.isAllIn && p.currentBet > 0);

  if (allInPlayers.length === 0) {
    // Simple case — add everything to main pot
    return {
      mainPot: pot.mainPot + roundBets,
      sidePots: pot.sidePots,
    };
  }

  // Complex case — build side pots
  const activePlayers = players.filter(p => !p.isFolded);
  const contributions = new Map<string, number>();
  for (const p of activePlayers) {
    contributions.set(p.id, p.currentBet);
  }

  const newPots = calculatePots(
    activePlayers,
    contributions
  );

  // Merge with existing pot
  return {
    mainPot: pot.mainPot + newPots.mainPot,
    sidePots: [
      ...(pot.sidePots ?? []),
      ...(newPots.sidePots ?? []),
    ].length > 0
      ? [...(pot.sidePots ?? []), ...(newPots.sidePots ?? [])]
      : undefined,
  };
}

/**
 * Get total pot size including all side pots.
 */
export function getTotalPot(pot: PotInfo): number {
  const sidePotTotal = pot.sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0;
  return pot.mainPot + sidePotTotal;
}

/**
 * Distribute pot to winners. Handles side pots correctly.
 */
export function distributePot(
  pot: PotInfo,
  winnersByPotPriority: string[][],
  playerMap: Map<string, Player>
): Map<string, number> {
  const payouts = new Map<string, number>();

  // All pots in order: main pot first, then side pots
  const allPots = [
    { amount: pot.mainPot, eligiblePlayerIds: [...playerMap.keys()] },
    ...(pot.sidePots ?? []),
  ];

  for (let i = 0; i < allPots.length; i++) {
    const currentPot = allPots[i];
    const eligible = new Set(currentPot.eligiblePlayerIds);

    // Find winners eligible for this pot
    // winnersByPotPriority[0] are the best hands
    let potWinners: string[] = [];
    for (const tierWinners of winnersByPotPriority) {
      const eligibleWinners = tierWinners.filter(id => eligible.has(id));
      if (eligibleWinners.length > 0) {
        potWinners = eligibleWinners;
        break;
      }
    }

    if (potWinners.length === 0) continue;

    // Split evenly
    const share = currentPot.amount / potWinners.length;
    for (const winnerId of potWinners) {
      payouts.set(winnerId, (payouts.get(winnerId) ?? 0) + share);
    }
  }

  return payouts;
}
