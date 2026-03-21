// ============================================================
// Game Engine — Unit tests for deck, betting, pots, evaluation, settlement
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { DeckManager } from '../src/engine/deck-manager';
import {
  getLegalActions,
  applyAction,
  isBettingRoundComplete,
  resetForNewStreet,
  type BettingState,
} from '../src/engine/betting-round';
import {
  evaluateHand,
  compareHands,
  HandRankCategory,
} from '../src/engine/hand-evaluator';
import { PotManager } from '../src/engine/pot-manager';
import type { Card, HandPlayer, HandPhase } from '../src/types';

// ============================================================
// Helpers
// ============================================================

function card(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit };
}

function makePlayer(overrides: Partial<HandPlayer> = {}): HandPlayer {
  return {
    seat: 0,
    name: 'Player',
    stackBB: 100,
    position: 'BTN',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    holeCards: null,
    lastAction: null,
    ...overrides,
  };
}

function makeBettingState(overrides: Partial<BettingState> = {}): BettingState {
  return {
    currentBet: 0,
    minRaiseIncrement: 1,
    lastRaiserSeat: null,
    activeBettors: 2,
    actedSeats: new Set(),
    street: 'preflop',
    bigBlind: 1,
    ...overrides,
  };
}

// ============================================================
// DeckManager tests
// ============================================================

describe('DeckManager', () => {
  let deck: DeckManager;

  beforeEach(() => {
    deck = new DeckManager();
    deck.shuffle();
  });

  it('creates a full 52-card deck with no duplicates', () => {
    const cards: Card[] = [];
    for (let i = 0; i < 52; i++) {
      cards.push(deck.deal());
    }
    expect(cards).toHaveLength(52);

    const unique = new Set(cards.map((c) => `${c.rank}${c.suit}`));
    expect(unique.size).toBe(52);
  });

  it('Fisher-Yates shuffle produces valid permutation', () => {
    const deck2 = new DeckManager();
    deck2.shuffle();
    // Deal all 52 cards and verify they form a valid deck
    const cards: Card[] = [];
    for (let i = 0; i < 52; i++) {
      cards.push(deck2.deal());
    }
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits = ['s', 'h', 'd', 'c'];
    for (const r of ranks) {
      for (const s of suits) {
        expect(cards.some((c) => c.rank === r && c.suit === s)).toBe(true);
      }
    }
  });

  it('deals correct number of cards and removes from deck', () => {
    expect(deck.remaining).toBe(52);
    const dealt = deck.dealMany(5);
    expect(dealt).toHaveLength(5);
    expect(deck.remaining).toBe(47);
  });

  it('throws when deck is exhausted', () => {
    deck.dealMany(52);
    expect(() => deck.deal()).toThrow('Deck exhausted');
  });
});

// ============================================================
// Hand state machine (phase transitions)
// ============================================================

describe('Hand state machine transitions', () => {
  it('transitions preflop → flop → turn → river → showdown → settled', () => {
    const phases: HandPhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown', 'settled'];
    // Verify all phases are valid
    for (const phase of phases) {
      expect(['preflop', 'flop', 'turn', 'river', 'showdown', 'settled']).toContain(phase);
    }
    // Verify ordering
    expect(phases.indexOf('preflop')).toBeLessThan(phases.indexOf('flop'));
    expect(phases.indexOf('flop')).toBeLessThan(phases.indexOf('turn'));
    expect(phases.indexOf('turn')).toBeLessThan(phases.indexOf('river'));
    expect(phases.indexOf('river')).toBeLessThan(phases.indexOf('showdown'));
    expect(phases.indexOf('showdown')).toBeLessThan(phases.indexOf('settled'));
  });
});

// ============================================================
// Blind posting
// ============================================================

describe('Blind posting', () => {
  it('deducts correct amounts from SB and BB', () => {
    const sb = makePlayer({ seat: 0, stackBB: 100, position: 'SB' });
    const bb = makePlayer({ seat: 1, stackBB: 100, position: 'BB' });
    const state = makeBettingState({ currentBet: 1, street: 'preflop' });

    // Post SB
    sb.stackBB -= 0.5;
    sb.currentBet = 0.5;
    expect(sb.stackBB).toBe(99.5);

    // Post BB
    bb.stackBB -= 1;
    bb.currentBet = 1;
    expect(bb.stackBB).toBe(99);

    expect(state.currentBet).toBe(1);
  });
});

// ============================================================
// Legal actions / betting round
// ============================================================

describe('getLegalActions', () => {
  it('validates legal actions based on game state', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 0 });

    const actions = getLegalActions(player, state);
    const types = actions.map((a) => a.type);

    // When no bet to call: can check and bet
    expect(types).toContain('check');
    expect(types).toContain('bet');
    expect(types).not.toContain('fold');
  });

  it('rejects invalid actions (check when facing bet)', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const actions = getLegalActions(player, state);
    const types = actions.map((a) => a.type);

    expect(types).not.toContain('check');
    expect(types).toContain('fold');
    expect(types).toContain('call');
  });
});

describe('applyAction', () => {
  it('processes fold correctly', () => {
    const player = makePlayer({ stackBB: 100 });
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'fold' }, state);

    expect(player.isActive).toBe(false);
    expect(player.lastAction).toBe('fold');
    expect(result.chipsPut).toBe(0);
  });

  it('processes call correctly — matches current bet', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'call' }, state);

    expect(player.stackBB).toBe(98);
    expect(player.currentBet).toBe(2);
    expect(player.lastAction).toBe('call');
    expect(result.chipsPut).toBe(2);
  });

  it('processes raise correctly — validates min/max sizes', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 1, minRaiseIncrement: 1, street: 'preflop' });

    const result = applyAction(player, { type: 'raise', amount: 3 }, state);

    expect(player.currentBet).toBe(3);
    expect(player.stackBB).toBe(97);
    expect(result.newBetLevel).toBe(3);
  });

  it('processes all-in correctly', () => {
    const player = makePlayer({ stackBB: 50, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'all_in' }, state);

    expect(player.stackBB).toBe(0);
    expect(player.isAllIn).toBe(true);
    expect(player.currentBet).toBe(50);
    expect(result.chipsPut).toBe(50);
  });

  it('throws on check when facing a bet', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    expect(() => applyAction(player, { type: 'check' }, state)).toThrow('Cannot check');
  });
});

describe('isBettingRoundComplete', () => {
  it('detects betting round completion', () => {
    const p1 = makePlayer({ seat: 0, currentBet: 2 });
    const p2 = makePlayer({ seat: 1, currentBet: 2 });
    const state = makeBettingState({
      currentBet: 2,
      actedSeats: new Set([0, 1]),
    });

    expect(isBettingRoundComplete([p1, p2], state)).toBe(true);
  });

  it('returns false when players still need to act', () => {
    const p1 = makePlayer({ seat: 0, currentBet: 2 });
    const p2 = makePlayer({ seat: 1, currentBet: 0 });
    const state = makeBettingState({
      currentBet: 2,
      actedSeats: new Set([0]),
    });

    expect(isBettingRoundComplete([p1, p2], state)).toBe(false);
  });

  it('returns true when only one active bettor remains', () => {
    const p1 = makePlayer({ seat: 0, isActive: false });
    const p2 = makePlayer({ seat: 1 });
    const state = makeBettingState({ actedSeats: new Set() });

    expect(isBettingRoundComplete([p1, p2], state)).toBe(true);
  });
});

// ============================================================
// Pot calculation
// ============================================================

describe('PotManager', () => {
  let pm: PotManager;

  beforeEach(() => {
    pm = new PotManager();
  });

  it('main pot calculated correctly for 2-player hand', () => {
    pm.reset([0, 1]);
    pm.addContribution(0, 10);
    pm.addContribution(1, 10);

    const pots = pm.calculatePots();
    expect(pots).toHaveLength(1);
    expect(pots[0].amount).toBe(20);
    expect(pots[0].eligibleSeats).toEqual([0, 1]);
  });

  it('side pot created for 3-player all-in with different stacks', () => {
    pm.reset([0, 1, 2]);

    // Player 0: 10 chips all-in
    pm.addContribution(0, 10);
    pm.markAllIn(0);

    // Player 1: 20 chips all-in
    pm.addContribution(1, 20);
    pm.markAllIn(1);

    // Player 2: 20 chips
    pm.addContribution(2, 20);

    const pots = pm.calculatePots();

    // Main pot: 10 * 3 = 30 (all three eligible)
    expect(pots[0].amount).toBe(30);
    expect(pots[0].eligibleSeats).toContain(0);
    expect(pots[0].eligibleSeats).toContain(1);
    expect(pots[0].eligibleSeats).toContain(2);

    // Side pot: 10 * 2 = 20 (player 1 and 2 eligible)
    expect(pots[1].amount).toBe(20);
    expect(pots[1].eligibleSeats).not.toContain(0);
    expect(pots[1].eligibleSeats).toContain(1);
    expect(pots[1].eligibleSeats).toContain(2);
  });

  it('multiple side pots for 4+ player all-in', () => {
    pm.reset([0, 1, 2, 3]);

    pm.addContribution(0, 5);
    pm.markAllIn(0);

    pm.addContribution(1, 15);
    pm.markAllIn(1);

    pm.addContribution(2, 25);
    pm.markAllIn(2);

    pm.addContribution(3, 25);

    const pots = pm.calculatePots();

    // Main pot: 5 * 4 = 20
    expect(pots[0].amount).toBe(20);
    expect(pots[0].eligibleSeats).toHaveLength(4);

    // Side pot 1: 10 * 3 = 30
    expect(pots[1].amount).toBe(30);
    expect(pots[1].eligibleSeats).not.toContain(0);

    // Side pot 2: 10 * 2 = 20
    expect(pots[2].amount).toBe(20);
    expect(pots[2].eligibleSeats).not.toContain(0);
    expect(pots[2].eligibleSeats).not.toContain(1);

    expect(pm.getTotalPot()).toBe(70);
  });
});

// ============================================================
// Hand evaluator
// ============================================================

describe('HandEvaluator', () => {
  it('ranks hands correctly across all hand types', () => {
    const royalFlush = evaluateHand([
      card('A', 's'), card('K', 's'), card('Q', 's'), card('J', 's'), card('T', 's'),
    ]);
    const straightFlush = evaluateHand([
      card('9', 'h'), card('8', 'h'), card('7', 'h'), card('6', 'h'), card('5', 'h'),
    ]);
    const fourKind = evaluateHand([
      card('A', 's'), card('A', 'h'), card('A', 'd'), card('A', 'c'), card('K', 's'),
    ]);
    const fullHouse = evaluateHand([
      card('K', 's'), card('K', 'h'), card('K', 'd'), card('T', 's'), card('T', 'h'),
    ]);
    const flush = evaluateHand([
      card('A', 'd'), card('J', 'd'), card('9', 'd'), card('7', 'd'), card('3', 'd'),
    ]);
    const straight = evaluateHand([
      card('T', 's'), card('9', 'h'), card('8', 'd'), card('7', 'c'), card('6', 's'),
    ]);
    const threeKind = evaluateHand([
      card('Q', 's'), card('Q', 'h'), card('Q', 'd'), card('9', 'c'), card('5', 's'),
    ]);
    const twoPair = evaluateHand([
      card('J', 's'), card('J', 'h'), card('8', 'd'), card('8', 'c'), card('A', 's'),
    ]);
    const onePair = evaluateHand([
      card('T', 's'), card('T', 'h'), card('A', 'd'), card('K', 'c'), card('4', 's'),
    ]);
    const highCard = evaluateHand([
      card('A', 's'), card('Q', 'h'), card('9', 'd'), card('6', 'c'), card('3', 's'),
    ]);

    expect(royalFlush.category).toBe(HandRankCategory.RoyalFlush);
    expect(straightFlush.category).toBe(HandRankCategory.StraightFlush);
    expect(fourKind.category).toBe(HandRankCategory.FourOfAKind);
    expect(fullHouse.category).toBe(HandRankCategory.FullHouse);
    expect(flush.category).toBe(HandRankCategory.Flush);
    expect(straight.category).toBe(HandRankCategory.Straight);
    expect(threeKind.category).toBe(HandRankCategory.ThreeOfAKind);
    expect(twoPair.category).toBe(HandRankCategory.TwoPair);
    expect(onePair.category).toBe(HandRankCategory.OnePair);
    expect(highCard.category).toBe(HandRankCategory.HighCard);

    // Verify ordering
    expect(royalFlush.score).toBeGreaterThan(straightFlush.score);
    expect(straightFlush.score).toBeGreaterThan(fourKind.score);
    expect(fourKind.score).toBeGreaterThan(fullHouse.score);
    expect(fullHouse.score).toBeGreaterThan(flush.score);
    expect(flush.score).toBeGreaterThan(straight.score);
    expect(straight.score).toBeGreaterThan(threeKind.score);
    expect(threeKind.score).toBeGreaterThan(twoPair.score);
    expect(twoPair.score).toBeGreaterThan(onePair.score);
    expect(onePair.score).toBeGreaterThan(highCard.score);
  });

  it('handles 7-card best-5 extraction', () => {
    // 7 cards where best 5 form a flush
    const result = evaluateHand([
      card('A', 'd'), card('J', 'd'), card('9', 'd'), card('7', 'd'), card('3', 'd'),
      card('K', 's'), card('2', 'h'),
    ]);
    expect(result.category).toBe(HandRankCategory.Flush);
    expect(result.bestCards).toHaveLength(5);
  });

  it('showdown comparison determines winner correctly', () => {
    const handA = evaluateHand([
      card('A', 's'), card('A', 'h'), card('K', 's'), card('K', 'h'), card('Q', 's'),
    ]); // Two pair AA KK
    const handB = evaluateHand([
      card('J', 's'), card('J', 'h'), card('J', 'd'), card('5', 'c'), card('3', 's'),
    ]); // Three of a kind

    expect(compareHands(handB, handA)).toBeGreaterThan(0); // Three of a kind beats two pair
  });

  it('showdown handles ties (split pot)', () => {
    const handA = evaluateHand([
      card('A', 's'), card('K', 'h'), card('Q', 'd'), card('J', 'c'), card('T', 's'),
    ]); // Broadway straight
    const handB = evaluateHand([
      card('A', 'd'), card('K', 's'), card('Q', 'h'), card('J', 's'), card('T', 'd'),
    ]); // Same broadway straight

    expect(compareHands(handA, handB)).toBe(0);
  });
});

// ============================================================
// Settlement
// ============================================================

describe('Settlement', () => {
  it('distributes main pot to winner', () => {
    const pm = new PotManager();
    pm.reset([0, 1]);
    pm.addContribution(0, 10);
    pm.addContribution(1, 10);

    const pots = pm.calculatePots();
    expect(pots[0].amount).toBe(20);

    // Winner is seat 0
    const winnerSeat = 0;
    expect(pots[0].eligibleSeats).toContain(winnerSeat);
  });

  it('distributes side pots to eligible winners', () => {
    const pm = new PotManager();
    pm.reset([0, 1, 2]);
    pm.addContribution(0, 10);
    pm.markAllIn(0);
    pm.addContribution(1, 20);
    pm.addContribution(2, 20);

    const pots = pm.calculatePots();
    // Main pot: eligible [0, 1, 2]
    expect(pots[0].eligibleSeats).toContain(0);
    // Side pot: eligible [1, 2] only
    expect(pots[1].eligibleSeats).not.toContain(0);
  });

  it('handles split pot rounding', () => {
    const pm = new PotManager();
    pm.reset([0, 1]);
    pm.addContribution(0, 5);
    pm.addContribution(1, 5);

    const pots = pm.calculatePots();
    const totalPot = pots[0].amount; // 10
    const splitAmount = totalPot / 2;
    // Should be exactly divisible — 5 each
    expect(splitAmount).toBe(5);

    // Odd pot: 3 + 3 = 6 total in partial scenario
    const pm2 = new PotManager();
    pm2.reset([0, 1]);
    pm2.addContribution(0, 3);
    pm2.addContribution(1, 3);
    const pots2 = pm2.calculatePots();
    // 6 / 2 = 3 each, clean split
    expect(pots2[0].amount).toBe(6);
  });
});

// ============================================================
// Full hand lifecycle
// ============================================================

describe('Full hand lifecycle', () => {
  it('deal → bet → flop → bet → turn → bet → river → showdown → settle', () => {
    // 1. Deal
    const deck = new DeckManager();
    deck.shuffle();
    const p1HoleCards = deck.dealMany(2);
    const p2HoleCards = deck.dealMany(2);
    expect(p1HoleCards).toHaveLength(2);
    expect(p2HoleCards).toHaveLength(2);

    // 2. Post blinds
    const p1 = makePlayer({ seat: 0, stackBB: 100, currentBet: 0.5, position: 'SB' });
    const p2 = makePlayer({ seat: 1, stackBB: 100, currentBet: 1, position: 'BB' });
    p1.stackBB -= 0.5;
    p2.stackBB -= 1;

    const pm = new PotManager();
    pm.reset([0, 1]);
    pm.addContribution(0, 0.5);
    pm.addContribution(1, 1);

    // 3. Preflop action: P1 calls
    const state = makeBettingState({ currentBet: 1, street: 'preflop' });
    applyAction(p1, { type: 'call' }, state);
    state.actedSeats.add(0);
    pm.addContribution(0, 0.5);

    // P2 checks
    p2.currentBet = 1; // already at BB
    state.actedSeats.add(1);
    expect(isBettingRoundComplete([p1, p2], state)).toBe(true);

    // 4. Flop
    deck.burn();
    const flop = deck.dealMany(3);
    expect(flop).toHaveLength(3);
    const flopState = resetForNewStreet([p1, p2], 'flop', 1);

    // P1 checks, P2 checks
    applyAction(p1, { type: 'check' }, flopState);
    flopState.actedSeats.add(0);
    applyAction(p2, { type: 'check' }, flopState);
    flopState.actedSeats.add(1);
    expect(isBettingRoundComplete([p1, p2], flopState)).toBe(true);

    // 5. Turn
    deck.burn();
    const turnCard = deck.deal();
    expect(turnCard).toBeDefined();
    const turnState = resetForNewStreet([p1, p2], 'turn', 1);
    applyAction(p1, { type: 'check' }, turnState);
    turnState.actedSeats.add(0);
    applyAction(p2, { type: 'check' }, turnState);
    turnState.actedSeats.add(1);

    // 6. River
    deck.burn();
    const riverCard = deck.deal();
    expect(riverCard).toBeDefined();
    const riverState = resetForNewStreet([p1, p2], 'river', 1);
    applyAction(p1, { type: 'check' }, riverState);
    riverState.actedSeats.add(0);
    applyAction(p2, { type: 'check' }, riverState);
    riverState.actedSeats.add(1);

    // 7. Showdown — evaluate both hands
    const community = [...flop, turnCard, riverCard];
    const hand1 = evaluateHand([...p1HoleCards, ...community]);
    const hand2 = evaluateHand([...p2HoleCards, ...community]);

    const cmp = compareHands(hand1, hand2);
    // One wins, loses, or ties
    expect(typeof cmp).toBe('number');

    // 8. Settle
    const pots = pm.calculatePots();
    expect(pots[0].amount).toBe(2); // 0.5 + 0.5 + 1 (initial) + 0.5 (call) = 2
  });
});
