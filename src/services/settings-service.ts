import type { Settings, SettingsUpdate } from '../types';

const STORAGE_KEY = 'gto-idiot-settings';

const DEFAULT_SETTINGS: Settings = {
  blindLevel: '1/2',
  startingStackBB: 100,
  speed: 'normal',
  soundEnabled: true,
};

export class SettingsService {
  get(): Settings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return { ...DEFAULT_SETTINGS };
  }

  update(partial: SettingsUpdate): Settings {
    const current = this.get();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
}

export const settingsService = new SettingsService();
