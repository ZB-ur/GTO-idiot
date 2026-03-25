import type { StorageStatus, CleanupResult } from '../types';

const STORAGE_PREFIX = 'mosaicat_';

export function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

export function getStorageStatus(): StorageStatus {
  return {
    usedBytes: 0,
    maxBytes: 5 * 1024 * 1024,
    usagePercentage: 0,
    handRecordCount: 0,
    maxHandRecords: 500,
    isNearLimit: false,
    isAvailable: typeof localStorage !== 'undefined',
  };
}

export function cleanup(keepRecentCount: number): CleanupResult {
  void keepRecentCount;
  return {
    deletedCount: 0,
    remainingCount: 0,
    freedBytes: 0,
    newUsagePercentage: 0,
  };
}

export function reset(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
