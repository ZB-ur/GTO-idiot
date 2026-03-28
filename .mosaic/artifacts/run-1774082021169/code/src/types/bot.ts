/** BOT playing style classification */
export type BotStyle = 'TAG' | 'LAG' | 'NIT' | 'Fish' | 'Maniac';

/** BOT style parameters */
export interface BotParameters {
  readonly vpip: number;
  readonly pfr: number;
  readonly aggression: number;
  readonly bluffFrequency: number;
}

/** BOT opponent profile */
export interface BotProfile {
  readonly id: string;
  readonly name: string;
  readonly style: BotStyle;
  readonly description: string;
  readonly avatar?: string;
  readonly parameters?: BotParameters;
}

/** Style descriptions for UI display */
export const BOT_STYLE_LABELS: Record<BotStyle, string> = {
  TAG: 'Tight-Aggressive',
  LAG: 'Loose-Aggressive',
  NIT: 'Ultra-tight Passive',
  Fish: 'Loose-weak Passive',
  Maniac: 'Ultra-loose Ultra-aggressive',
} as const;
