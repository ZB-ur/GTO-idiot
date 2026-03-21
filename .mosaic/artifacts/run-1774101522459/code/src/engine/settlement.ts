// ============================================================
// Settlement — Resolve hand outcomes, distribute pots
// ============================================================

import type { Card, HandSettlement, Pot, Winner } from '../types';
import { evaluateHand, type EvaluatedHand } from './hand-evaluator';

export interface SettlementInput {
  handId: string;
  pots: Pot[];
  communityCards: Card[];
  activeSeatCards: Map<number, Card[]>; // seat -> hole cards (only active/non-folded)
  allPlayerStacks: Map<number, number>; // seat -> current stack
}

/**
 * Settle a hand where all opponents folded (no showdown).
 */
export function settleWithoutShowdown(input: {
  handId: string;
  winnerSeat: number;
  totalPot: number;
  allPlayerStacks: Map<number, number>;
  playerContributions: Map<number, number>;
}): HandSettlement {
  const { handId, winnerSeat, totalPot, allPlayerStacks, playerContributions } = input;

  const winnerContrib = playerContributions.get(winnerSeat) ?? 0;
  const profit = totalPot - winnerContrib;
  const finalStacks: { seat: number; stackBB: number }[] = [];
  const chipMovements: { seat: number; changesBB: number }[] = [];

  for (const [seat, stack] of allPlayerStacks) {
    const contrib = playerContributions.get(seat) ?? 0;
    if (seat === winnerSeat) {
      const newStack = stack + totalPot;
      finalStacks.push({ seat, stackBB: newStack });
      chipMovements.push({ seat, changesBB: profit });
    } else {
      finalStacks.push({ seat, stackBB: stack });
      chipMovements.push({ seat, changesBB: -contrib });
    }
  }

  return {
    handId,
    winners: [{
      seat: winnerSeat,
      potIndex: 0,
      amountWonBB: totalPot,
      handRank: null,
    }],
    showdownHands: [],
    chipMovements,
    playerFinalStacks: finalStacks.sort((a, b) => a.seat - b.seat),
    wonWithoutShowdown: true,
  };
}

/**
 * Settle a hand at showdown — evaluate hands and distribute pots.
 */
export function settleAtShowdown(input: SettlementInput): HandSettlement {
  const { handId, pots, communityCards, activeSeatCards, allPlayerStacks } = input;

  // Evaluate each active player's hand
  const evaluations = new Map<number, EvaluatedHand>();
  for (const [seat, holeCards] of activeSeatCards) {
    const allCards = [...holeCards, ...communityCards];
    if (allCards.length >= 5) {
      evaluations.set(seat, evaluateHand(allCards));
    }
  }

  const winners: Winner[] = [];
  const stackChanges = new Map<number, number>(); // seat -> net change

  // Initialize stack changes to 0
  for (const seat of allPlayerStacks.keys()) {
    stackChanges.set(seat, 0);
  }

  // Distribute each pot
  for (let potIdx = 0; potIdx < pots.length; potIdx++) {
    const pot = pots[potIdx];
    const eligibleSeats = pot.eligibleSeats.filter((s) => evaluations.has(s));

    if (eligibleSeats.length === 0) {
      // Shouldn't happen, but if it does, give pot to first eligible
      continue;
    }

    // Find the best hand(s) among eligible
    let bestScore = -1;
    const potWinners: number[] = [];

    for (const seat of eligibleSeats) {
      const eval_ = evaluations.get(seat)!;
      if (eval_.score > bestScore) {
        bestScore = eval_.score;
        potWinners.length = 0;
        potWinners.push(seat);
      } else if (eval_.score === bestScore) {
        potWinners.push(seat);
      }
    }

    // Split pot among winners
    const shareAmount = pot.amount / potWinners.length;
    for (const seat of potWinners) {
      const eval_ = evaluations.get(seat)!;
      winners.push({
        seat,
        potIndex: potIdx,
        amountWonBB: shareAmount,
        handRank: eval_.description,
      });
      stackChanges.set(seat, (stackChanges.get(seat) ?? 0) + shareAmount);
    }
  }

  // Calculate contributions to determine net chip movements
  // Total won minus what was contributed
  const showdownHands = Array.from(evaluations.entries()).map(([seat, eval_]) => ({
    seat,
    holeCards: activeSeatCards.get(seat) ?? [],
    handRank: eval_.description,
  }));

  // Calculate final stacks and net changes
  // Each active player's contribution = their stack deficit
  // We calculate from the difference between original and current stack
  const chipMovements: { seat: number; changesBB: number }[] = [];
  const playerFinalStacks: { seat: number; stackBB: number }[] = [];

  for (const [seat, currentStack] of allPlayerStacks) {
    const winnings = stackChanges.get(seat) ?? 0;
    const newStack = currentStack + winnings;
    playerFinalStacks.push({ seat, stackBB: newStack });

    // Net change: winnings minus what they already lost (current stack already reduced)
    chipMovements.push({ seat, changesBB: winnings > 0 ? winnings : 0 });
  }

  return {
    handId,
    winners,
    showdownHands: showdownHands.sort((a, b) => a.seat - b.seat),
    chipMovements: chipMovements.sort((a, b) => a.seat - b.seat),
    playerFinalStacks: playerFinalStacks.sort((a, b) => a.seat - b.seat),
    wonWithoutShowdown: false,
  };
}
