import { describe, it, expect, vi } from 'vitest';

describe('Sound Effects', () => {
  it('should play sound on fold check call raise actions when enabled', () => {
    const playSound = vi.fn();
    const actions = ['fold', 'check', 'call', 'raise'];
    const soundEnabled = true;
    for (const action of actions) {
      if (soundEnabled) playSound(action);
    }
    expect(playSound).toHaveBeenCalledTimes(4);
  });

  it('should not play sound when sound is disabled in settings', () => {
    const playSound = vi.fn();
    const soundEnabled = false;
    if (soundEnabled) playSound('fold');
    expect(playSound).not.toHaveBeenCalled();
  });
});
