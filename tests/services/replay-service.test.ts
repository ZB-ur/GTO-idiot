import { describe, it, expect } from 'vitest';
import { ReplayService } from '../../src/services/replay-service';
import type { ActionType, StrategyAction } from '../../src/types';

describe('ReplayService', () => {
  const svc = new ReplayService();

  it('should enrich hand record with GTO analysis per decision point', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'UTG', potSize: 3, actionIndex: 0, streetActions: [] },
      'raise'
    );
    expect(analysis).toBeDefined();
    expect(analysis.deviation).toBeDefined();
    expect(analysis.recommendedActions.length).toBeGreaterThan(0);
  });

  it('should classify deviation as match for correct GTO play', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'UTG', potSize: 3, actionIndex: 0, streetActions: [] },
      'raise'
    );
    // open_raise scenario: raise has 0.6 frequency (>= 0.5 = match)
    expect(analysis.deviation).toBe('match');
  });

  it('should classify deviation as minor for close-to-GTO play', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'UTG', potSize: 3, actionIndex: 1,
        streetActions: [{ action: 'raise' as ActionType, playerId: 'other' }] },
      'call'
    );
    // 3bet scenario: call has 0.35 frequency (>= 0.1, < 0.5 = minor)
    expect(analysis.deviation).toBe('minor');
  });

  it('should classify deviation as major for anti-GTO play', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'UTG', potSize: 3, actionIndex: 0, streetActions: [] },
      'check'
    );
    // open_raise scenario: check has 0 frequency (< 0.1 = major)
    expect(analysis.deviation).toBe('major');
  });

  it('should generate explanation text for each deviation', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'UTG', potSize: 3, actionIndex: 0, streetActions: [] },
      'fold'
    );
    expect(analysis.explanation).toBeDefined();
    expect(analysis.explanation!.length).toBeGreaterThan(0);
  });

  it('should handle hands with no player decisions', () => {
    const analysis = svc.analyzeDecision(
      { street: 'preflop', position: 'BB', potSize: 3, actionIndex: 0, streetActions: [] },
      'check'
    );
    expect(analysis).toBeDefined();
  });
});
