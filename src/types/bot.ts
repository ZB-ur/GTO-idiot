import type { BotStyle, ActionType } from './card';

export interface BotProfile {
  style: BotStyle;
  name: string;
  icon: string;
  vpip: number;
  pfr: number;
  aggressionFrequency: number;
  cbetFrequency: number;
  foldToCbetFrequency: number;
  threeBetFrequency: number;
  description: string;
  descriptionZh: string;
}

export interface BotDecision {
  actionType: ActionType;
  amount: number;
  thinkTimeMs: number;
}
