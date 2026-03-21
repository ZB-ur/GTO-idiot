// ============================================================
// Decision Engine — Position-aware BOT action selection
// ============================================================

import type {
  ActionType,
  BotStyle,
  Card,
  HandPlayer,
  LegalAction,
  PlayerAction,
  Position,
  Street,
} from '../types';
import type { BotProfile } from './bot-profiles';
import { getBotProfile } from './bot-profiles';
import {
  calculateHandStrength,
  calculatePotOdds,
  calculateSPR,
  type HandStrengthResult,
} from './hand-strength';

/**
 * Context provided to the decision engine for a single bot action.
 */
export interface DecisionContext {
  /** The bot player making the decision */
  player: HandPlayer;
  /** Bot play style */
  botStyle: BotStyle;
  /** Bot's hole cards */
  holeCards: Card[];
  /** Current community cards */
  communityCards: Card[];
  /** Bot's table position */
  position: Position;
  /** Current street */
  street: Street;
  /** Total pot size in BB */
  potBB: number;
  /** Amount to call in BB (0 if checking is free) */
  toCallBB: number;
  /** Available legal actions */
  legalActions: LegalAction[];
  /** Number of active players still in the hand */
  activePlayers: number;
  /** Whether there has been a raise before the bot this street */
  facingRaise: boolean;
  /** Whether the bot was the preflop aggressor */
  isPreflopAggressor: boolean;
  /** Big blind amount */
  bigBlind: number;
}

/**
 * Result of a bot decision.
 */
export interface BotDecision {
  action: PlayerAction;
  reasoning: string;
}

/**
 * Main entry point: compute a bot's action for the given game context.
 */
export function computeBotAction(ctx: DecisionContext): BotDecision {
  const profile = getBotProfile(ctx.botStyle);
  const handStrength = calculateHandStrength(
    ctx.holeCards,
    ctx.communityCards,
    ctx.position,
    ctx.street,
    200 // reduced sims for bot speed
  );

  if (ctx.street === 'preflop') {
    return decidePreflopAction(ctx, profile, handStrength);
  }
  return decidePostflopAction(ctx, profile, handStrength);
}

// ============================================================
// Preflop decision logic
// ============================================================

function decidePreflopAction(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult
): BotDecision {
  const varianceAdj = (Math.random() - 0.5) * profile.variance * 2;
  const adjustedStrength = hs.effective + varianceAdj;

  // Threshold to enter the pot: if hand is in VPIP range
  const shouldPlay = adjustedStrength >= (1 - profile.vpip);

  if (!shouldPlay) {
    return makeFoldOrCheck(ctx, 'Hand below VPIP threshold');
  }

  // Already facing a raise — consider 3-bet or call
  if (ctx.facingRaise) {
    const threeBetThreshold = 1 - profile.threeBetFreq;
    if (adjustedStrength >= threeBetThreshold && canRaise(ctx)) {
      return makeRaise(ctx, profile, hs, 'Strong hand facing raise, 3-betting');
    }
    if (canCall(ctx)) {
      return makeCall(ctx, 'Calling raise with playable hand');
    }
    return makeFoldOrCheck(ctx, 'Cannot profitably continue vs raise');
  }

  // No raise yet — consider opening
  const raiseThreshold = 1 - profile.pfr;
  if (adjustedStrength >= raiseThreshold && canRaise(ctx)) {
    return makeRaise(ctx, profile, hs, 'Opening raise with strong hand');
  }

  // Limp (call BB) — only passive profiles do this much
  if (canCall(ctx) && profile.aggressionFactor < 2.0) {
    return makeCall(ctx, 'Limping with marginal hand');
  }

  if (canRaise(ctx)) {
    return makeRaise(ctx, profile, hs, 'Raising instead of limping');
  }

  return makeFoldOrCheck(ctx, 'Marginal hand, checking if possible');
}

// ============================================================
// Postflop decision logic
// ============================================================

function decidePostflopAction(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult
): BotDecision {
  const potOdds = calculatePotOdds(ctx.potBB, ctx.toCallBB);
  const spr = calculateSPR(ctx.player.stackBB, ctx.potBB);
  const varianceAdj = (Math.random() - 0.5) * profile.variance * 2;
  const adjustedStrength = hs.effective + varianceAdj;

  // --- Facing a bet ---
  if (ctx.toCallBB > 0) {
    return decideFacingBet(ctx, profile, hs, adjustedStrength, potOdds, spr);
  }

  // --- Checking or betting (no bet to face) ---
  return decideCheckOrBet(ctx, profile, hs, adjustedStrength, spr);
}

function decideFacingBet(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult,
  _adjustedStrength: number,
  potOdds: number,
  _spr: number
): BotDecision {
  // Monster hand — raise for value
  if (hs.category === 'monster') {
    if (canRaise(ctx) && Math.random() < 0.7) {
      return makeRaise(ctx, profile, hs, 'Monster hand, raising for value');
    }
    return makeCall(ctx, 'Monster hand, slowplaying');
  }

  // Strong hand — call or raise
  if (hs.category === 'strong') {
    if (canRaise(ctx) && Math.random() < 0.3 * profile.aggressionFactor / 3) {
      return makeRaise(ctx, profile, hs, 'Strong hand, raising');
    }
    return makeCall(ctx, 'Strong hand, calling');
  }

  // Check-raise bluff opportunity
  if (Math.random() < profile.checkRaiseFreq && canRaise(ctx) && hs.hasDraw) {
    return makeRaise(ctx, profile, hs, 'Check-raise semi-bluff with draw');
  }

  // Drawing hand: call if pot odds justify
  if (hs.hasDraw && hs.drawOuts > 0) {
    const impliedOdds = hs.drawOuts / 47; // Rough equity from outs
    if (impliedOdds >= potOdds * 0.8) {
      if (canCall(ctx)) {
        return makeCall(ctx, `Drawing hand with ${hs.drawOuts} outs, odds justify call`);
      }
    }
  }

  // Medium hand — call with decent odds
  if (hs.category === 'medium') {
    const foldThreshold = profile.foldToBetBase * (ctx.toCallBB / Math.max(1, ctx.potBB));
    if (Math.random() > foldThreshold && canCall(ctx)) {
      return makeCall(ctx, 'Medium hand, pot odds acceptable');
    }
  }

  // Bluff raise
  if (hs.category === 'air' && Math.random() < profile.bluffFreq * 0.3 && canRaise(ctx)) {
    return makeRaise(ctx, profile, hs, 'Bluff raise with air');
  }

  return makeFoldOrCheck(ctx, 'Hand too weak to continue');
}

function decideCheckOrBet(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult,
  _adjustedStrength: number,
  _spr: number
): BotDecision {
  // Determine c-bet / barrel frequency based on street
  let betFreq: number;
  if (ctx.isPreflopAggressor) {
    switch (ctx.street) {
      case 'flop':
        betFreq = profile.cbetFreq;
        break;
      case 'turn':
        betFreq = profile.doubleBarrelFreq;
        break;
      case 'river':
        betFreq = profile.tripleBarrelFreq;
        break;
      default:
        betFreq = profile.cbetFreq;
    }
  } else {
    // Not the aggressor — lower betting frequency
    betFreq = Math.min(profile.cbetFreq * 0.5, 0.35);
  }

  // Monster/strong hands — bet for value
  if (hs.category === 'monster' || hs.category === 'strong') {
    if (canBet(ctx)) {
      // Sometimes check monster for deception
      if (hs.category === 'monster' && Math.random() < 0.15) {
        return makeCheck(ctx, 'Trapping with monster hand');
      }
      return makeBet(ctx, profile, hs, 'Value bet with strong+ hand');
    }
    return makeCheck(ctx, 'No bet action available');
  }

  // Medium hands — bet at c-bet frequency
  if (hs.category === 'medium' && Math.random() < betFreq) {
    if (canBet(ctx)) {
      return makeBet(ctx, profile, hs, 'Semi-value bet with medium hand');
    }
  }

  // Bluff — bet with air at bluff frequency
  if ((hs.category === 'air' || hs.category === 'weak') && Math.random() < profile.bluffFreq * betFreq) {
    if (canBet(ctx) && ctx.activePlayers <= 3) {
      return makeBet(ctx, profile, hs, 'Bluff bet');
    }
  }

  // Draw — semi-bluff
  if (hs.hasDraw && Math.random() < betFreq * 0.8) {
    if (canBet(ctx)) {
      return makeBet(ctx, profile, hs, 'Semi-bluff with draw');
    }
  }

  return makeCheck(ctx, 'Checking back');
}

// ============================================================
// Action construction helpers
// ============================================================

function makeFoldOrCheck(ctx: DecisionContext, reasoning: string): BotDecision {
  if (hasAction(ctx, 'check')) {
    return { action: { type: 'check' }, reasoning };
  }
  if (hasAction(ctx, 'fold')) {
    return { action: { type: 'fold' }, reasoning };
  }
  // Edge case: only all-in available
  const allIn = findAction(ctx, 'all_in');
  if (allIn) {
    return { action: { type: 'all_in' }, reasoning: 'Forced all-in (no other action)' };
  }
  // Shouldn't happen, but default to fold
  return { action: { type: 'fold' }, reasoning };
}

function makeCheck(ctx: DecisionContext, reasoning: string): BotDecision {
  if (hasAction(ctx, 'check')) {
    return { action: { type: 'check' }, reasoning };
  }
  return makeFoldOrCheck(ctx, reasoning);
}

function makeCall(ctx: DecisionContext, reasoning: string): BotDecision {
  const callAction = findAction(ctx, 'call');
  if (callAction) {
    return { action: { type: 'call' }, reasoning };
  }
  // If can't call, maybe all-in call
  const allIn = findAction(ctx, 'all_in');
  if (allIn) {
    return { action: { type: 'all_in' }, reasoning: reasoning + ' (all-in)' };
  }
  return makeFoldOrCheck(ctx, 'Cannot call, folding');
}

function makeRaise(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult,
  reasoning: string
): BotDecision {
  const raiseAction = findAction(ctx, 'raise');
  if (raiseAction && raiseAction.minAmount != null && raiseAction.maxAmount != null) {
    const size = computeRaiseSize(
      raiseAction.minAmount,
      raiseAction.maxAmount,
      ctx.potBB,
      profile,
      hs
    );
    return {
      action: { type: 'raise', amount: size },
      reasoning,
    };
  }

  // Fall back to bet if no raise available
  const betAction = findAction(ctx, 'bet');
  if (betAction && betAction.minAmount != null && betAction.maxAmount != null) {
    const size = computeBetSize(
      betAction.minAmount,
      betAction.maxAmount,
      ctx.potBB,
      profile,
      hs
    );
    return {
      action: { type: 'bet', amount: size },
      reasoning,
    };
  }

  // All-in as last resort
  const allIn = findAction(ctx, 'all_in');
  if (allIn) {
    return { action: { type: 'all_in' }, reasoning: reasoning + ' (all-in)' };
  }

  return makeCall(ctx, 'Cannot raise, calling instead');
}

function makeBet(
  ctx: DecisionContext,
  profile: BotProfile,
  hs: HandStrengthResult,
  reasoning: string
): BotDecision {
  const betAction = findAction(ctx, 'bet');
  if (betAction && betAction.minAmount != null && betAction.maxAmount != null) {
    const size = computeBetSize(
      betAction.minAmount,
      betAction.maxAmount,
      ctx.potBB,
      profile,
      hs
    );
    return {
      action: { type: 'bet', amount: size },
      reasoning,
    };
  }

  const allIn = findAction(ctx, 'all_in');
  if (allIn) {
    return { action: { type: 'all_in' }, reasoning: reasoning + ' (all-in)' };
  }

  return makeCheck(ctx, 'No bet action, checking');
}

// ============================================================
// Sizing logic
// ============================================================

function computeBetSize(
  min: number,
  max: number,
  potBB: number,
  profile: BotProfile,
  hs: HandStrengthResult
): number {
  // Target: fraction of pot based on profile
  let target = potBB * profile.defaultBetSizePot;

  // Adjust for hand strength: stronger hands bet bigger
  if (hs.category === 'monster') {
    target *= 1.2;
  } else if (hs.category === 'air') {
    target *= 0.75; // Smaller bluff sizing
  }

  // Add variance
  const variance = (Math.random() - 0.5) * target * 0.2;
  target += variance;

  // Clamp to legal range and round to 0.5 BB
  const clamped = Math.max(min, Math.min(max, target));
  return Math.round(clamped * 2) / 2;
}

function computeRaiseSize(
  minRaise: number,
  maxRaise: number,
  potBB: number,
  profile: BotProfile,
  hs: HandStrengthResult
): number {
  // Target raise: multiplier of current bet
  let target = minRaise * profile.raiseSizeMultiplier;

  // Adjust for hand strength
  if (hs.category === 'monster') {
    target = Math.max(target, potBB * 0.8);
  } else if (hs.category === 'air') {
    target = minRaise; // Min-raise bluffs
  }

  const variance = (Math.random() - 0.5) * target * 0.15;
  target += variance;

  const clamped = Math.max(minRaise, Math.min(maxRaise, target));
  return Math.round(clamped * 2) / 2;
}

// ============================================================
// Legal action helpers
// ============================================================

function hasAction(ctx: DecisionContext, type: ActionType): boolean {
  return ctx.legalActions.some((a) => a.type === type);
}

function findAction(ctx: DecisionContext, type: ActionType): LegalAction | undefined {
  return ctx.legalActions.find((a) => a.type === type);
}

function canRaise(ctx: DecisionContext): boolean {
  return hasAction(ctx, 'raise') || hasAction(ctx, 'all_in');
}

function canCall(ctx: DecisionContext): boolean {
  return hasAction(ctx, 'call') || hasAction(ctx, 'all_in');
}

function canBet(ctx: DecisionContext): boolean {
  return hasAction(ctx, 'bet') || hasAction(ctx, 'all_in');
}
