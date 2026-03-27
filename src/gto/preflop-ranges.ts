import type { PreflopStrategy } from '../types';
import type { PreflopRangeQuery } from './types';

export function getPreflopRange(_query: PreflopRangeQuery): PreflopStrategy | null {
  return null;
}

export function lookupPreflopAction(
  _query: PreflopRangeQuery,
  _hand: string,
): { action: 'raise' | 'call' | 'fold'; frequency: number } | null {
  return null;
}
