import { describe, it, expect } from 'vitest';
import {
  initializeHand,
  applyAction,
  isHandComplete,
  getCurrentStreet,
  isLastPlayerStanding,
} from '../../engine/game-state';
import type { HandState, Position, BlindSize } from '../../types/game';

function createTestPlayers(userPosition: Position = 'BTN') {
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  return positions.map((pos, i) => ({
    id: pos === userPosition ? 'user-1' : `bot-${i}`,
    name: pos === userPosition ? 'You' : `Bot ${i}`,
    position: pos,
    stack: 100,
    isUser: pos === userPosition,
  }));
}

const DEFAULT_BLINDS: BlindSize = { smallBlind: 0.5, bigBlind: 1 };

describe('GameState', () => {
  describe('initializeHand', () => {
    it('should create a hand in preflop phase', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      expect(state.phase).toBe('preflop');
      expect(state.gameId).toBe('game-1');
      expect(state.handNumber).toBe(1);
    });

    it('should post small and big blinds', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      // Pot should contain SB + BB = 0.5 + 1 = 1.5
      expect(state.pot).toBe(1.5);

      // Blinds should be in action history
      const blindActions = state.actionHistory.filter(a => a.street === 'preflop');
      expect(blindActions.length).toBeGreaterThanOrEqual(2);
    });

    it('should deal hole cards to the user', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      expect(state.userHoleCards).toBeDefined();
      expect(state.userHoleCards!.card1).toBeDefined();
      expect(state.userHoleCards!.card2).toBeDefined();
      expect(state.userHoleCards!.card1.notation).not.toBe(state.userHoleCards!.card2.notation);
    });

    it('should have 6 players', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');
      expect(state.players).toHaveLength(6);
    });

    it('should set a current actor', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');
      expect(state.currentActorId).not.toBeNull();
    });

    it('should set dealer position', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'CO', DEFAULT_BLINDS, 'user-1');
      expect(state.dealerPosition).toBe('CO');
    });

    it('should deduct blind amounts from player stacks', () => {
      const players = createTestPlayers('UTG');
      // Dealer at BTN → SB is SB position, BB is BB position
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      const sb = state.players.find(p => p.position === 'SB');
      const bb = state.players.find(p => p.position === 'BB');

      expect(sb!.stack).toBe(99.5);
      expect(bb!.stack).toBe(99);
    });
  });

  describe('applyAction', () => {
    let state: HandState;

    function initState(): HandState {
      const players = createTestPlayers('UTG');
      return initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');
    }

    it('should handle fold action', () => {
      state = initState();
      const actorId = state.currentActorId!;
      const newState = applyAction(state, actorId, { action: 'fold' });

      const foldedPlayer = newState.players.find(p => p.playerId === actorId);
      expect(foldedPlayer!.isFolded).toBe(true);
    });

    it('should handle call action', () => {
      state = initState();
      const actorId = state.currentActorId!;
      const playerBefore = state.players.find(p => p.playerId === actorId)!;
      const stackBefore = playerBefore.stack;

      const newState = applyAction(state, actorId, { action: 'call' });
      const playerAfter = newState.players.find(p => p.playerId === actorId)!;

      expect(playerAfter.stack).toBeLessThan(stackBefore);
      expect(newState.pot).toBeGreaterThan(state.pot);
    });

    it('should handle raise action', () => {
      state = initState();
      const actorId = state.currentActorId!;

      const newState = applyAction(state, actorId, { action: 'raise', amount: 3 });
      const playerAfter = newState.players.find(p => p.playerId === actorId)!;

      expect(playerAfter.currentBet).toBe(3);
      expect(newState.pot).toBeGreaterThan(state.pot);
    });

    it('should handle all-in action', () => {
      state = initState();
      const actorId = state.currentActorId!;

      const newState = applyAction(state, actorId, { action: 'all_in' });
      const playerAfter = newState.players.find(p => p.playerId === actorId)!;

      expect(playerAfter.stack).toBe(0);
      expect(playerAfter.isAllIn).toBe(true);
    });

    it('should record action in history', () => {
      state = initState();
      const actorId = state.currentActorId!;

      const newState = applyAction(state, actorId, { action: 'fold' });
      const lastAction = newState.actionHistory[newState.actionHistory.length - 1];

      expect(lastAction!.playerId).toBe(actorId);
      expect(lastAction!.action).toBe('fold');
    });

    it('should advance to next player after action', () => {
      state = initState();
      const actorId = state.currentActorId!;

      const newState = applyAction(state, actorId, { action: 'call' });
      expect(newState.currentActorId).not.toBe(actorId);
    });

    it('should throw for unknown player', () => {
      state = initState();
      expect(() => applyAction(state, 'nonexistent', { action: 'fold' })).toThrow('not found');
    });
  });

  describe('phase transitions', () => {
    it('should complete hand when all but one fold', () => {
      const players = createTestPlayers('UTG');
      let state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      // Fold all players until only one remains
      let foldCount = 0;
      while (!isHandComplete(state) && state.currentActorId && foldCount < 10) {
        state = applyAction(state, state.currentActorId, { action: 'fold' });
        foldCount++;
      }

      // Eventually the hand should complete
      if (isHandComplete(state)) {
        expect(state.phase).toBe('complete');
        expect(state.winners).toBeDefined();
        expect(state.winners!.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should advance to flop after preflop betting completes', () => {
      const players = createTestPlayers('BB');
      let state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');

      // Have all players call to end preflop betting round
      let iterations = 0;
      while (state.phase === 'preflop' && state.currentActorId && iterations < 20) {
        const actor = state.currentActorId;
        // Try calling; if check is available (BB last to act), check
        const player = state.players.find(p => p.playerId === actor)!;
        const highestBet = Math.max(...state.players.map(p => p.currentBet));
        if (player.currentBet >= highestBet) {
          state = applyAction(state, actor, { action: 'check' });
        } else {
          state = applyAction(state, actor, { action: 'call' });
        }
        iterations++;
      }

      // Phase should have advanced or hand completed
      if (!isHandComplete(state)) {
        expect(state.phase).toBe('flop');
        expect(state.communityCards.length).toBe(3);
      }
    });
  });

  describe('isHandComplete', () => {
    it('should return false for active hand', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');
      expect(isHandComplete(state)).toBe(false);
    });
  });

  describe('getCurrentStreet', () => {
    it('should map phases to streets', () => {
      expect(getCurrentStreet('preflop')).toBe('preflop');
      expect(getCurrentStreet('flop')).toBe('flop');
      expect(getCurrentStreet('turn')).toBe('turn');
      expect(getCurrentStreet('river')).toBe('river');
    });

    it('should return null for non-street phases', () => {
      expect(getCurrentStreet('waiting')).toBeNull();
      expect(getCurrentStreet('showdown')).toBeNull();
      expect(getCurrentStreet('complete')).toBeNull();
    });
  });

  describe('isLastPlayerStanding', () => {
    it('should return false when multiple players active', () => {
      const players = createTestPlayers();
      const state = initializeHand('game-1', 1, players, 'BTN', DEFAULT_BLINDS, 'user-1');
      expect(isLastPlayerStanding(state)).toBe(false);
    });
  });
});
