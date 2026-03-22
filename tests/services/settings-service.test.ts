import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsService } from '../../src/services/settings-service';

describe('SettingsService', () => {
  let svc: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    svc = new SettingsService();
  });

  it('should return default settings when localStorage is empty', () => {
    const s = svc.get();
    expect(s.blindLevel).toBe('1/2');
    expect(s.startingStackBB).toBe(100);
    expect(s.speed).toBe('normal');
    expect(s.soundEnabled).toBe(true);
  });

  it('should persist updated settings to localStorage', () => {
    svc.update({ blindLevel: '2/5' });
    const s = svc.get();
    expect(s.blindLevel).toBe('2/5');
  });

  it('should merge partial updates without overwriting other fields', () => {
    svc.update({ speed: 'fast' });
    const s = svc.get();
    expect(s.speed).toBe('fast');
    expect(s.blindLevel).toBe('1/2');
    expect(s.soundEnabled).toBe(true);
  });

  it('should validate setting values', () => {
    const s = svc.update({ startingStackBB: 50 });
    expect(s.startingStackBB).toBe(50);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('gto-idiot-settings', '{invalid json!!!');
    const s = svc.get();
    expect(s.blindLevel).toBe('1/2');
    expect(s.startingStackBB).toBe(100);
  });
});
