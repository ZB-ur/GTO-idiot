/**
 * Feature Acceptance Tests: F-005 gto-strategy-data
 * GTO strategy data: preflop ranges and postflop simplified strategy tree
 */
import { describe, it, expect } from 'vitest';
import { getPreflopStrategy } from '../../../src/gto-strategy/preflop-ranges';
import { getPostflopStrategy } from '../../../src/gto-strategy/postflop-strategy';

describe('F-005: gto-strategy-data', () => {
  describe('F-005: preflop ranges', () => {
    it('F-005: should return opening range matrix for each position (UTG/HJ/CO/BTN/SB/BB)', () => {
      const positions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;

      for (const position of positions) {
        const strategy = getPreflopStrategy(position, 'open');

        // Should return a 13x13 matrix
        expect(strategy.rangeMatrix).toHaveLength(13);
        for (const row of strategy.rangeMatrix) {
          expect(row).toHaveLength(13);
        }

        // Each cell should have hand, action, and frequency
        const cell = strategy.rangeMatrix[0][0];
        expect(cell).toHaveProperty('hand');
        expect(cell).toHaveProperty('action');
        expect(cell).toHaveProperty('frequency');
        expect(['raise', 'call', 'fold']).toContain(cell.action);
        expect(cell.frequency).toBeGreaterThanOrEqual(0);
        expect(cell.frequency).toBeLessThanOrEqual(1);
      }
    });

    it('F-005: should return tighter range for UTG than for BTN', () => {
      const utgStrategy = getPreflopStrategy('UTG', 'open');
      const btnStrategy = getPreflopStrategy('BTN', 'open');

      // Count raise hands in each range
      const countRaises = (matrix: Array<Array<{ action: string }>>) =>
        matrix.flat().filter(c => c.action === 'raise').length;

      const utgRaises = countRaises(utgStrategy.rangeMatrix);
      const btnRaises = countRaises(btnStrategy.rangeMatrix);

      // BTN should have more raising hands than UTG
      expect(btnRaises).toBeGreaterThan(utgRaises);
    });

    it('F-005: should return 3-bet response range for each position when facing a raise', () => {
      const strategy = getPreflopStrategy('BTN', 'vs_raise', 'UTG');

      expect(strategy.rangeMatrix).toHaveLength(13);
      expect(strategy.scenario).toBe('vs_raise');
      expect(strategy.raiserPosition).toBe('UTG');
      expect(strategy.confidenceLevel).toBe('exact');

      // Should have a mix of raise (3-bet), call, and fold
      const actions = strategy.rangeMatrix.flat().map(c => c.action);
      expect(actions).toContain('raise');
      expect(actions).toContain('call');
      expect(actions).toContain('fold');
    });

    it('F-005: should return 4-bet response range', () => {
      const strategy = getPreflopStrategy('CO', 'vs_3bet', 'BTN');

      expect(strategy.rangeMatrix).toHaveLength(13);
      expect(strategy.confidenceLevel).toBe('exact');
    });
  });

  describe('F-005: postflop strategy', () => {
    it('F-005: should return simplified strategy based on board texture, SPR, position, and hand category', () => {
      const strategy = getPostflopStrategy({
        boardTexture: 'dry',
        street: 'flop',
        position: 'IP',
        sprRange: 'medium',
        handCategory: 'strong_made',
      });

      expect(strategy).toHaveProperty('recommendation');
      expect(strategy.recommendation).toHaveProperty('primaryAction');
      expect(strategy.recommendation).toHaveProperty('betSizing');
      expect(strategy.recommendation).toHaveProperty('reasoning');
      expect(['check', 'bet', 'call', 'raise', 'fold']).toContain(strategy.recommendation.primaryAction);
    });

    it('F-005: should mark postflop strategy confidence as "approximate"', () => {
      const strategy = getPostflopStrategy({
        boardTexture: 'wet',
        street: 'flop',
        position: 'OOP',
        sprRange: 'high',
        handCategory: 'medium_made',
      });

      expect(strategy.confidenceLevel).toBe('approximate');
    });

    it('F-005: should mark preflop strategy confidence as "exact"', () => {
      const strategy = getPreflopStrategy('UTG', 'open');
      expect(strategy.confidenceLevel).toBe('exact');
    });

    it('F-005: should provide different recommendations for different board textures', () => {
      const dryBoard = getPostflopStrategy({
        boardTexture: 'dry',
        street: 'flop',
        position: 'IP',
        sprRange: 'medium',
        handCategory: 'medium_made',
      });

      const wetBoard = getPostflopStrategy({
        boardTexture: 'wet',
        street: 'flop',
        position: 'IP',
        sprRange: 'medium',
        handCategory: 'medium_made',
      });

      // Strategy should differ based on board texture
      // On wet boards, medium hands tend to check more; on dry boards, they can bet more
      expect(dryBoard.recommendation.primaryAction).not.toEqual(wetBoard.recommendation.primaryAction);
    });
  });
});
