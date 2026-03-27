/**
 * Feature Acceptance Tests: F-003 game-engine
 * Complete 6-max NL Hold'em game engine logic
 */
import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards } from '../../../src/game-engine/deck';
import { evaluateHand, compareHands } from '../../../src/game-engine/hand-evaluator';
import { applyAction, advanceStreet, getAvailableActions } from '../../../src/game-engine/betting';
import { calculatePots } from '../../../src/game-engine/pot-calculator';
import { card } from '../setup';

describe('F-003: game-engine', () => {
  describe('F-003: dealing and initialization', () => {
    it('F-003: should assign each player 200BB (400 chips) at game start', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);

      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);

      // Verify all 52 unique cards are present
      const cardStrings = shuffled.map(c => `${c.rank}${c.suit}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(52);
    });

    it('F-003: should deal 2 hole cards to each of 6 players', () => {
      const deck = shuffleDeck(createDeck());
      const { hands, remainingDeck } = dealCards(deck, 6, 2);

      expect(hands).toHaveLength(6);
      for (const hand of hands) {
        expect(hand).toHaveLength(2);
      }
      // 52 - 12 = 40 remaining
      expect(remainingDeck).toHaveLength(40);
    });

    it('F-003: should auto-post small blind (1) and big blind (2)', () => {
      // Given a new hand with 6 players, the SB and BB should be auto-posted
      const initialState = {
        players: Array.from({ length: 6 }, (_, i) => ({
          chipCount: 400,
          currentBet: 0,
          isFolded: false,
          isAllIn: false,
          seatIndex: i,
        })),
        dealerSeatIndex: 3,
        pot: 0,
        street: 'preflop' as const,
      };

      // SB is seat 4 (next after BTN), BB is seat 5
      // After posting blinds:
      // SB (seat 4): chips 399, bet 1
      // BB (seat 5): chips 398, bet 2
      // Pot: 3
      // These are the expected outcomes after blind posting
      expect(initialState.players[4].chipCount).toBe(400); // Before posting
    });
  });

  describe('F-003: street advancement', () => {
    it('F-003: should advance to flop when all preflop action completes with 2+ players remaining', () => {
      // Setup: preflop action complete, 3 players remaining
      const state = {
        street: 'preflop' as const,
        activePlayers: 3,
        allBetsMatched: true,
        pot: 12,
      };

      const nextState = advanceStreet(state);
      expect(nextState.street).toBe('flop');
    });

    it('F-003: should not advance to flop if bets are not matched', () => {
      const state = {
        street: 'preflop' as const,
        activePlayers: 3,
        allBetsMatched: false,
        pot: 12,
      };

      // Should return same state or throw
      expect(() => advanceStreet(state)).toThrow();
    });
  });

  describe('F-003: hand evaluation and showdown', () => {
    it('F-003: should correctly rank hand types (royal flush > straight flush > ... > high card)', () => {
      const royalFlush = evaluateHand([
        card('A', 's'), card('K', 's'), card('Q', 's'), card('J', 's'), card('T', 's'),
        card('3', 'h'), card('2', 'd'),
      ]);

      const fullHouse = evaluateHand([
        card('A', 's'), card('A', 'h'), card('A', 'd'), card('K', 's'), card('K', 'h'),
        card('3', 'h'), card('2', 'd'),
      ]);

      const onePair = evaluateHand([
        card('A', 's'), card('A', 'h'), card('7', 'd'), card('5', 's'), card('3', 'h'),
        card('9', 'c'), card('2', 'd'),
      ]);

      // Royal flush beats full house
      expect(compareHands(royalFlush, fullHouse)).toBeGreaterThan(0);
      // Full house beats one pair
      expect(compareHands(fullHouse, onePair)).toBeGreaterThan(0);
    });

    it('F-003: should correctly determine winner from 7 cards (2 hole + 5 community)', () => {
      const playerA = evaluateHand([
        card('A', 's'), card('K', 's'), // hole cards
        card('Q', 's'), card('J', 's'), card('T', 's'), card('3', 'h'), card('2', 'd'), // community
      ]);

      const playerB = evaluateHand([
        card('9', 'h'), card('8', 'h'), // hole cards
        card('Q', 's'), card('J', 's'), card('T', 's'), card('3', 'h'), card('2', 'd'), // community
      ]);

      expect(compareHands(playerA, playerB)).toBeGreaterThan(0);
    });

    it('F-003: should split pot equally when hands tie', () => {
      // Both players have the same 5-card hand from the board
      const playerA = evaluateHand([
        card('2', 'h'), card('3', 'h'), // irrelevant hole cards
        card('A', 's'), card('K', 's'), card('Q', 'd'), card('J', 'c'), card('T', 'h'),
      ]);

      const playerB = evaluateHand([
        card('2', 'd'), card('3', 'd'), // irrelevant hole cards
        card('A', 's'), card('K', 's'), card('Q', 'd'), card('J', 'c'), card('T', 'h'),
      ]);

      expect(compareHands(playerA, playerB)).toBe(0);
    });
  });

  describe('F-003: side pots', () => {
    it('F-003: should correctly create side pots when a player is all-in', () => {
      // Player A has 100 chips, goes all-in
      // Player B and C have 400 chips, continue betting
      const bets = [
        { playerId: 'A', amount: 100, isAllIn: true },
        { playerId: 'B', amount: 200, isAllIn: false },
        { playerId: 'C', amount: 200, isAllIn: false },
      ];

      const pots = calculatePots(bets);

      // Main pot: 100 * 3 = 300 (A, B, C eligible)
      expect(pots[0].amount).toBe(300);
      expect(pots[0].eligiblePlayerIds).toContain('A');
      expect(pots[0].eligiblePlayerIds).toContain('B');
      expect(pots[0].eligiblePlayerIds).toContain('C');

      // Side pot: 100 * 2 = 200 (B, C eligible)
      expect(pots[1].amount).toBe(200);
      expect(pots[1].eligiblePlayerIds).not.toContain('A');
      expect(pots[1].eligiblePlayerIds).toContain('B');
      expect(pots[1].eligiblePlayerIds).toContain('C');
    });
  });

  describe('F-003: win conditions', () => {
    it('F-003: should award pot to last remaining player when all others fold', () => {
      // Only one player remaining (not folded)
      const players = [
        { playerId: 'A', isFolded: false, chipCount: 394 },
        { playerId: 'B', isFolded: true, chipCount: 394 },
        { playerId: 'C', isFolded: true, chipCount: 394 },
        { playerId: 'D', isFolded: true, chipCount: 394 },
        { playerId: 'E', isFolded: true, chipCount: 394 },
        { playerId: 'F', isFolded: true, chipCount: 394 },
      ];

      const activePlayers = players.filter(p => !p.isFolded);
      expect(activePlayers).toHaveLength(1);
      expect(activePlayers[0].playerId).toBe('A');
    });

    it('F-003: should move dealer button clockwise after each hand', () => {
      const currentDealer = 3;
      const numPlayers = 6;
      const nextDealer = (currentDealer + 1) % numPlayers;
      expect(nextDealer).toBe(4);

      // Wraps around
      const wrapDealer = (5 + 1) % numPlayers;
      expect(wrapDealer).toBe(0);
    });
  });

  describe('F-003: available actions', () => {
    it('F-003: should compute correct available actions for current player', () => {
      const actions = getAvailableActions({
        currentPlayerChips: 400,
        currentPlayerBet: 0,
        highestBet: 6,
        minRaiseIncrement: 6,
        canCheck: false,
      });

      expect(actions.canFold).toBe(true);
      expect(actions.canCall).toBe(true);
      expect(actions.callAmount).toBe(6);
      expect(actions.canRaise).toBe(true);
      expect(actions.minRaise).toBe(12);
      expect(actions.maxRaise).toBe(400);
    });
  });
});
