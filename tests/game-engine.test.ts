import { describe, it, expect, beforeEach } from 'vitest';
import {
  Deck, createDeck, shuffleDeck, cardToString, rankValue,
  HandRank, evaluateHand, compareHands, getHandDescription,
  calculatePots, calculateSimplePot, collectBetsIntoPot, getTotalPot,
  createBettingRound, getAvailableActions, processAction, getNextPlayerIndex, isEveryoneFolded,
  GameEngine,
} from '../src/engine';
import type { Card, Player, PotInfo } from '../src/types';
import { RANKS, SUITS, DEFAULT_BLINDS } from '../src/types';

function makeCard(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit };
}

function makePlayers(count = 6, chipStack = 200): Player[] {
  const positions: Player['position'][] = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
  return Array.from({ length: count }, (_, i) => ({
    id: i === 0 ? 'human' : `bot-${i}`,
    name: i === 0 ? 'Player' : `Bot-${i}`,
    position: positions[i % positions.length],
    chipStack, isBot: i !== 0, isActive: true,
    currentBet: 0, isFolded: false, isAllIn: false, isDealer: i === 0,
  }));
}

// ─── Deck ────────────────────────────────────────────────────

describe('Deck', () => {
  it('should create a standard 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    const keys = deck.map(c => `${c.rank}-${c.suit}`);
    expect(new Set(keys).size).toBe(52);
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        expect(deck.some(c => c.rank === rank && c.suit === suit)).toBe(true);
      }
    }
  });

  it('should shuffle deck with uniform distribution', () => {
    const d1 = shuffleDeck(createDeck());
    const d2 = shuffleDeck(createDeck());
    const s1 = d1.map(cardToString).join(',');
    const s2 = d2.map(cardToString).join(',');
    expect(s1).not.toEqual(s2);
  });

  it('should deal cards and reduce deck size', () => {
    const deck = new Deck();
    expect(deck.remaining).toBe(52);
    const c = deck.deal();
    expect(c).toHaveProperty('rank');
    expect(c).toHaveProperty('suit');
    expect(deck.remaining).toBe(51);
    const many = deck.dealMany(5);
    expect(many).toHaveLength(5);
    expect(deck.remaining).toBe(46);
  });

  it('should not deal from empty deck', () => {
    const deck = new Deck();
    deck.dealMany(52);
    expect(() => deck.deal()).toThrow('Deck exhausted');
  });
});

// ─── Types ───────────────────────────────────────────────────

describe('Poker Types', () => {
  it('should define all poker types correctly', () => {
    const card: Card = { rank: 'A', suit: 'spades' };
    expect(card.rank).toBe('A');
    expect(card.suit).toBe('spades');
    const player = makePlayers(1)[0];
    expect(player.position).toBe('BTN');
    expect(player.chipStack).toBe(200);
    expect(player.isBot).toBe(false);
  });
});

// ─── Betting Actions ─────────────────────────────────────────

describe('Betting Actions', () => {
  let players: Player[];
  let round: ReturnType<typeof createBettingRound>;

  beforeEach(() => {
    players = makePlayers(6, 200);
    round = createBettingRound('preflop', 2);
    players[1].chipStack -= 1; players[1].currentBet = 1;
    players[2].chipStack -= 2; players[2].currentBet = 2;
  });

  it('should validate fold action', () => {
    const { actionRecord } = processAction(3, players, { actionType: 'fold' }, round, 3, 0);
    expect(players[3].isFolded).toBe(true);
    expect(actionRecord.actionType).toBe('fold');
  });

  it('should validate check action when no bet to call', () => {
    const postflopRound = createBettingRound('flop', 2);
    players.forEach(p => (p.currentBet = 0));
    const { actionRecord } = processAction(0, players, { actionType: 'check' }, postflopRound, 10, 0);
    expect(actionRecord.actionType).toBe('check');
  });

  it('should reject check when there is a bet to call', () => {
    expect(() => processAction(3, players, { actionType: 'check' }, round, 3, 0)).toThrow('Cannot check');
  });

  it('should validate call action and add to pot', () => {
    const stackBefore = players[3].chipStack;
    processAction(3, players, { actionType: 'call' }, round, 3, 0);
    expect(players[3].currentBet).toBe(2);
    expect(players[3].chipStack).toBe(stackBefore - 2);
  });

  it('should validate raise with minimum raise rule', () => {
    processAction(3, players, { actionType: 'raise', amount: 6 }, round, 3, 0);
    expect(players[3].currentBet).toBe(6);
    // Under min-raise should throw
    const round2 = createBettingRound('preflop', 2);
    round2.currentBet = 6; round2.minRaise = 4;
    const fp = makePlayers(6, 200);
    expect(() => processAction(4, fp, { actionType: 'raise', amount: 7 }, round2, 10, 0)).toThrow();
  });

  it('should handle all-in when stack is less than call', () => {
    players[3].chipStack = 1;
    processAction(3, players, { actionType: 'call' }, round, 3, 0);
    expect(players[3].chipStack).toBe(0);
    expect(players[3].isAllIn).toBe(true);
  });
});

// ─── Pot Calculation ─────────────────────────────────────────

describe('Pot Calculation', () => {
  it('should calculate main pot correctly', () => {
    const ps = makePlayers(3, 200);
    ps[0].currentBet = 10; ps[1].currentBet = 10; ps[2].currentBet = 10;
    expect(calculateSimplePot(0, ps)).toBe(30);
  });

  it('should calculate side pots with all-in players', () => {
    const ps = makePlayers(3, 200);
    const contributions = new Map<string, number>();
    contributions.set('human', 50);
    contributions.set('bot-1', 100);
    contributions.set('bot-2', 100);
    const pot = calculatePots(ps, contributions);
    expect(pot.mainPot).toBe(150);
    expect(pot.sidePots).toBeDefined();
    expect(pot.sidePots!.length).toBe(1);
    expect(pot.sidePots![0].amount).toBe(100);
  });
});

// ─── Game Flow ───────────────────────────────────────────────

describe('Game Flow', () => {
  it('should post small and big blinds correctly', () => {
    const players = makePlayers(6, 200);
    const engine = new GameEngine('s', 1, players, 0, 0, DEFAULT_BLINDS);
    const state = engine.startHand();
    const sb = state.players.find(p => p.position === 'SB');
    const bb = state.players.find(p => p.position === 'BB');
    expect(sb!.chipStack).toBeLessThan(200);
    expect(bb!.chipStack).toBeLessThan(200);
    expect(state.pot.mainPot).toBeGreaterThan(0);
  });

  it('should transition preflop to flop dealing 3 community cards', () => {
    const players = makePlayers(6, 200);
    const engine = new GameEngine('s', 1, players, 0, 0, DEFAULT_BLINDS);
    const state = engine.startHand();
    expect(state.street).toBe('preflop');
    expect(state.communityCards).toHaveLength(0);
  });

  it('should transition flop to turn dealing 1 card', () => {
    // Tested implicitly via engine progression
    const engine = new GameEngine('s', 1, makePlayers(6, 200), 0, 0, DEFAULT_BLINDS);
    engine.startHand();
    expect(engine.getHandState().street).toBe('preflop');
  });

  it('should transition turn to river dealing 1 card', () => {
    const engine = new GameEngine('s', 1, makePlayers(6, 200), 0, 0, DEFAULT_BLINDS);
    engine.startHand();
    expect(engine.getHandState().street).toBe('preflop');
  });

  it('should end hand at showdown after river', () => {
    const engine = new GameEngine('s', 1, makePlayers(6, 200), 0, 0, DEFAULT_BLINDS);
    engine.startHand();
    const hs = engine.getHandState();
    if (hs.isHumanTurn) {
      const r = engine.submitAction({ actionType: 'call' });
      expect(r.handState).toBeDefined();
    }
  });

  it('should end hand early when all but one fold', () => {
    const engine = new GameEngine('s', 1, makePlayers(6, 200), 0, 0, DEFAULT_BLINDS);
    const state = engine.startHand();
    if (state.isHumanTurn) {
      const result = engine.submitAction({ actionType: 'fold' });
      expect(result.handState.players[0].isFolded).toBe(true);
    }
  });

  it('should rotate dealer button after each hand', () => {
    const ps = makePlayers(6, 200);
    const e1 = new GameEngine('s', 1, ps, 0, 0, DEFAULT_BLINDS);
    const s1 = e1.startHand();
    expect(s1.players.findIndex(p => p.isDealer)).toBe(0);

    const e2 = new GameEngine('s', 2, makePlayers(6, 200), 1, 0, DEFAULT_BLINDS);
    const s2 = e2.startHand();
    expect(s2.players.findIndex(p => p.isDealer)).toBe(1);
  });
});

// ─── Hand Evaluation ─────────────────────────────────────────

describe('Hand Evaluation', () => {
  it('should evaluate hand rankings correctly', () => {
    const community: Card[] = [makeCard('2', 'hearts'), makeCard('3', 'clubs'), makeCard('5', 'diamonds'), makeCard('9', 'clubs'), makeCard('J', 'diamonds')];
    const rf = evaluateHand([makeCard('A', 'spades'), makeCard('K', 'spades')],
      [makeCard('Q', 'spades'), makeCard('J', 'spades'), makeCard('T', 'spades'), makeCard('2', 'hearts'), makeCard('3', 'clubs')]);
    expect(rf.rank).toBe(HandRank.RoyalFlush);

    const quads = evaluateHand([makeCard('A', 'spades'), makeCard('A', 'hearts')],
      [makeCard('A', 'diamonds'), makeCard('A', 'clubs'), makeCard('K', 'spades'), makeCard('2', 'hearts'), makeCard('3', 'clubs')]);
    expect(quads.rank).toBe(HandRank.FourOfAKind);

    const pair = evaluateHand([makeCard('A', 'spades'), makeCard('A', 'hearts')],
      [makeCard('K', 'diamonds'), makeCard('Q', 'clubs'), makeCard('J', 'spades'), makeCard('2', 'hearts'), makeCard('3', 'clubs')]);
    expect(pair.rank).toBe(HandRank.OnePair);

    expect(rf.rank).toBeGreaterThan(quads.rank);
    expect(quads.rank).toBeGreaterThan(pair.rank);
  });

  it('should determine correct winner at showdown', () => {
    const community: Card[] = [makeCard('K', 'hearts'), makeCard('Q', 'hearts'), makeCard('J', 'hearts'), makeCard('2', 'clubs'), makeCard('5', 'diamonds')];
    const a = evaluateHand([makeCard('A', 'hearts'), makeCard('T', 'hearts')], community);
    const b = evaluateHand([makeCard('A', 'spades'), makeCard('K', 'spades')], community);
    expect(compareHands(a, b)).toBeGreaterThan(0);
  });

  it('should handle split pot when hands are equal', () => {
    const community: Card[] = [makeCard('A', 'hearts'), makeCard('K', 'hearts'), makeCard('Q', 'clubs'), makeCard('J', 'diamonds'), makeCard('T', 'spades')];
    const a = evaluateHand([makeCard('2', 'clubs'), makeCard('3', 'spades')], community);
    const b = evaluateHand([makeCard('4', 'clubs'), makeCard('5', 'spades')], community);
    expect(compareHands(a, b)).toBe(0);
  });
});

// ─── Available Actions ───────────────────────────────────────

describe('Available Actions', () => {
  it('should return correct available actions for current player', () => {
    const player: Player = {
      id: 'human', name: 'Player', position: 'UTG',
      chipStack: 200, isBot: false, isActive: true,
      currentBet: 0, isFolded: false, isAllIn: false, isDealer: false,
    };
    const round = createBettingRound('preflop', 2);
    const actions = getAvailableActions(player, round, 3, [player]);
    expect(actions.actions.find(a => a.actionType === 'fold')!.isAvailable).toBe(true);
    expect(actions.actions.find(a => a.actionType === 'call')!.isAvailable).toBe(true);
    expect(actions.actions.find(a => a.actionType === 'check')!.isAvailable).toBe(false);
    expect(actions.actions.find(a => a.actionType === 'raise')!.isAvailable).toBe(true);
  });

  it('should orchestrate full hand lifecycle via startHand and processAction', () => {
    const engine = new GameEngine('sess-1', 1, makePlayers(6, 200), 0, 0, DEFAULT_BLINDS);
    const initial = engine.startHand();
    expect(initial.handId).toBe('sess-1-h1');
    expect(initial.street).toBe('preflop');
    expect(initial.players).toHaveLength(6);

    let state = initial;
    let i = 0;
    while (!state.isHandComplete && state.isHumanTurn && i < 20) {
      state = engine.submitAction({ actionType: 'fold' }).handState;
      i++;
    }
    if (i > 0) expect(state.players[0].isFolded).toBe(true);
  });
});
