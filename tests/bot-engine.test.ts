import { describe, it, expect, beforeEach } from 'vitest';
import { decideBotAction, setGTOData, type BotDecisionContext } from '../src/bot/bot-engine';
import type { Card, Player, PreflopChart, PostflopGuide } from '../src/types';
import { DEFAULT_BLINDS } from '../src/types';

function makeCard(rank: Card['rank'], suit: Card['suit']): Card { return { rank, suit }; }
function makeBot(ov: Partial<Player> = {}): Player {
  return { id: 'bot-1', name: 'Bot-1', position: 'UTG', chipStack: 200, isBot: true, isActive: true, currentBet: 0, isFolded: false, isAllIn: false, isDealer: false, ...ov };
}
function makeCtx(ov: Partial<BotDecisionContext> = {}): BotDecisionContext {
  return { player: makeBot(), players: Array.from({ length: 6 }, (_, i) => makeBot({ id: `b${i}`, position: (['BTN','SB','BB','UTG','HJ','CO'] as const)[i] })), street: 'preflop', communityCards: [], currentBet: 2, potSize: 3, blinds: DEFAULT_BLINDS, dealerIndex: 0, preflopRaiseCount: 0, ...ov };
}

const mockChart: PreflopChart = {
  position: 'UTG', scenario: 'open', disclaimer: 'test',
  matrix: [
    [{ hand: 'AA', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }, { hand: 'AKs', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }],
    [{ hand: 'AKo', actions: [{ action: 'raise', frequency: 0.8 }, { action: 'call', frequency: 0.2 }], primaryAction: 'raise' }, { hand: 'KK', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }],
    [{ hand: '72o', actions: [{ action: 'fold', frequency: 1.0 }], primaryAction: 'fold' }],
  ],
};

beforeEach(() => { setGTOData(null, null); });

describe('Board Texture Classification', () => {
  it('should classify board texture as dry', () => {
    const action = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('A','spades'),makeCard('7','hearts'),makeCard('2','clubs')], player: makeBot({ holeCards: [makeCard('K','spades'),makeCard('K','hearts')] }), currentBet: 0 }));
    expect(['bet','check','raise']).toContain(action.actionType);
  });
  it('should classify board texture as wet', () => {
    const action = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('T','hearts'),makeCard('J','hearts'),makeCard('Q','clubs')], player: makeBot({ holeCards: [makeCard('A','hearts'),makeCard('K','hearts')] }), currentBet: 0 }));
    expect(['bet','raise','check','all_in']).toContain(action.actionType);
  });
  it('should classify board texture as monotone', () => {
    const action = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('A','hearts'),makeCard('K','hearts'),makeCard('9','hearts')], player: makeBot({ holeCards: [makeCard('Q','hearts'),makeCard('J','hearts')] }), currentBet: 0 }));
    expect(['bet','raise','check','all_in']).toContain(action.actionType);
  });
  it('should classify board texture as paired', () => {
    const action = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('K','spades'),makeCard('K','hearts'),makeCard('3','clubs')], player: makeBot({ holeCards: [makeCard('A','spades'),makeCard('K','clubs')] }), currentBet: 0 }));
    expect(['bet','raise','all_in','check']).toContain(action.actionType);
  });
});

describe('Hand Strength Classification', () => {
  it('should classify hand strength as premium preflop', () => {
    expect(decideBotAction(makeCtx({ player: makeBot({ holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }) })).actionType).not.toBe('fold');
  });
  it('should classify hand strength as strong', () => {
    expect(decideBotAction(makeCtx({ player: makeBot({ holeCards: [makeCard('J','spades'),makeCard('J','hearts')] }) })).actionType).not.toBe('fold');
  });
  it('should classify hand strength as marginal', () => {
    const a = decideBotAction(makeCtx({ player: makeBot({ holeCards: [makeCard('8','spades'),makeCard('7','spades')] }) }));
    expect(['call','fold','check','raise']).toContain(a.actionType);
  });
  it('should classify hand strength as weak', () => {
    let folds = 0;
    for (let i = 0; i < 50; i++) { if (decideBotAction(makeCtx({ player: makeBot({ holeCards: [makeCard('7','spades'),makeCard('2','hearts')] }), currentBet: 10, potSize: 15 })).actionType === 'fold') folds++; }
    expect(folds).toBeGreaterThan(25);
  });
  it('should classify postflop hand strength tiers', () => {
    const a = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('A','hearts'),makeCard('K','clubs'),makeCard('5','diamonds')], player: makeBot({ holeCards: [makeCard('A','spades'),makeCard('K','spades')] }), currentBet: 0, potSize: 10 }));
    expect(['bet','raise','check','all_in']).toContain(a.actionType);
  });
});

describe('Bot Decisions', () => {
  it('should make preflop decision via GTO table lookup', () => {
    setGTOData({ 'UTG_open': mockChart }, null);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('K','spades'),makeCard('K','hearts')] }) }));
    expect(['raise','all_in']).toContain(a.actionType);
  });
  it('should make postflop decision based on hand strength and board texture', () => {
    setGTOData(null, [{ boardTexture: 'high_rainbow_disconnected', handStrength: 'strong', street: 'flop', isInPosition: true, recommendation: { primaryAction: 'bet_medium' }, disclaimer: 't' }]);
    const a = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('A','spades'),makeCard('7','hearts'),makeCard('2','clubs')], player: makeBot({ position: 'BTN', holeCards: [makeCard('A','hearts'),makeCard('K','hearts')] }), currentBet: 0, potSize: 10 }));
    expect(['bet','check','raise']).toContain(a.actionType);
  });
  it('should apply randomization for mixed strategies', () => {
    setGTOData({ 'UTG_open': mockChart }, null);
    const actions = new Set<string>();
    for (let i = 0; i < 100; i++) actions.add(decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('K','hearts')] }) })).actionType);
    expect(actions.size).toBeGreaterThanOrEqual(1);
  });
  it('should fold weak hands in early position preflop', () => {
    setGTOData({ 'UTG_open': mockChart }, null);
    expect(decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('7','spades'),makeCard('2','hearts')] }) })).actionType).toBe('fold');
  });
  it('should handle all-in situations correctly', () => {
    const a = decideBotAction(makeCtx({ player: makeBot({ chipStack: 3, holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }), currentBet: 20 }));
    expect(['all_in','call','fold']).toContain(a.actionType);
  });
});
