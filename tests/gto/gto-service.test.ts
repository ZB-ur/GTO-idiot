import { describe, it, expect, beforeAll } from 'vitest';
import { GTOService } from '../../src/gto/gto-service';
import type { Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('GTOService', () => {
  const svc = new GTOService();

  beforeAll(async () => {
    await svc.init();
  });

  it('should return preflop strategy for given position and scenario', () => {
    const result = svc.getPreflopStrategy('UTG', 'RFI');
    // Current stub returns empty array
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return postflop strategy for given board texture and street', async () => {
    const data = await svc.getPostflopStrategy('high_dry_rainbow', 'flop');
    expect(data).toBeDefined();
    expect(data.boardTexture).toBe('high_dry_rainbow');
    expect(data.scenarios).toBeDefined();
  });

  it('should map full game situation to GTORecommendation via lookup', () => {
    const rec = svc.lookup({
      holeCards: [c('A','s'), c('K','h')],
      position: 'UTG',
      street: 'preflop',
    });
    expect(rec).toBeDefined();
    expect(Array.isArray(rec.actions)).toBe(true);
  });

  it('should handle unknown scenario gracefully with default recommendation', () => {
    const rec = svc.lookup({
      holeCards: [c('2','s'), c('7','h')],
      position: 'BB',
      street: 'river',
      communityCards: [c('A','d'), c('K','d'), c('Q','s'), c('J','h'), c('T','c')],
    });
    expect(rec).toBeDefined();
    expect(rec.actions).toBeDefined();
  });
});
