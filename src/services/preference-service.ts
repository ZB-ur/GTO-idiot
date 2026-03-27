import type { SoundPreference } from '../types';
import type { PreferenceRecord } from './types';
import { getDB } from './db';

const SOUND_KEY = 'sound_enabled';

export async function getSoundPreference(): Promise<SoundPreference> {
  const db = await getDB();
  const record: PreferenceRecord | undefined = await db.get('preferences', SOUND_KEY);
  if (!record) {
    return { enabled: true };
  }
  return { enabled: record.value === true };
}

export async function updateSoundPreference(pref: SoundPreference): Promise<SoundPreference> {
  const db = await getDB();
  const record: PreferenceRecord = { key: SOUND_KEY, value: pref.enabled };
  await db.put('preferences', record);
  return { enabled: pref.enabled };
}
