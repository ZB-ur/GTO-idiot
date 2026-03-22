import type { SidePot } from '../types';

export class PotManager {
  private mainPot: number = 0;
  private sidePots: SidePot[] = [];

  getMainPot(): number {
    return this.mainPot;
  }

  getSidePots(): SidePot[] {
    return [...this.sidePots];
  }

  getTotalPot(): number {
    return this.mainPot + this.sidePots.reduce((sum, sp) => sum + sp.amount, 0);
  }

  addBet(amount: number): void {
    this.mainPot += amount;
  }

  /**
   * Calculate side pots when one or more players are all-in.
   * Each bet entry represents total bet contributed this hand by each player.
   * Players who folded should NOT be included (they forfeited their bets already added to pot).
   */
  calculateSidePots(bets: { playerId: string; amount: number; isAllIn: boolean }[]): void {
    if (bets.length === 0) return;

    // Sort by bet amount ascending
    const sorted = [...bets].sort((a, b) => a.amount - b.amount);

    // Check if any player is all-in with less than the max bet
    const hasAllIn = sorted.some(
      (b, i) => b.isAllIn && i < sorted.length - 1 && b.amount < sorted[sorted.length - 1].amount
    );

    if (!hasAllIn) {
      // No side pots needed — everything goes into main pot
      this.mainPot = sorted.reduce((sum, b) => sum + b.amount, 0);
      this.sidePots = [];
      return;
    }

    // Build pots layer by layer
    const pots: SidePot[] = [];
    let previousLevel = 0;

    // Get unique bet levels from all-in players
    const allInLevels = [...new Set(
      sorted.filter((b) => b.isAllIn).map((b) => b.amount)
    )].sort((a, b) => a - b);

    // Add the max bet level if not already there
    const maxBet = Math.max(...sorted.map((b) => b.amount));
    if (!allInLevels.includes(maxBet)) {
      allInLevels.push(maxBet);
    }

    for (const level of allInLevels) {
      const layerAmount = level - previousLevel;
      if (layerAmount <= 0) continue;

      // Each contributing player puts in min(their remaining contribution, layerAmount)
      let potAmount = 0;
      for (const bet of sorted) {
        const contribution = Math.min(
          Math.max(bet.amount - previousLevel, 0),
          layerAmount
        );
        potAmount += contribution;
      }

      // Eligible players are those whose bet >= this level
      pots.push({
        amount: potAmount,
        eligiblePlayerIds: sorted
          .filter((b) => b.amount >= level)
          .map((b) => b.playerId),
      });

      previousLevel = level;
    }

    // First pot is the main pot, rest are side pots
    if (pots.length > 0) {
      this.mainPot = pots[0].amount;
      this.sidePots = pots.slice(1);
    }
  }

  reset(): void {
    this.mainPot = 0;
    this.sidePots = [];
  }
}
