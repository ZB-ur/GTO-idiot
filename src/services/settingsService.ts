import type { UserSettings, UpdateSettingsRequest } from '../types';
import { get, set } from './storageService';

const SETTINGS_KEY = 'user_settings';

export function getDefaultSettings(): UserSettings {
  return {
    language: 'zh',
    botSpeed: 'normal',
    botSpeedMs: 1000,
    defaultBuyIn: 100,
  };
}

export function getSettings(): UserSettings {
  const saved = get<UserSettings>(SETTINGS_KEY);
  return saved ?? getDefaultSettings();
}

export function updateSettings(request: UpdateSettingsRequest): UserSettings {
  const current = getSettings();
  const updated: UserSettings = {
    ...current,
    ...request,
    botSpeedMs:
      request.botSpeed === 'slow'
        ? 2000
        : request.botSpeed === 'fast'
          ? 500
          : 1000,
  };
  set(SETTINGS_KEY, updated);
  return updated;
}
