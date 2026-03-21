// ============================================================
// Preflop GTO Ranges — Public API for preflop range lookup
// ============================================================

import type { Card, Position } from '../types';
import type { PreflopRange, PreflopRangeAction, PreflopScenario } from '../types';
import { lookupPreflopRange, lookupComboFrequency, holeCardsToCombo } from './preflop-range-data';

/**
 * Get the full preflop GTO range for a position and scenario.
 * Implements the /gto/preflop-range API endpoint.
 */
export function getPreflopRange(
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): PreflopRange {
  const actions = lookupPreflopRange(position, scenario, openerPosition);
  return {
    position,
    scenario,
    actions,
  };
}

/**
 * Determine if a specific hand combo is in the GTO range for a position/scenario.
 * Returns true if the hand has a non-zero raise or call frequency.
 */
export function isInRange(
  handCombo: string,
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): boolean {
  const freq = lookupComboFrequency(handCombo, position, scenario, openerPosition);
  return freq.raise > 0 || freq.call > 0;
}

/**
 * Get the GTO-recommended preflop action for specific hole cards.
 * Returns the action with the highest frequency.
 */
export function getRecommendedPreflopAction(
  holeCards: [Card, Card],
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): { action: 'fold' | 'call' | 'raise'; frequency: number } {
  const combo = holeCardsToCombo(holeCards);
  const freq = lookupComboFrequency(combo, position, scenario, openerPosition);

  if (freq.raise >= freq.call && freq.raise >= freq.fold) {
    return { action: 'raise', frequency: freq.raise };
  }
  if (freq.call >= freq.fold) {
    return { action: 'call', frequency: freq.call };
  }
  return { action: 'fold', frequency: freq.fold };
}

/**
 * Get only the hands that are in the playing range (non-zero raise/call).
 * Useful for range visualization.
 */
export function getPlayableRange(
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): PreflopRangeAction[] {
  const all = lookupPreflopRange(position, scenario, openerPosition);
  return all.filter((a) => a.frequencies.raise > 0 || a.frequencies.call > 0);
}

/**
 * Calculate the total opening/playing percentage for a position/scenario.
 */
export function getRangePercentage(
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): number {
  const playable = getPlayableRange(position, scenario, openerPosition);
  if (playable.length === 0) return 0;

  // Weight by combo count: pairs=6, suited=4, offsuit=12
  let totalWeight = 0;
  let playWeight = 0;
  const all = lookupPreflopRange(position, scenario, openerPosition);

  for (const entry of all) {
    const comboWeight = getComboWeight(entry.handCombo);
    totalWeight += comboWeight;
    const playFreq = entry.frequencies.raise + entry.frequencies.call;
    playWeight += comboWeight * playFreq;
  }

  return totalWeight > 0 ? (playWeight / totalWeight) * 100 : 0;
}

/** Get the number of actual combos for a canonical hand notation */
function getComboWeight(combo: string): number {
  if (combo.length === 2) return 6; // Pair (e.g., "AA")
  if (combo.endsWith('s')) return 4; // Suited (e.g., "AKs")
  return 12; // Offsuit (e.g., "AKo")
}
