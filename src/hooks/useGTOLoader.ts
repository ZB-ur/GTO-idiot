/**
 * useGTOLoader — Preloads and caches GTO reference data (preflop charts
 * and postflop guides) from static JSON files on app startup.
 *
 * Uses a module-level cache so data is fetched only once across the entire
 * app lifetime, regardless of how many components use this hook.
 */

import { useEffect, useState, useCallback } from 'react';
import type {
  AllPreflopCharts,
  AllPostflopGuides,
  PreflopChart,
  PostflopGuide,
  Position,
  PreflopScenario,
  BoardTexture,
  HandStrengthTier,
} from '../types';

// ─── Types ───────────────────────────────────────────────────────

export interface GTOLoaderState {
  /** Whether GTO data is currently loading. */
  isLoading: boolean;
  /** Whether GTO data has been loaded successfully. */
  isLoaded: boolean;
  /** Loading error, if any. */
  error: string | null;
  /** All preflop charts keyed by "{position}_{scenario}". */
  preflopCharts: AllPreflopCharts | null;
  /** All postflop guides. */
  postflopGuides: AllPostflopGuides | null;
  /** Get a specific preflop chart. */
  getPreflopChart: (position: Position, scenario: PreflopScenario) => PreflopChart | null;
  /** Get a specific postflop guide. */
  getPostflopGuide: (
    boardTexture: BoardTexture,
    handStrength: HandStrengthTier,
    street: 'flop' | 'turn' | 'river',
    isInPosition: boolean,
  ) => PostflopGuide | null;
  /** Force reload data (e.g., after an error). */
  reload: () => void;
}

// ─── Module-level cache ──────────────────────────────────────────

let cachedPreflop: AllPreflopCharts | null = null;
let cachedPostflop: AllPostflopGuides | null = null;
let loadPromise: Promise<void> | null = null;
let loadError: string | null = null;
let loadListeners = new Set<() => void>();

function notifyListeners(): void {
  loadListeners.forEach((l) => l());
}

/**
 * Fetch and cache GTO data from static JSON files.
 * Returns the existing promise if already in-flight, so concurrent
 * callers don't trigger duplicate fetches.
 */
function loadGTOData(): Promise<void> {
  if (cachedPreflop && cachedPostflop) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadError = null;
  notifyListeners();

  loadPromise = Promise.all([
    fetch('/data/preflop-charts.json').then((res) => {
      if (!res.ok) throw new Error(`Failed to load preflop charts: ${res.status}`);
      return res.json() as Promise<Record<string, unknown>>;
    }),
    fetch('/data/postflop-guides.json').then((res) => {
      if (!res.ok) throw new Error(`Failed to load postflop guides: ${res.status}`);
      return res.json() as Promise<Record<string, unknown>>;
    }),
  ])
    .then(([preflopRaw, postflopRaw]) => {
      // The preflop data is expected to be a map of charts keyed by
      // "{position}_{scenario}" (e.g., "UTG_open").
      cachedPreflop = {
        charts: (preflopRaw as Record<string, PreflopChart>) ?? {},
      };

      // The postflop data is expected to be an array of guide entries.
      const guides = Array.isArray(postflopRaw)
        ? (postflopRaw as PostflopGuide[])
        : (postflopRaw as { guides?: PostflopGuide[] }).guides ?? [];
      cachedPostflop = { guides };

      loadPromise = null;
      notifyListeners();
    })
    .catch((err) => {
      loadError = err instanceof Error ? err.message : 'Failed to load GTO data';
      loadPromise = null;
      notifyListeners();
      throw err;
    });

  return loadPromise;
}

/**
 * Force a reload by clearing the cache and re-fetching.
 */
function forceReload(): void {
  cachedPreflop = null;
  cachedPostflop = null;
  loadPromise = null;
  loadError = null;
  loadGTOData().catch(() => {});
}

// ─── Hook ────────────────────────────────────────────────────────

export function useGTOLoader(): GTOLoaderState {
  const [, setTick] = useState(0);

  // Subscribe to cache updates
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    loadListeners.add(listener);
    return () => {
      loadListeners.delete(listener);
    };
  }, []);

  // Trigger load on mount
  useEffect(() => {
    loadGTOData().catch(() => {});
  }, []);

  const isLoading = loadPromise !== null;
  const isLoaded = cachedPreflop !== null && cachedPostflop !== null;

  // ── Lookup helpers ─────────────────────────────────────────────

  const getPreflopChart = useCallback(
    (position: Position, scenario: PreflopScenario): PreflopChart | null => {
      if (!cachedPreflop) return null;
      const key = `${position}_${scenario}`;
      return cachedPreflop.charts[key] ?? null;
    },
    [],
  );

  const getPostflopGuide = useCallback(
    (
      boardTexture: BoardTexture,
      handStrength: HandStrengthTier,
      street: 'flop' | 'turn' | 'river',
      isInPosition: boolean,
    ): PostflopGuide | null => {
      if (!cachedPostflop) return null;

      return (
        cachedPostflop.guides.find(
          (g) =>
            g.boardTexture === boardTexture &&
            g.handStrength === handStrength &&
            g.street === street &&
            g.isInPosition === isInPosition,
        ) ?? null
      );
    },
    [],
  );

  const reload = useCallback(() => {
    forceReload();
  }, []);

  return {
    isLoading,
    isLoaded,
    error: loadError,
    preflopCharts: cachedPreflop,
    postflopGuides: cachedPostflop,
    getPreflopChart,
    getPostflopGuide,
    reload,
  };
}
