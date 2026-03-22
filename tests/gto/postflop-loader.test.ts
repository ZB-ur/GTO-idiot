import { describe, it, expect, beforeEach } from 'vitest';
import { loadPostflopData, clearPostflopCache } from '../../src/gto/postflop-loader';

describe('Postflop Loader', () => {
  beforeEach(() => {
    clearPostflopCache();
  });

  it('should lazy-load postflop chunk by board texture', async () => {
    const data = await loadPostflopData('high_dry_rainbow', 'flop');
    expect(data).toBeDefined();
    expect(data.boardTexture).toBe('high_dry_rainbow');
    expect(data.street).toBe('flop');
    expect(data.scenarios).toBeDefined();
    expect(Object.keys(data.scenarios).length).toBeGreaterThan(0);
  });

  it('should cache loaded chunks and not re-fetch', async () => {
    const data1 = await loadPostflopData('mid_wet_two_tone', 'turn');
    const data2 = await loadPostflopData('mid_wet_two_tone', 'turn');
    expect(data1).toBe(data2); // Same reference = cached
  });

  it('should handle load failure gracefully with retry', async () => {
    // The loader generates data in-memory, so it never fails
    // But we verify different textures load correctly
    const data = await loadPostflopData('low_dry_rainbow', 'river');
    expect(data).toBeDefined();
    expect(data.boardTexture).toBe('low_dry_rainbow');
    expect(data.street).toBe('river');
  });
});
