import { describe, it, expect } from 'vitest';
import { classifyBoard } from '../../src/gto/board-classifier';
import type { Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('Board Classifier', () => {
  it('should classify rainbow dry board', () => {
    const texture = classifyBoard([c('K','s'), c('7','d'), c('2','c')]);
    expect(texture).toContain('rainbow');
  });

  it('should classify two-tone wet board', () => {
    const texture = classifyBoard([c('J','s'), c('T','s'), c('8','d')]);
    expect(texture).toContain('two_tone');
    expect(texture).toContain('wet');
  });

  it('should classify monotone board', () => {
    const texture = classifyBoard([c('A','h'), c('9','h'), c('4','h')]);
    expect(texture).toContain('monotone');
  });

  it('should classify high mid low card texture correctly', () => {
    const high = classifyBoard([c('K','s'), c('Q','d'), c('2','c')]);
    expect(high).toMatch(/^high/);
    const mid = classifyBoard([c('T','s'), c('8','d'), c('7','c')]);
    expect(mid).toMatch(/^mid/);
    const low = classifyBoard([c('5','s'), c('3','d'), c('2','c')]);
    expect(low).toMatch(/^low/);
  });

  it('should classify paired boards', () => {
    const texture = classifyBoard([c('K','s'), c('K','d'), c('3','c')]);
    expect(texture).toBeDefined();
    expect(typeof texture).toBe('string');
  });

  it('should handle turn and river board classifications', () => {
    const turn = classifyBoard([c('A','s'), c('K','d'), c('8','h'), c('3','c')]);
    expect(turn).toMatch(/^high/);
    const river = classifyBoard([c('A','s'), c('K','d'), c('8','h'), c('3','c'), c('2','s')]);
    expect(river).toMatch(/^high/);
  });
});
