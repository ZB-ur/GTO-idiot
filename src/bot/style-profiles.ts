import type { BotStyle, BotStyleProfile } from '../types';

const profiles: Record<BotStyle, BotStyleProfile> = {
  TAG: { style: 'TAG', aggressionFactor: 1.2, vpipAdjust: -0.05, pfrAdjust: 0.05, threeBetAdjust: 0.1, foldTo3BetAdjust: 0.0, cbetAdjust: 0.1, checkRaiseAdjust: 0.05 },
  LAG: { style: 'LAG', aggressionFactor: 1.5, vpipAdjust: 0.15, pfrAdjust: 0.15, threeBetAdjust: 0.2, foldTo3BetAdjust: -0.1, cbetAdjust: 0.15, checkRaiseAdjust: 0.1 },
  Fish: { style: 'Fish', aggressionFactor: 0.6, vpipAdjust: 0.25, pfrAdjust: -0.1, threeBetAdjust: -0.15, foldTo3BetAdjust: 0.1, cbetAdjust: -0.1, checkRaiseAdjust: -0.05 },
  Nit: { style: 'Nit', aggressionFactor: 0.8, vpipAdjust: -0.2, pfrAdjust: -0.1, threeBetAdjust: -0.1, foldTo3BetAdjust: 0.15, cbetAdjust: 0.0, checkRaiseAdjust: 0.0 },
  Maniac: { style: 'Maniac', aggressionFactor: 2.0, vpipAdjust: 0.3, pfrAdjust: 0.25, threeBetAdjust: 0.3, foldTo3BetAdjust: -0.2, cbetAdjust: 0.2, checkRaiseAdjust: 0.15 },
};

export function getStyleProfile(style: BotStyle): BotStyleProfile {
  return profiles[style];
}

export function getAllStyles(): BotStyle[] {
  return ['TAG', 'LAG', 'Fish', 'Nit', 'Maniac'];
}
