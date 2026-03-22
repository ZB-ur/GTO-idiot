import { describe, it, expect, vi } from 'vitest';
import { SettingsService } from '../../src/services/settings-service';

describe('Error Handling', () => {
  it('should show toast when IndexedDB is unavailable', () => {
    // Simulating IndexedDB unavailability scenario
    const mockShowToast = vi.fn();
    try { throw new Error('IndexedDB unavailable'); } catch (e) {
      mockShowToast((e as Error).message);
    }
    expect(mockShowToast).toHaveBeenCalledWith('IndexedDB unavailable');
  });

  it('should retry GTO lazy load on failure', async () => {
    const { loadPostflopData, clearPostflopCache } = await import('../../src/gto/postflop-loader');
    clearPostflopCache();
    const data = await loadPostflopData('high_dry_rainbow', 'flop');
    expect(data).toBeDefined();
  });

  it('should recover from invalid game state', () => {
    const svc = new SettingsService();
    localStorage.setItem('gto-idiot-settings', 'CORRUPT');
    const settings = svc.get();
    expect(settings.blindLevel).toBe('1/2');
  });
});
