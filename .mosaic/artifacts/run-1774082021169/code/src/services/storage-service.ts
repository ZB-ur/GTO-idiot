/**
 * Storage service — manages IndexedDB storage info, cleanup, and user settings.
 */

import { db, DEFAULT_SETTINGS, type StoredUserSettings } from './db';

/** Storage usage information */
export interface StorageInfo {
  readonly totalHands: number;
  readonly usedBytes: number;
  readonly usedMB: number;
  readonly hasWarning: boolean;
  readonly warningMessage?: string;
  readonly oldestHandDate?: string;
}

const WARNING_HAND_THRESHOLD = 10_000;
const WARNING_MB_THRESHOLD = 50;

/**
 * Get storage usage information.
 */
export async function getStorageInfo(): Promise<StorageInfo> {
  const totalHands = await db.hands.count();

  // Estimate storage usage
  let usedBytes = 0;
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate();
    usedBytes = estimate.usage ?? 0;
  }
  const usedMB = Math.round((usedBytes / (1024 * 1024)) * 100) / 100;

  // Find oldest hand
  const oldest = await db.hands.orderBy('playedAt').first();
  const oldestHandDate = oldest?.playedAt;

  // Check warnings
  const hasWarning = totalHands >= WARNING_HAND_THRESHOLD || usedMB >= WARNING_MB_THRESHOLD;
  let warningMessage: string | undefined;
  if (hasWarning) {
    const parts: string[] = [];
    if (totalHands >= WARNING_HAND_THRESHOLD) {
      parts.push(`${totalHands} hands stored (threshold: ${WARNING_HAND_THRESHOLD})`);
    }
    if (usedMB >= WARNING_MB_THRESHOLD) {
      parts.push(`${usedMB}MB used (threshold: ${WARNING_MB_THRESHOLD}MB)`);
    }
    warningMessage = `Storage warning: ${parts.join('; ')}. Consider deleting old hands.`;
  }

  return { totalHands, usedBytes, usedMB, hasWarning, warningMessage, oldestHandDate };
}

/**
 * Delete hand records older than the given date.
 * Returns deletion summary.
 */
export async function clearOldHands(olderThan: string): Promise<{
  deletedCount: number;
  remainingCount: number;
  freedBytes: number;
}> {
  const beforeInfo = await getStorageInfo();

  const toDelete = await db.hands
    .where('playedAt')
    .below(olderThan)
    .primaryKeys();

  await db.hands.bulkDelete(toDelete);

  const afterInfo = await getStorageInfo();
  const freedBytes = Math.max(0, beforeInfo.usedBytes - afterInfo.usedBytes);

  return {
    deletedCount: toDelete.length,
    remainingCount: afterInfo.totalHands,
    freedBytes,
  };
}

/**
 * Get user settings. Returns defaults if not yet saved.
 */
export async function getSettings(): Promise<StoredUserSettings> {
  const stored = await db.settings.get('default');
  return stored ?? { ...DEFAULT_SETTINGS };
}

/**
 * Update user settings (partial merge).
 */
export async function updateSettings(
  updates: Partial<Omit<StoredUserSettings, 'id'>>,
): Promise<StoredUserSettings> {
  const current = await getSettings();
  const merged: StoredUserSettings = {
    ...current,
    ...updates,
    id: 'default',
    botActionDelay: {
      ...current.botActionDelay,
      ...(updates.botActionDelay ?? {}),
    },
  };
  await db.settings.put(merged);
  return merged;
}
