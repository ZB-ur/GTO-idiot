import type { Position, BotStyle } from './types';

export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

export const BOT_STYLES: BotStyle[] = ['TAG', 'LAG', 'TightPassive', 'Fish', 'Balanced'];

export const DEFAULT_BLINDS = { small: 1, big: 2 };
export const DEFAULT_BUY_IN = 400;
export const SEAT_COUNT = 6;

export const BOT_THINKING_DELAY_MS: Record<BotStyle, { min: number; max: number }> = {
  TAG: { min: 1000, max: 1800 },
  LAG: { min: 800, max: 1500 },
  TightPassive: { min: 1200, max: 2000 },
  Fish: { min: 600, max: 1200 },
  Balanced: { min: 1000, max: 1600 },
};

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
export const SUITS = ['s', 'h', 'd', 'c'] as const;

export const HAND_RANK_NAMES = [
  'High Card',
  'One Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
] as const;

export const DB_NAME = 'gto-idiot-db';
export const DB_VERSION = 1;
