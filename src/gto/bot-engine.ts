import type { EngineGameState } from '../engine/types';
import type { BotProfile, BotDecision } from './types';

export function createBotProfile(style: BotProfile['style']): BotProfile {
  return {
    style,
    aggressionOffset: 0,
    tightnessOffset: 0,
    bluffFrequency: 0,
  };
}

export function computeBotDecision(
  _gameState: EngineGameState,
  _playerId: string,
  _profile: BotProfile,
): BotDecision {
  return {
    actionType: 'check',
    thinkingDelayMs: 1000,
  };
}
