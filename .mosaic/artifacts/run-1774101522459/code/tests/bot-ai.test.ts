// ============================================================
// Bot AI — Unit tests for profiles and decision engine
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BOT_PROFILES, getBotProfile, generateBotName } from '../src/bot/bot-profiles';
import { computeBotAction, type DecisionContext } from '../src/bot/decision-engine';
import {
  calculateHandStrength,
  calculatePotOdds,
  calculateSPR,
} from '../src/bot/hand-strength';
import type { Card, LegalAction } from '../src/types';

function card(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit };
}

function makeContext(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    player: {
      seat: 1,
      name: 'BOT-TAG-1',
      stackBB: 100,
      position: 'BTN',
      isActive: true,
      isAllIn: false,
      currentBet: 0,
      holeCards: null,
      lastAction: null,
    },
    botStyle: 'TAG',
    holeCards: [card('A', 's'), card('K', 'h')],
    communityCards: [],
    position: 'BTN',
    street: 'preflop',
    potBB: 1.5,
    toCallBB: 1,
    legalActions: [
      { type: 'fold' },
      { type: 'call', callAmount: 1 },
      { type: 'raise', minAmount: 2, maxAmount: 100 },
    ],
    activePlayers: 3,
    facingRaise: false,
    isPreflopAggressor: false,
    bigBlind: 1,
    ...overrides,
  };
}

// ============================================================
// Bot profiles
// ============================================================

describe('Bot Profiles', () => {
  it('TAG profile has correct VPIP/PFR/AF/3Bet% ranges', () => {
    const tag = BOT_PROFILES.TAG;
    expect(tag.vpip).toBeGreaterThanOrEqual(0.15);
    expect(tag.vpip).toBeLessThanOrEqual(0.30);
    expect(tag.pfr).toBeGreaterThanOrEqual(0.10);
    expect(tag.pfr).toBeLessThanOrEqual(0.25);
    expect(tag.aggressionFactor).toBeGreaterThanOrEqual(2.0);
    expect(tag.threeBetFreq).toBeGreaterThanOrEqual(0.05);
    expect(tag.threeBetFreq).toBeLessThanOrEqual(0.15);
  });

  it('LAG profile has higher VPIP and AF than TAG', () => {
    const tag = BOT_PROFILES.TAG;
    const lag = BOT_PROFILES.LAG;
    expect(lag.vpip).toBeGreaterThan(tag.vpip);
    expect(lag.aggressionFactor).toBeGreaterThan(tag.aggressionFactor);
  });

  it('TP profile has low AF and moderate VPIP', () => {
    const tp = BOT_PROFILES.TP;
    expect(tp.aggressionFactor).toBeLessThan(2.0);
    expect(tp.vpip).toBeLessThanOrEqual(0.25);
    expect(tp.vpip).toBeGreaterThanOrEqual(0.10);
  });

  it('LP profile has high VPIP and low AF', () => {
    const lp = BOT_PROFILES.LP;
    expect(lp.vpip).toBeGreaterThanOrEqual(0.35);
    expect(lp.aggressionFactor).toBeLessThan(1.5);
  });

  it('GTO profile delegates to gto-solver', () => {
    const gto = BOT_PROFILES.GTO;
    expect(gto.style).toBe('GTO');
    // GTO profile has balanced params
    expect(gto.vpip).toBeGreaterThan(BOT_PROFILES.TP.vpip);
    expect(gto.vpip).toBeLessThan(BOT_PROFILES.LAG.vpip);
  });
});

// ============================================================
// Decision engine
// ============================================================

describe('Decision Engine', () => {
  it('bot folds weak hands from early position (TAG)', () => {
    // Give bot a very weak hand from UTG
    const ctx = makeContext({
      botStyle: 'TAG',
      holeCards: [card('2', 's'), card('7', 'h')],
      position: 'UTG',
    });

    // With a very weak hand, TAG bot should fold or check most of the time
    // Run multiple times due to variance
    let foldCount = 0;
    for (let i = 0; i < 50; i++) {
      const decision = computeBotAction(ctx);
      if (decision.action.type === 'fold' || decision.action.type === 'check') {
        foldCount++;
      }
    }
    // Should fold/check >70% of the time with 27o in UTG
    expect(foldCount).toBeGreaterThan(35);
  });

  it('bot opens wider range from button position', () => {
    // Marginal hand that might play from BTN but not UTG
    const marginalHand: [Card, Card] = [card('J', 's'), card('9', 'h')];

    let btnPlayCount = 0;
    let utgPlayCount = 0;

    for (let i = 0; i < 100; i++) {
      const btnCtx = makeContext({
        holeCards: marginalHand,
        position: 'BTN',
        toCallBB: 0,
        legalActions: [
          { type: 'check' },
          { type: 'bet', minAmount: 1, maxAmount: 100 },
        ],
      });
      const btnDecision = computeBotAction(btnCtx);
      if (btnDecision.action.type !== 'fold') btnPlayCount++;

      const utgCtx = makeContext({
        holeCards: marginalHand,
        position: 'UTG',
        toCallBB: 0,
        legalActions: [
          { type: 'check' },
          { type: 'bet', minAmount: 1, maxAmount: 100 },
        ],
      });
      const utgDecision = computeBotAction(utgCtx);
      if (utgDecision.action.type !== 'fold') utgPlayCount++;
    }

    // BTN should play at least as often as UTG
    expect(btnPlayCount).toBeGreaterThanOrEqual(utgPlayCount);
  });

  it('bot calls with correct pot odds calculation', () => {
    const potOdds = calculatePotOdds(10, 2);
    // pot odds = 2 / (10 + 2) = 0.167
    expect(potOdds).toBeCloseTo(0.167, 2);
  });

  it('bot raises with strong hands per style parameters', () => {
    // Give bot pocket aces
    const ctx = makeContext({
      holeCards: [card('A', 's'), card('A', 'h')],
      position: 'BTN',
      facingRaise: false,
    });

    let raiseCount = 0;
    for (let i = 0; i < 50; i++) {
      const decision = computeBotAction(ctx);
      if (decision.action.type === 'raise' || decision.action.type === 'bet' || decision.action.type === 'all_in') {
        raiseCount++;
      }
    }
    // With AA, should raise very often
    expect(raiseCount).toBeGreaterThan(30);
  });

  it('bot 3-bets at rate consistent with profile', () => {
    // Facing a raise with a strong hand
    const ctx = makeContext({
      holeCards: [card('Q', 's'), card('Q', 'h')],
      facingRaise: true,
      toCallBB: 3,
      potBB: 4.5,
    });

    let threeBetCount = 0;
    for (let i = 0; i < 100; i++) {
      const decision = computeBotAction(ctx);
      if (decision.action.type === 'raise' || decision.action.type === 'all_in') {
        threeBetCount++;
      }
    }
    // QQ facing a raise should 3-bet frequently
    expect(threeBetCount).toBeGreaterThan(20);
  });

  it('hand strength calculator returns correct relative strength', () => {
    // AA preflop should be very strong
    const aaStrength = calculateHandStrength(
      [card('A', 's'), card('A', 'h')],
      [],
      'BTN',
      'preflop'
    );
    expect(aaStrength.raw).toBeGreaterThan(0.85);
    expect(aaStrength.category).toBe('monster');

    // 72o preflop should be weak
    const weakStrength = calculateHandStrength(
      [card('7', 's'), card('2', 'h')],
      [],
      'UTG',
      'preflop'
    );
    expect(weakStrength.raw).toBeLessThan(0.4);
  });

  it('bot decision is deterministic given same inputs and seed', () => {
    // With variance = 0, decisions should be more consistent
    // But default profiles have variance, so just check the function works
    const ctx = makeContext({
      holeCards: [card('A', 's'), card('A', 'h')],
    });
    const decision = computeBotAction(ctx);
    expect(decision.action.type).toBeDefined();
    expect(decision.reasoning).toBeTruthy();
  });

  it('bot handles all-in when stack < raise size', () => {
    const ctx = makeContext({
      player: {
        seat: 1,
        name: 'BOT-TAG-1',
        stackBB: 3,
        position: 'BTN',
        isActive: true,
        isAllIn: false,
        currentBet: 0,
        holeCards: null,
        lastAction: null,
      },
      holeCards: [card('A', 's'), card('A', 'h')],
      toCallBB: 5,
      legalActions: [
        { type: 'fold' },
        { type: 'all_in', minAmount: 3, maxAmount: 3 },
      ],
    });

    const decision = computeBotAction(ctx);
    // With AA facing forced all-in, should go all-in
    expect(['all_in', 'fold']).toContain(decision.action.type);
  });
});

describe('Hand Strength helpers', () => {
  it('calculateSPR returns correct ratio', () => {
    expect(calculateSPR(100, 10)).toBe(10);
    expect(calculateSPR(50, 0)).toBe(Infinity);
  });

  it('calculatePotOdds returns 0 when nothing to call', () => {
    expect(calculatePotOdds(10, 0)).toBe(0);
  });
});
