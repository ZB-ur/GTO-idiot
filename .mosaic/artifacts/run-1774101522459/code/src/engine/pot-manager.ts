// ============================================================
// PotManager — Main pot, side pots, contribution tracking
// ============================================================

import type { Pot } from '../types';

export interface PlayerContribution {
  seat: number;
  totalContributed: number;
  isActive: boolean; // still in hand (hasn't folded)
  isAllIn: boolean;
}

export class PotManager {
  private contributions: Map<number, PlayerContribution> = new Map();

  /** Reset for a new hand with given seats. */
  reset(seats: number[]): void {
    this.contributions = new Map();
    for (const seat of seats) {
      this.contributions.set(seat, {
        seat,
        totalContributed: 0,
        isActive: true,
        isAllIn: false,
      });
    }
  }

  /** Record a contribution (bet/call/raise/blind/all-in). */
  addContribution(seat: number, amount: number): void {
    const pc = this.contributions.get(seat);
    if (!pc) throw new Error(`Unknown seat ${seat}`);
    pc.totalContributed += amount;
  }

  /** Mark a player as folded (no longer eligible for pots). */
  markFolded(seat: number): void {
    const pc = this.contributions.get(seat);
    if (!pc) throw new Error(`Unknown seat ${seat}`);
    pc.isActive = false;
  }

  /** Mark a player as all-in. */
  markAllIn(seat: number): void {
    const pc = this.contributions.get(seat);
    if (!pc) throw new Error(`Unknown seat ${seat}`);
    pc.isAllIn = true;
  }

  /** Get total amount contributed by a player across all rounds. */
  getContribution(seat: number): number {
    return this.contributions.get(seat)?.totalContributed ?? 0;
  }

  /** Get total pot size (sum of all contributions). */
  getTotalPot(): number {
    let total = 0;
    for (const pc of this.contributions.values()) {
      total += pc.totalContributed;
    }
    return total;
  }

  /**
   * Calculate main pot and side pots based on contributions.
   * Uses the standard side-pot algorithm:
   * 1. Sort all-in players by contribution ascending
   * 2. Each all-in amount creates a pot boundary
   * 3. Players who haven't folded are eligible for pots up to their contribution level
   */
  calculatePots(): Pot[] {
    const players = Array.from(this.contributions.values());
    const activePlayers = players.filter((p) => p.isActive);

    if (activePlayers.length === 0) {
      return [{ amount: this.getTotalPot(), eligibleSeats: [] }];
    }

    // Find all unique contribution levels from all-in players
    const allInLevels = activePlayers
      .filter((p) => p.isAllIn)
      .map((p) => p.totalContributed)
      .sort((a, b) => a - b);

    // Remove duplicates
    const uniqueLevels = [...new Set(allInLevels)];

    // If no side pots needed, return single main pot
    if (uniqueLevels.length === 0) {
      return [{
        amount: this.getTotalPot(),
        eligibleSeats: activePlayers.map((p) => p.seat).sort((a, b) => a - b),
      }];
    }

    const pots: Pot[] = [];
    let previousLevel = 0;

    for (const level of uniqueLevels) {
      const sliceAmount = level - previousLevel;
      if (sliceAmount <= 0) continue;

      let potAmount = 0;
      const eligible: number[] = [];

      for (const p of players) {
        const contrib = Math.min(p.totalContributed, level) - Math.min(p.totalContributed, previousLevel);
        potAmount += contrib;
        // Eligible if active and contributed at least to this level
        if (p.isActive && p.totalContributed >= level) {
          eligible.push(p.seat);
        }
        // Also eligible if active and all-in at exactly this level
        if (p.isActive && p.isAllIn && p.totalContributed === level && !eligible.includes(p.seat)) {
          eligible.push(p.seat);
        }
      }

      if (potAmount > 0) {
        pots.push({
          amount: potAmount,
          eligibleSeats: eligible.sort((a, b) => a - b),
        });
      }

      previousLevel = level;
    }

    // Remaining pot (contributions above the highest all-in level)
    const maxAllIn = uniqueLevels[uniqueLevels.length - 1];
    let remainingAmount = 0;
    const remainingEligible: number[] = [];

    for (const p of players) {
      const excess = Math.max(0, p.totalContributed - maxAllIn);
      remainingAmount += excess;
      if (p.isActive && p.totalContributed > maxAllIn) {
        remainingEligible.push(p.seat);
      }
    }

    if (remainingAmount > 0) {
      pots.push({
        amount: remainingAmount,
        eligibleSeats: remainingEligible.sort((a, b) => a - b),
      });
    }

    // If somehow we end up with no pots but there are contributions, create a single pot
    if (pots.length === 0 && this.getTotalPot() > 0) {
      return [{
        amount: this.getTotalPot(),
        eligibleSeats: activePlayers.map((p) => p.seat).sort((a, b) => a - b),
      }];
    }

    return pots;
  }
}
