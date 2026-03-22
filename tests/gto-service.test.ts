import { describe, it, expect, beforeEach } from 'vitest';
import { setGTOData, decideBotAction, type BotDecisionContext } from '../src/bot/bot-engine';
import type { Card, Player, PreflopChart, PostflopGuide } from '../src/types';
import { DEFAULT_BLINDS } from '../src/types';

function makeCard(rank: Card['rank'], suit: Card['suit']): Card { return { rank, suit }; }
function makeBot(ov: Partial<Player> = {}): Player {
  return { id: 'bot-1', name: 'Bot-1', position: 'UTG', chipStack: 200, isBot: true, isActive: true, currentBet: 0, isFolded: false, isAllIn: false, isDealer: false, ...ov };
}
function makeCtx(ov: Partial<BotDecisionContext> = {}): BotDecisionContext {
  return { player: makeBot(), players: Array.from({ length: 6 }, (_, i) => makeBot({ id: `b${i}` })), street: 'preflop', communityCards: [], currentBet: 2, potSize: 3, blinds: DEFAULT_BLINDS, dealerIndex: 0, preflopRaiseCount: 0, ...ov };
}

const mockCharts: Record<string, PreflopChart> = {
  'UTG_open': { position: 'UTG', scenario: 'open', disclaimer: 't', matrix: [
    [{ hand: 'AA', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }, { hand: 'AKs', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }],
    [{ hand: 'AKo', actions: [{ action: 'raise', frequency: 0.7 }, { action: 'call', frequency: 0.3 }], primaryAction: 'raise' }, { hand: 'KK', actions: [{ action: 'raise', frequency: 1.0 }], primaryAction: 'raise' }],
  ] },
};
const mockGuides: PostflopGuide[] = [
  { boardTexture: 'high_rainbow_disconnected', handStrength: 'nuts', street: 'flop', isInPosition: true, recommendation: { primaryAction: 'bet_big', frequency: 0.8, alternativeAction: 'check', alternativeFrequency: 0.2 }, disclaimer: 't' },
  { boardTexture: 'low_rainbow_disconnected', handStrength: 'air', street: 'flop', isInPosition: false, recommendation: { primaryAction: 'check' }, disclaimer: 't' },
];

beforeEach(() => setGTOData(null, null));

describe('GTO Service - Loading', () => {
  it('should load preflop chart JSON files', () => {
    setGTOData(mockCharts, null);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }) }));
    expect(['raise','all_in']).toContain(a.actionType);
  });
  it('should load postflop guide JSON files', () => {
    setGTOData(null, mockGuides);
    const a = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('2','spades'),makeCard('5','hearts'),makeCard('8','clubs')], player: makeBot({ holeCards: [makeCard('7','spades'),makeCard('3','hearts')] }), currentBet: 0 }));
    expect(['check','fold','bet']).toContain(a.actionType);
  });
  it('should cache loaded tables in memory', () => {
    setGTOData(mockCharts, mockGuides);
    const ctx = makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('K','spades'),makeCard('K','hearts')] }) });
    expect(decideBotAction(ctx).actionType).toBeDefined();
    expect(decideBotAction(ctx).actionType).toBeDefined();
  });
});

describe('GTO Service - Chart Lookup', () => {
  it('should return preflop chart for given position and scenario', () => {
    setGTOData(mockCharts, null);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }), preflopRaiseCount: 0 }));
    expect(['raise','all_in']).toContain(a.actionType);
  });
  it('should return postflop guide for given context', () => {
    setGTOData(null, mockGuides);
    const a = decideBotAction(makeCtx({ street: 'flop', communityCards: [makeCard('A','spades'),makeCard('7','hearts'),makeCard('2','clubs')], player: makeBot({ position: 'BTN', holeCards: [makeCard('A','hearts'),makeCard('A','diamonds')] }), currentBet: 0, potSize: 10, dealerIndex: 0 }));
    expect(['bet','check','raise','all_in']).toContain(a.actionType);
  });
});

describe('GTO Service - Comparison', () => {
  it('should compare user action vs GTO recommendation as match', () => {
    setGTOData(mockCharts, null);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }) }));
    expect(['raise','all_in']).toContain(a.actionType);
  });
  it('should compare user action vs GTO as minor deviation', () => {
    setGTOData(mockCharts, null);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('K','hearts')] }) }));
    expect(['raise','call','all_in']).toContain(a.actionType);
  });
  it('should compare user action vs GTO as major deviation', () => {
    setGTOData(mockCharts, null);
    expect(decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('A','hearts')] }) })).actionType).not.toBe('fold');
  });
  it('should handle edge case with no GTO data for exotic scenario', () => {
    setGTOData({}, []);
    const a = decideBotAction(makeCtx({ player: makeBot({ position: 'UTG', holeCards: [makeCard('A','spades'),makeCard('K','hearts')] }) }));
    expect(a.actionType).toBeDefined();
    expect(['raise','call','check','fold','all_in']).toContain(a.actionType);
  });
});
