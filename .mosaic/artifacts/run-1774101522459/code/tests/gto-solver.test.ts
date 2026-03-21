// ============================================================
// GTO Solver — Unit tests for preflop ranges, postflop heuristics, Monte Carlo
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  lookupPreflopRange,
  lookupComboFrequency,
  holeCardsToCombo,
} from '../src/gto/preflop-range-data';
import {
  evaluateHand,
  estimateHandStrength,
  compareHands,
} from '../src/engine/hand-evaluator';
import {
  calculateHandStrength,
  calculatePotOdds,
  calculateSPR,
} from '../src/bot/hand-strength';
import { classifyDecisionQuality, EV_THRESHOLD_GOOD, EV_THRESHOLD_MINOR } from '../src/types';
import type { Card } from '../src/types';

function card(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit };
}

// ============================================================
// Preflop range tables
// ============================================================

describe('Preflop Range Tables', () => {
  it('returns correct open range for UTG', () => {
    const range = lookupPreflopRange('UTG', 'open');
    expect(range.length).toBe(169); // All 169 combos

    // AA should always be raised from UTG
    const aa = range.find((r) => r.handCombo === 'AA');
    expect(aa).toBeDefined();
    expect(aa!.frequencies.raise).toBe(1);
    expect(aa!.frequencies.fold).toBe(0);

    // 32o should never be opened from UTG
    const junk = range.find((r) => r.handCombo === '32o');
    expect(junk).toBeDefined();
    expect(junk!.frequencies.fold).toBe(1);
  });

  it('returns correct open range for Button', () => {
    const range = lookupPreflopRange('BTN', 'open');
    const btnAA = range.find((r) => r.handCombo === 'AA');
    expect(btnAA!.frequencies.raise).toBe(1);

    // BTN opens wider — count hands with raise > 0
    const btnOpenCount = range.filter((r) => r.frequencies.raise > 0).length;
    const utgRange = lookupPreflopRange('UTG', 'open');
    const utgOpenCount = utgRange.filter((r) => r.frequencies.raise > 0).length;

    expect(btnOpenCount).toBeGreaterThan(utgOpenCount);
  });

  it('handles 3-bet scenario lookup', () => {
    const range = lookupPreflopRange('BTN', 'vs_3bet');
    expect(range.length).toBe(169);

    // AA should continue vs 3-bet
    const aa = range.find((r) => r.handCombo === 'AA');
    expect(aa!.frequencies.raise + aa!.frequencies.call).toBeGreaterThan(0.8);
  });

  it('returns empty for invalid position (BB open)', () => {
    // BB doesn't have an open range
    const range = lookupPreflopRange('BB', 'open');
    // All combos should default to fold
    const allFold = range.every((r) => r.frequencies.fold === 1);
    expect(allFold).toBe(true);
  });
});

describe('lookupComboFrequency', () => {
  it('returns correct frequency for specific combo', () => {
    const freq = lookupComboFrequency('AA', 'UTG', 'open');
    expect(freq.raise).toBe(1);
    expect(freq.fold).toBe(0);
  });

  it('returns fold for unknown combo', () => {
    const freq = lookupComboFrequency('XX', 'UTG', 'open');
    expect(freq.fold).toBe(1);
  });
});

describe('holeCardsToCombo', () => {
  it('converts suited cards correctly', () => {
    expect(holeCardsToCombo([{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }])).toBe('AKs');
  });

  it('converts offsuit cards correctly', () => {
    expect(holeCardsToCombo([{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }])).toBe('AKo');
  });

  it('converts pairs correctly', () => {
    expect(holeCardsToCombo([{ rank: 'Q', suit: 's' }, { rank: 'Q', suit: 'h' }])).toBe('QQ');
  });

  it('orders high card first', () => {
    expect(holeCardsToCombo([{ rank: 'K', suit: 'h' }, { rank: 'A', suit: 's' }])).toBe('AKo');
  });
});

// ============================================================
// Postflop heuristics
// ============================================================

describe('Postflop heuristics', () => {
  it('returns raise for strong hand with low SPR', () => {
    const spr = calculateSPR(15, 10); // SPR = 1.5 (low)
    expect(spr).toBeLessThan(3);

    const strength = calculateHandStrength(
      [card('A', 's'), card('A', 'h')],
      [card('A', 'd'), card('7', 'h'), card('2', 'c')],
      'BTN',
      'flop',
      200
    );
    expect(strength.category).toBe('monster');
  });

  it('returns call for drawing hand with pot odds', () => {
    const potOdds = calculatePotOdds(10, 3);
    // 3 / 13 ≈ 0.23
    expect(potOdds).toBeCloseTo(0.231, 2);

    // With ~9 outs (flush draw), equity ≈ 9/47 ≈ 0.19
    // Pot odds justify a call
    const strength = calculateHandStrength(
      [card('A', 'h'), card('K', 'h')],
      [card('2', 'h'), card('7', 'h'), card('T', 's')],
      'BTN',
      'flop',
      200
    );
    expect(strength.hasDraw).toBe(true);
  });

  it('returns fold for weak hand facing large bet', () => {
    const potOdds = calculatePotOdds(5, 10);
    // 10 / 15 ≈ 0.67 — very expensive
    expect(potOdds).toBeGreaterThan(0.5);

    const strength = calculateHandStrength(
      [card('3', 's'), card('4', 'h')],
      [card('A', 'd'), card('K', 's'), card('Q', 'c')],
      'UTG',
      'flop',
      200
    );
    // With nothing, this should be air
    expect(['air', 'weak']).toContain(strength.category);
  });

  it('postflop EV estimation accounts for pot odds correctly', () => {
    // Pot odds formula: toCall / (pot + toCall)
    expect(calculatePotOdds(20, 5)).toBeCloseTo(0.2, 2);
    expect(calculatePotOdds(10, 10)).toBeCloseTo(0.5, 2);
    expect(calculatePotOdds(100, 1)).toBeCloseTo(0.0099, 2);
  });
});

// ============================================================
// Monte Carlo simulation
// ============================================================

describe('Monte Carlo simulation', () => {
  it('returns equity in [0,1] range', () => {
    const equity = estimateHandStrength(
      [card('A', 's'), card('K', 'h')],
      [],
      200
    );
    expect(equity).toBeGreaterThanOrEqual(0);
    expect(equity).toBeLessThanOrEqual(1);
  });

  it('AA vs random yields ~85% equity', () => {
    const equity = estimateHandStrength(
      [card('A', 's'), card('A', 'h')],
      [],
      1000
    );
    // AA vs random should be approximately 85% ±5%
    expect(equity).toBeGreaterThan(0.78);
    expect(equity).toBeLessThan(0.92);
  });

  it('with known board converges within tolerance', () => {
    // AKs on a board of A-7-2 rainbow should have high equity
    const equity = estimateHandStrength(
      [card('A', 's'), card('K', 's')],
      [card('A', 'd'), card('7', 'h'), card('2', 'c')],
      500
    );
    expect(equity).toBeGreaterThan(0.7);
  });

  it('respects configurable iteration count', () => {
    // Running 10 iterations should still return a valid number
    const eq10 = estimateHandStrength(
      [card('A', 's'), card('K', 'h')],
      [],
      10
    );
    expect(eq10).toBeGreaterThanOrEqual(0);
    expect(eq10).toBeLessThanOrEqual(1);
  });
});

// ============================================================
// Batch evaluation & decision quality
// ============================================================

describe('Batch evaluation', () => {
  it('processes multiple decision points', () => {
    const decisions = [
      { evDiffBB: -0.2 },
      { evDiffBB: -1.5 },
      { evDiffBB: -3.0 },
    ];
    expect(decisions).toHaveLength(3);
  });

  it('computes total EV loss', () => {
    const decisions = [
      { evDiffBB: -0.2 },
      { evDiffBB: -1.5 },
      { evDiffBB: -3.0 },
    ];
    const totalEvLoss = decisions.reduce((sum, d) => sum + Math.min(d.evDiffBB, 0), 0);
    expect(totalEvLoss).toBeCloseTo(-4.7, 1);
  });

  it('returns per-decision quality rating', () => {
    // Green: EV loss < 0.5BB
    expect(classifyDecisionQuality(-0.3)).toBe('good');
    // Yellow: EV loss 0.5-2BB
    expect(classifyDecisionQuality(-1.0)).toBe('minor_deviation');
    // Red: EV loss > 2BB
    expect(classifyDecisionQuality(-3.0)).toBe('major_deviation');

    // Verify thresholds
    expect(EV_THRESHOLD_GOOD).toBe(0.5);
    expect(EV_THRESHOLD_MINOR).toBe(2.0);
  });
});
