import { describe, it, expect } from 'vitest';
import {
  evaluateHand,
  compareHands,
  determineWinners,
  HandRankCategory,
} from '../../engine/hand-evaluator';
import { createCard } from '../../engine/utils';
import type { Card } from '../../types/card';

// Helper to create cards from notation strings
function cards(...notations: string[]): Card[] {
  return notations.map(n => createCard(n[0] as any, n[1] as any));
}

describe('HandEvaluator', () => {
  describe('evaluateHand', () => {
    it('should detect Royal Flush', () => {
      const hand = cards('As', 'Ks', 'Qs', 'Js', 'Ts');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.RoyalFlush);
      expect(result.description).toBe('Royal Flush');
    });

    it('should detect Straight Flush', () => {
      const hand = cards('9h', '8h', '7h', '6h', '5h');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.StraightFlush);
      expect(result.description).toContain('Straight Flush');
    });

    it('should detect Four of a Kind', () => {
      const hand = cards('Ks', 'Kh', 'Kd', 'Kc', '3s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.FourOfAKind);
      expect(result.description).toContain('Four of a Kind');
    });

    it('should detect Full House', () => {
      const hand = cards('Qs', 'Qh', 'Qd', '7c', '7s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.FullHouse);
      expect(result.description).toContain('Full House');
    });

    it('should detect Flush', () => {
      const hand = cards('Ad', 'Td', '7d', '4d', '2d');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.Flush);
      expect(result.description).toContain('Flush');
    });

    it('should detect Straight', () => {
      const hand = cards('9s', '8h', '7d', '6c', '5s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.Straight);
      expect(result.description).toContain('Straight');
    });

    it('should detect Ace-low Straight (wheel)', () => {
      const hand = cards('5s', '4h', '3d', '2c', 'As');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.Straight);
      expect(result.description).toContain('Five high');
    });

    it('should detect Three of a Kind', () => {
      const hand = cards('8s', '8h', '8d', 'Kc', '3s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.ThreeOfAKind);
      expect(result.description).toContain('Three of a Kind');
    });

    it('should detect Two Pair', () => {
      const hand = cards('Js', 'Jh', '5d', '5c', 'As');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.TwoPair);
      expect(result.description).toContain('Two Pair');
    });

    it('should detect One Pair', () => {
      const hand = cards('Ts', 'Th', '7d', '4c', '2s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.OnePair);
      expect(result.description).toContain('Pair of');
    });

    it('should detect High Card', () => {
      const hand = cards('As', 'Jh', '8d', '5c', '2s');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.HighCard);
      expect(result.description).toContain('High');
    });

    it('should evaluate best 5 from 7 cards', () => {
      // Hole: As Ks, Board: Qs Js Ts 2c 3d → Royal Flush
      const hand = cards('As', 'Ks', 'Qs', 'Js', 'Ts', '2c', '3d');
      const result = evaluateHand(hand);
      expect(result.category).toBe(HandRankCategory.RoyalFlush);
    });

    it('should throw for fewer than 5 cards', () => {
      const hand = cards('As', 'Kh', '3d', '5c');
      expect(() => evaluateHand(hand)).toThrow();
    });

    it('should throw for more than 7 cards', () => {
      const hand = cards('As', 'Kh', 'Qs', 'Jh', 'Ts', '9c', '8d', '7s');
      expect(() => evaluateHand(hand)).toThrow();
    });
  });

  describe('compareHands', () => {
    it('should rank Royal Flush above Straight Flush', () => {
      const royal = evaluateHand(cards('As', 'Ks', 'Qs', 'Js', 'Ts'));
      const sf = evaluateHand(cards('9h', '8h', '7h', '6h', '5h'));
      expect(compareHands(royal, sf)).toBeGreaterThan(0);
    });

    it('should rank higher pair above lower pair', () => {
      const aces = evaluateHand(cards('As', 'Ah', '7d', '4c', '2s'));
      const kings = evaluateHand(cards('Ks', 'Kh', '7d', '4c', '2s'));
      expect(compareHands(aces, kings)).toBeGreaterThan(0);
    });

    it('should use kickers to break ties', () => {
      const pairAcesKingKicker = evaluateHand(cards('As', 'Ah', 'Kd', '4c', '2s'));
      const pairAcesQueenKicker = evaluateHand(cards('As', 'Ah', 'Qd', '4c', '2s'));
      expect(compareHands(pairAcesKingKicker, pairAcesQueenKicker)).toBeGreaterThan(0);
    });

    it('should return 0 for equal hands', () => {
      const hand1 = evaluateHand(cards('As', 'Kh', 'Qd', 'Jc', '9s'));
      const hand2 = evaluateHand(cards('Ad', 'Kc', 'Qs', 'Jh', '9d'));
      expect(compareHands(hand1, hand2)).toBe(0);
    });

    it('should rank flush above straight', () => {
      const flush = evaluateHand(cards('Ad', 'Td', '7d', '4d', '2d'));
      const straight = evaluateHand(cards('9s', '8h', '7d', '6c', '5s'));
      expect(compareHands(flush, straight)).toBeGreaterThan(0);
    });

    it('should rank full house above flush', () => {
      const fh = evaluateHand(cards('Ks', 'Kh', 'Kd', '7c', '7s'));
      const flush = evaluateHand(cards('Ad', 'Td', '7d', '4d', '2d'));
      expect(compareHands(fh, flush)).toBeGreaterThan(0);
    });
  });

  describe('determineWinners', () => {
    it('should identify a single winner', () => {
      const hands = [
        { playerId: 'p1', evaluation: evaluateHand(cards('As', 'Ah', '7d', '4c', '2s')) },
        { playerId: 'p2', evaluation: evaluateHand(cards('Ks', 'Kh', '7d', '4c', '2s')) },
      ];
      const winners = determineWinners(hands);
      expect(winners).toEqual(['p1']);
    });

    it('should identify split pot (tie)', () => {
      const hands = [
        { playerId: 'p1', evaluation: evaluateHand(cards('As', 'Kh', 'Qd', 'Jc', '9s')) },
        { playerId: 'p2', evaluation: evaluateHand(cards('Ad', 'Kc', 'Qs', 'Jh', '9d')) },
      ];
      const winners = determineWinners(hands);
      expect(winners).toContain('p1');
      expect(winners).toContain('p2');
      expect(winners).toHaveLength(2);
    });

    it('should return empty for empty input', () => {
      expect(determineWinners([])).toEqual([]);
    });

    it('should pick the best hand from multiple players', () => {
      const hands = [
        { playerId: 'p1', evaluation: evaluateHand(cards('2s', '3h', '7d', '9c', 'Ts')) },
        { playerId: 'p2', evaluation: evaluateHand(cards('As', 'Ah', 'Kd', 'Kc', '2s')) },
        { playerId: 'p3', evaluation: evaluateHand(cards('Qs', 'Jh', '9d', '5c', '2s')) },
      ];
      const winners = determineWinners(hands);
      expect(winners).toEqual(['p2']);
    });
  });
});
