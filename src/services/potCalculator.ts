import type { PotCalculation, HandPlayerState } from '../types';

export function calculatePots(players: HandPlayerState[]): PotCalculation {
  // Collect all-in amounts sorted ascending to determine side pot boundaries
  const allInAmounts: number[] = [];
  for (const p of players) {
    if (p.isAllIn && p.totalInvested > 0) {
      if (!allInAmounts.includes(p.totalInvested)) {
        allInAmounts.push(p.totalInvested);
      }
    }
  }
  allInAmounts.sort((a, b) => a - b);

  if (allInAmounts.length === 0) {
    // No side pots needed — everything goes to main pot
    const total = players.reduce((sum, p) => sum + p.totalInvested, 0);
    return { mainPot: total, sidePots: [], totalPot: total };
  }

  // Build pots level by level
  const pots: { amount: number; eligiblePlayers: number[] }[] = [];
  let previousLevel = 0;

  for (const level of allInAmounts) {
    const contribution = level - previousLevel;
    if (contribution <= 0) continue;

    let potAmount = 0;
    const eligible: number[] = [];

    for (const p of players) {
      if (p.totalInvested > previousLevel && !p.hasFolded) {
        eligible.push(p.seatIndex);
      }
      // Each player contributes the min of their remaining invested and the level diff
      const playerRemaining = p.totalInvested - previousLevel;
      if (playerRemaining > 0) {
        potAmount += Math.min(playerRemaining, contribution);
      }
    }

    if (potAmount > 0) {
      pots.push({ amount: potAmount, eligiblePlayers: eligible });
    }
    previousLevel = level;
  }

  // Remaining pot above the highest all-in level
  const maxAllIn = allInAmounts[allInAmounts.length - 1];
  let remainingPot = 0;
  const remainingEligible: number[] = [];

  for (const p of players) {
    const excess = p.totalInvested - maxAllIn;
    if (excess > 0) {
      remainingPot += excess;
    }
    if (p.totalInvested > maxAllIn && !p.hasFolded) {
      remainingEligible.push(p.seatIndex);
    }
  }

  if (remainingPot > 0) {
    pots.push({ amount: remainingPot, eligiblePlayers: remainingEligible });
  }

  // First pot is main pot, rest are side pots
  const mainPot = pots.length > 0 ? pots[0].amount : 0;
  const sidePots = pots.slice(1);
  const totalPot = pots.reduce((sum, p) => sum + p.amount, 0);

  return { mainPot, sidePots, totalPot };
}

export function distributePots(
  potCalculation: PotCalculation,
  winners: { seatIndex: number; handValue: number }[]
): { seatIndex: number; amount: number; potType: 'main' | 'side' }[] {
  if (winners.length === 0) return [];

  const results: { seatIndex: number; amount: number; potType: 'main' | 'side' }[] = [];

  // Build all pots array: main pot first, then side pots
  const allPots: { amount: number; eligiblePlayers: number[]; potType: 'main' | 'side' }[] = [];

  if (potCalculation.mainPot > 0) {
    // If no side pots, all players are eligible for main pot
    const eligible = potCalculation.sidePots.length === 0
      ? winners.map(w => w.seatIndex)
      : potCalculation.sidePots.length > 0
        ? // Infer main pot eligible from first side pot or all winners
          winners.map(w => w.seatIndex)
        : [];
    allPots.push({ amount: potCalculation.mainPot, eligiblePlayers: eligible, potType: 'main' });
  }

  for (const sp of potCalculation.sidePots) {
    allPots.push({ amount: sp.amount, eligiblePlayers: sp.eligiblePlayers, potType: 'side' });
  }

  // For each pot, find the best winner(s) among eligible players
  for (const pot of allPots) {
    const eligibleWinners = winners
      .filter(w => pot.eligiblePlayers.length === 0 || pot.eligiblePlayers.includes(w.seatIndex))
      .sort((a, b) => b.handValue - a.handValue);

    if (eligibleWinners.length === 0) continue;

    const bestValue = eligibleWinners[0].handValue;
    const tiedWinners = eligibleWinners.filter(w => w.handValue === bestValue);

    // Split evenly among tied winners
    const share = pot.amount / tiedWinners.length;
    for (const w of tiedWinners) {
      const existing = results.find(r => r.seatIndex === w.seatIndex && r.potType === pot.potType);
      if (existing) {
        existing.amount += share;
      } else {
        results.push({ seatIndex: w.seatIndex, amount: share, potType: pot.potType });
      }
    }
  }

  return results;
}
