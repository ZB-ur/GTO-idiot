// ============================================================
// GameEngine integration tests — hand lifecycle & state machine
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../engine/game-engine';
import type { Player } from '../../types';
import { DEFAULT_BLINDS, DEFAULT_STARTING_STACK_BB } from '../../types';

function createPlayers(humanSeat = 0): Player[] {
  const styles = ['TAG', 'LAG', 'TP', 'LP', 'GTO'] as const;
  const positions = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'] as const;
  return Array.from({ length: 6 }, (_, i) => ({
    seat: i,
    name: i === humanSeat ? 'You' : `BOT-${styles[i > humanSeat ? i - 1 : i] ?? 'TAG'}-${i}`,
    isHuman: i === humanSeat,
    botStyle: i === humanSeat ? null : (styles[i > humanSeat ? i - 1 : i] ?? 'TAG'),
    stackBB: DEFAULT_STARTING_STACK_BB,
    position: positions[i],
    isActive: true,
    isSittingOut: false,
  }));
}

describe('GameEngine', () => {
  let engine: GameEngine;
  const humanSeat = 0;

  beforeEach(() => {
    engine = new GameEngine({
      sessionId: 'test-session',
      players: createPlayers(humanSeat),
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat,
    });
  });

  describe('startHand', () => {
    it('should deal a new hand and return valid HandState', () => {
      const state = engine.startHand();

      expect(state.id).toBeTruthy();
      expect(state.sessionId).toBe('test-session');
      expect(state.handNumber).toBe(1);
      expect(state.phase).toBe('preflop');
      expect(state.players).toHaveLength(6);
      expect(state.communityCards).toHaveLength(0);
      expect(state.pots.length).toBeGreaterThanOrEqual(1);
      expect(state.currentActingSeat).not.toBeNull();
      expect(state.dealerSeat).toBe(0);
      expect(state.userHoleCards).toHaveLength(2);
    });

    it('should increment hand count on each new hand', () => {
      expect(engine.getHandCount()).toBe(0);

      engine.startHand();
      expect(engine.getHandCount()).toBe(1);

      // Fold everyone to complete the hand, then start next
      const state = engine.getHandState();
      let seat = state.currentActingSeat;
      while (seat !== null && !engine.isHandComplete()) {
        engine.submitAction({ type: 'fold' });
        if (!engine.isHandComplete()) {
          seat = engine.getHandState().currentActingSeat;
        } else {
          break;
        }
      }

      engine.settleHand();
      engine.startHand();
      expect(engine.getHandCount()).toBe(2);
    });

    it('should throw if previous hand is not completed', () => {
      engine.startHand();
      expect(() => engine.startHand()).toThrow('Previous hand not yet completed');
    });

    it('should post blinds correctly', () => {
      const state = engine.startHand();

      // Find SB and BB players
      const sb = state.players.find(p => p.position === 'SB');
      const bb = state.players.find(p => p.position === 'BB');

      expect(sb).toBeDefined();
      expect(bb).toBeDefined();
      expect(sb!.stackBB).toBe(DEFAULT_STARTING_STACK_BB - DEFAULT_BLINDS.smallBlind);
      expect(bb!.stackBB).toBe(DEFAULT_STARTING_STACK_BB - DEFAULT_BLINDS.bigBlind);
    });

    it('should assign positions correctly from dealer seat', () => {
      const state = engine.startHand();
      const positionMap = new Map(state.players.map(p => [p.seat, p.position]));

      // Dealer is seat 0 = BTN
      expect(positionMap.get(0)).toBe('BTN');
      expect(positionMap.get(1)).toBe('SB');
      expect(positionMap.get(2)).toBe('BB');
      expect(positionMap.get(3)).toBe('UTG');
      expect(positionMap.get(4)).toBe('MP');
      expect(positionMap.get(5)).toBe('CO');
    });
  });

  describe('getAvailableActions', () => {
    it('should return legal actions for the current player', () => {
      engine.startHand();
      const available = engine.getAvailableActions();

      expect(available.handId).toBeTruthy();
      expect(available.seat).toBeGreaterThanOrEqual(0);
      expect(available.actions.length).toBeGreaterThan(0);

      const actionTypes = available.actions.map(a => a.type);
      // Preflop UTG should be able to fold, call, raise
      expect(actionTypes).toContain('fold');
    });

    it('should return empty actions when no active hand', () => {
      expect(() => engine.getAvailableActions()).toThrow('No active hand');
    });
  });

  describe('submitAction', () => {
    it('should process a fold action', () => {
      engine.startHand();
      const result = engine.submitAction({ type: 'fold' });

      expect(result.actionLog.action).toBe('fold');
      expect(result.handState).toBeDefined();
      expect(typeof result.isHandComplete).toBe('boolean');
      expect(typeof result.nextActorIsBot).toBe('boolean');
    });

    it('should process a call action', () => {
      engine.startHand();
      const result = engine.submitAction({ type: 'call' });

      expect(result.actionLog.action).toBe('call');
      expect(result.actionLog.amount).toBeGreaterThan(0);
    });

    it('should process a raise action', () => {
      engine.startHand();
      const result = engine.submitAction({ type: 'raise', amount: 3 });

      expect(result.actionLog.action).toBe('raise');
    });

    it('should advance to next player after action', () => {
      engine.startHand();
      const before = engine.getHandState().currentActingSeat;
      engine.submitAction({ type: 'call' });
      const after = engine.getHandState().currentActingSeat;

      // Next player should be different (or null if round completes)
      if (after !== null) {
        expect(after).not.toBe(before);
      }
    });

    it('should throw when no active hand', () => {
      expect(() => engine.submitAction({ type: 'fold' })).toThrow('No active hand');
    });

    it('should complete hand when all but one fold', () => {
      engine.startHand();

      // Fold all players until hand is complete
      let complete = false;
      for (let i = 0; i < 5; i++) {
        const result = engine.submitAction({ type: 'fold' });
        if (result.isHandComplete) {
          complete = true;
          break;
        }
      }

      expect(complete).toBe(true);
      expect(engine.isHandComplete()).toBe(true);
    });
  });

  describe('settleHand', () => {
    it('should settle when all but one player folded', () => {
      engine.startHand();

      // Fold until only one left
      while (!engine.isHandComplete()) {
        engine.submitAction({ type: 'fold' });
      }

      const settlement = engine.settleHand();

      expect(settlement.handId).toBeTruthy();
      expect(settlement.winners.length).toBeGreaterThan(0);
      expect(settlement.wonWithoutShowdown).toBe(true);
      expect(settlement.chipMovements.length).toBeGreaterThan(0);
      expect(settlement.playerFinalStacks.length).toBe(6);
    });

    it('should throw when settling with multiple active players in non-showdown phase', () => {
      engine.startHand();
      // Don't fold anyone — try to settle
      expect(() => engine.settleHand()).toThrow();
    });

    it('should update player stacks after settlement', () => {
      engine.startHand();

      while (!engine.isHandComplete()) {
        engine.submitAction({ type: 'fold' });
      }

      const settlement = engine.settleHand();

      // Winner should have more than starting stack
      const winner = settlement.winners[0];
      const winnerStack = settlement.playerFinalStacks.find(p => p.seat === winner.seat);
      expect(winnerStack!.stackBB).toBeGreaterThan(DEFAULT_STARTING_STACK_BB - DEFAULT_BLINDS.bigBlind);
    });
  });

  describe('dealer rotation', () => {
    it('should rotate dealer button between hands', () => {
      engine.startHand();
      const firstDealer = engine.getDealerSeat();

      // Complete first hand
      while (!engine.isHandComplete()) {
        engine.submitAction({ type: 'fold' });
      }
      engine.settleHand();

      // Start second hand
      engine.startHand();
      const secondDealer = engine.getDealerSeat();

      expect(secondDealer).not.toBe(firstDealer);
    });
  });

  describe('getActionLog', () => {
    it('should accumulate action log entries', () => {
      engine.startHand();
      expect(engine.getActionLog()).toHaveLength(0);

      engine.submitAction({ type: 'call' });
      expect(engine.getActionLog()).toHaveLength(1);

      engine.submitAction({ type: 'fold' });
      expect(engine.getActionLog()).toHaveLength(2);
    });
  });
});
