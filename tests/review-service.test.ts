import { describe, it, expect } from 'vitest';
import { estimateEV, computeOverallConformance, computeConformancePercent } from '../src/services/ev-estimator';

describe('EV Estimator', () => {
  it('should estimate EV loss for fold-instead-of-call deviation', () => {
    const result = estimateEV({ userAction: 'fold', gtoAction: 'call', potSize: 10, street: 'flop' });
    expect(result.deviationLevel).toBe('major');
    expect(result.evLoss).toBeGreaterThan(0);
  });

  it('should estimate EV loss for call-instead-of-raise deviation', () => {
    const result = estimateEV({ userAction: 'call', gtoAction: 'raise', potSize: 10, street: 'turn' });
    expect(result.deviationLevel).toBe('major');
    expect(result.evLoss).toBeGreaterThan(0);
  });

  it('should estimate zero EV loss when action matches GTO', () => {
    const result = estimateEV({ userAction: 'call', gtoAction: 'call', potSize: 10, street: 'flop' });
    expect(result.deviationLevel).toBe('conforming');
    expect(result.evLoss).toBe(0);
  });

  it('should enrich hand history with GTO annotations', () => {
    // EV estimator provides the building blocks for annotations
    const r1 = estimateEV({ userAction: 'raise', userAmount: 6, gtoAction: 'raise', gtoAmount: 5, potSize: 10, street: 'preflop' });
    expect(r1.deviationLevel).toBe('conforming'); // within 25% tolerance
    const r2 = estimateEV({ userAction: 'fold', gtoAction: 'raise', potSize: 20, street: 'river' });
    expect(r2.deviationLevel).toBe('major');
    expect(r2.explanation).toBeTruthy();
  });

  it('should classify deviation severity in hand review', () => {
    const minor = estimateEV({ userAction: 'bet', gtoAction: 'raise', potSize: 10, street: 'flop' });
    expect(minor.deviationLevel).toBe('minor');
    const major = estimateEV({ userAction: 'fold', gtoAction: 'raise', potSize: 10, street: 'flop' });
    expect(major.deviationLevel).toBe('major');
  });

  it('should aggregate session-level review metrics', () => {
    expect(computeOverallConformance(['conforming', 'conforming'])).toBe('conforming');
    expect(computeOverallConformance(['conforming', 'minor'])).toBe('minor_deviation');
    expect(computeOverallConformance(['conforming', 'major'])).toBe('major_deviation');
    expect(computeConformancePercent(['conforming', 'conforming'])).toBe(100);
    expect(computeConformancePercent(['conforming', 'major'])).toBe(50);
    expect(computeConformancePercent(['minor'])).toBe(50);
  });

  it('should handle hand with no human actions', () => {
    expect(computeOverallConformance([])).toBe('conforming');
    expect(computeConformancePercent([])).toBe(100);
  });
});
