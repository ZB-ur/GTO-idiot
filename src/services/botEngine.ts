import type { HandState, BotProfile, BotDecision } from '../types';

export function decideBotAction(handState: HandState, botProfile: BotProfile): BotDecision {
  void handState;
  void botProfile;
  return {
    actionType: 'fold',
    amount: 0,
    thinkTimeMs: 1000,
  };
}
