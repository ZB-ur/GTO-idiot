// ============================================================
// Bot AI barrel export
// ============================================================

export {
  type BotProfile,
  BOT_PROFILES,
  getBotProfile,
  generateBotName,
} from './bot-profiles';

export {
  type HandStrengthResult,
  type HandStrengthCategory,
  calculateHandStrength,
  calculatePotOdds,
  calculateSPR,
} from './hand-strength';

export {
  type DecisionContext,
  type BotDecision,
  computeBotAction,
} from './decision-engine';
