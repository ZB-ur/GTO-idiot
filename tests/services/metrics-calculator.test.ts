import { describe, it, expect } from 'vitest';
import { calculateKeyMetrics, type MetricsInput } from '../../src/services/metrics-calculator';

function makeInput(overrides: Partial<MetricsInput> = {}): MetricsInput {
  return {
    vpip: false, pfr: false, three_bet: false,
    went_to_showdown: false, won_at_showdown: false,
    bets_and_raises: 0, calls: 0,
    cbet_flop: false, faced_flop_cbet: false, folded_to_flop_cbet: false,
    ...overrides,
  };
}

describe('Metrics Calculator', () => {
  it('should calculate VPIP from action history', () => {
    const inputs = [
      makeInput({ vpip: true }), makeInput({ vpip: true }),
      makeInput({ vpip: false }), makeInput({ vpip: false }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    expect(metrics.vpip).toBe(50);
  });

  it('should calculate PFR from preflop raises', () => {
    const inputs = [
      makeInput({ pfr: true }), makeInput({ pfr: false }),
      makeInput({ pfr: false }), makeInput({ pfr: true }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    expect(metrics.pfr).toBe(50);
  });

  it('should calculate aggression factor', () => {
    const inputs = [
      makeInput({ bets_and_raises: 3, calls: 1 }),
      makeInput({ bets_and_raises: 2, calls: 1 }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    // (3+2) / (1+1) = 2.5
    expect(metrics.aggression_factor).toBe(2.5);
  });

  it('should handle division by zero in metric calculations', () => {
    // Empty inputs
    const emptyMetrics = calculateKeyMetrics([]);
    expect(emptyMetrics.vpip).toBe(0);
    expect(emptyMetrics.pfr).toBe(0);
    expect(emptyMetrics.aggression_factor).toBe(0);

    // No calls — AF should be 999 (capped infinity) if there are raises
    const noCallInputs = [makeInput({ bets_and_raises: 5, calls: 0 })];
    const noCallMetrics = calculateKeyMetrics(noCallInputs);
    expect(noCallMetrics.aggression_factor).toBe(999);
  });

  it('should calculate 3Bet%', () => {
    const inputs = [
      makeInput({ three_bet: true }), makeInput({ three_bet: false }),
      makeInput({ three_bet: true }), makeInput({ three_bet: false }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    expect(metrics.three_bet).toBe(50);
  });

  it('should calculate WTSD%', () => {
    const inputs = [
      makeInput({ vpip: true, went_to_showdown: true }),
      makeInput({ vpip: true, went_to_showdown: false }),
      makeInput({ vpip: true, went_to_showdown: true }),
      makeInput({ vpip: false, went_to_showdown: false }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    // 2 showdowns out of 3 who saw flop (vpip)
    expect(metrics.wtsd).toBeCloseTo(66.67, 0);
  });

  it('should calculate W$SD', () => {
    const inputs = [
      makeInput({ went_to_showdown: true, won_at_showdown: true }),
      makeInput({ went_to_showdown: true, won_at_showdown: false }),
    ];
    const metrics = calculateKeyMetrics(inputs);
    expect(metrics.won_at_showdown).toBe(50);
  });
});
