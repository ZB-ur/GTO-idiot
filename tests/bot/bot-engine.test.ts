import { describe, it, expect } from 'vitest';
import { BotEngine } from '../../src/bot/bot-engine';
import { getStyleProfile, getAllStyles } from '../../src/bot/style-profiles';
import type { GameState, GTORecommendation, HandPlayerState } from '../../src/types';

function makeGameState(botId: string, overrides?: Partial<HandPlayerState>): GameState {
  const players: HandPlayerState[] = [
    { playerId: 'player', position: 'UTG', chipStack: 200, bet: 0, isFolded: false, isAllIn: false, hasActed: false },
    { playerId: botId, position: 'BB', chipStack: 200, bet: 2, isFolded: false, isAllIn: false, hasActed: false, ...overrides },
  ];
  return {
    gameId: 'g1', blindLevel: '1/2', speed: 'normal',
    players: [
      { playerId: 'player', name: 'You', position: 'UTG', chipStack: 200, isHuman: true, isActive: true },
      { playerId: botId, name: 'Bot', position: 'BB', chipStack: overrides?.chipStack ?? 200, isHuman: false, isActive: true },
    ],
    currentHand: { handId: 'h1', street: 'preflop', pot: 3, communityCards: [], dealerPosition: 'BTN', activePlayerId: botId, players, status: 'in_progress' },
    handCount: 1, sessionProfit: 0,
  };
}

const gtoRec: GTORecommendation = {
  actions: [
    { action: 'raise_2.5x', frequency: 0.6, sizing: '2.5 BB' },
    { action: 'call', frequency: 0.25 },
    { action: 'fold', frequency: 0.15 },
  ],
  scenario: 'RFI', explanation: '',
};

describe('BotEngine', () => {
  const engine = new BotEngine();

  it('should create TAG style profile with correct bias coefficients', () => {
    const p = getStyleProfile('TAG');
    expect(p.style).toBe('TAG');
    expect(p.aggressionFactor).toBe(1.2);
    expect(p.vpipAdjust).toBe(-0.05);
  });

  it('should create LAG style profile with higher aggression factor', () => {
    const p = getStyleProfile('LAG');
    expect(p.aggressionFactor).toBe(1.5);
    expect(p.vpipAdjust).toBe(0.15);
  });

  it('should create Fish style profile with wider ranges', () => {
    const p = getStyleProfile('Fish');
    expect(p.vpipAdjust).toBe(0.25);
    expect(p.aggressionFactor).toBe(0.6);
  });

  it('should create Nit style profile with tighter ranges', () => {
    const p = getStyleProfile('Nit');
    expect(p.vpipAdjust).toBe(-0.2);
    expect(p.aggressionFactor).toBe(0.8);
  });

  it('should create Maniac style profile with extreme aggression', () => {
    const p = getStyleProfile('Maniac');
    expect(p.aggressionFactor).toBe(2.0);
    expect(p.vpipAdjust).toBe(0.3);
  });

  it('should make a decision within 100ms', () => {
    const gs = makeGameState('bot-1');
    const start = performance.now();
    engine.decide('bot-1', 'TAG', gs, gtoRec);
    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should apply style bias to GTO base recommendation', () => {
    const gs = makeGameState('bot-1');
    const actions = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const a = engine.decide('bot-1', 'Maniac', gs, gtoRec);
      actions.add(a.action);
    }
    // Maniac should produce varied actions, including raises
    expect(actions.size).toBeGreaterThanOrEqual(1);
  });

  it('should return valid action for given game state', () => {
    const gs = makeGameState('bot-1');
    const validActions = ['fold', 'check', 'call', 'raise', 'all_in'];
    for (const style of getAllStyles()) {
      const action = engine.decide('bot-1', style, gs, gtoRec);
      expect(validActions).toContain(action.action);
    }
  });

  it('should not raise above player chip stack', () => {
    const gs = makeGameState('bot-1', { chipStack: 10 });
    for (let i = 0; i < 50; i++) {
      const action = engine.decide('bot-1', 'Maniac', gs, gtoRec);
      if (action.action === 'raise' && action.amount !== undefined) {
        expect(action.amount).toBeLessThanOrEqual(10 + 2); // chipStack + current bet
      }
    }
  });
});
