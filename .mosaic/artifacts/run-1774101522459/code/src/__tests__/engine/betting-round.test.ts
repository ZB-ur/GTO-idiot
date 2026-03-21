// ============================================================
// BettingRound tests — legal actions, action application, round completion
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getLegalActions,
  applyAction,
  isBettingRoundComplete,
  resetForNewStreet,
  type BettingState,
} from '../../engine/betting-round';
import type { HandPlayer } from '../../types';

function makePlayer(overrides: Partial<HandPlayer> = {}): HandPlayer {
  return {
    seat: 0,
    name: 'Test',
    stackBB: 100,
    position: 'UTG',
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
    activeBettors: 6,
    actedSeats: new Set(),
    street: 'flop',
    bigBlind: 1,
    ...overrides,
  };
}

describe('getLegalActions', () => {
  it('should return check and bet when no current bet', () => {
    const player = makePlayer();
    const state = makeBettingState();

    const actions = getLegalActions(player, state);
    const types = actions.map(a => a.type);

    expect(types).toContain('check');
    expect(types).toContain('bet');
    expect(types).not.toContain('fold');
    expect(types).not.toContain('call');
  });

  it('should return fold, call, raise when facing a bet', () => {
    const player = makePlayer({ currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const actions = getLegalActions(player, state);
    const types = actions.map(a => a.type);

    expect(types).toContain('fold');
    expect(types).toContain('call');
    expect(types).toContain('raise');
    expect(types).not.toContain('check');
  });

  it('should return empty for inactive player', () => {
    const player = makePlayer({ isActive: false });
    const state = makeBettingState();

    const actions = getLegalActions(player, state);
    expect(actions).toHaveLength(0);
  });

  it('should return empty for all-in player', () => {
    const player = makePlayer({ isAllIn: true });
    const state = makeBettingState();

    const actions = getLegalActions(player, state);
    expect(actions).toHaveLength(0);
  });

  it('should offer all-in when stack is less than min bet', () => {
    const player = makePlayer({ stackBB: 0.5 });
    const state = makeBettingState({ currentBet: 0 });

    const actions = getLegalActions(player, state);
    const types = actions.map(a => a.type);

    expect(types).toContain('all_in');
  });

  it('should offer all-in call when stack cannot cover the call', () => {
    const player = makePlayer({ stackBB: 1, currentBet: 0 });
    const state = makeBettingState({ currentBet: 5 });

    const actions = getLegalActions(player, state);
    const types = actions.map(a => a.type);

    expect(types).toContain('all_in');
    expect(types).toContain('fold');
    // Cannot call normally since stack < toCall
    // Cannot raise since stack = toCall
  });

  it('should set correct min/max for bet', () => {
    const player = makePlayer({ stackBB: 50 });
    const state = makeBettingState({ bigBlind: 1 });

    const actions = getLegalActions(player, state);
    const betAction = actions.find(a => a.type === 'bet');

    expect(betAction).toBeDefined();
    expect(betAction!.minAmount).toBe(1); // 1 BB
    expect(betAction!.maxAmount).toBe(50); // full stack
  });

  it('should set correct min/max for raise', () => {
    const player = makePlayer({ stackBB: 50, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2, minRaiseIncrement: 2 });

    const actions = getLegalActions(player, state);
    const raiseAction = actions.find(a => a.type === 'raise');

    expect(raiseAction).toBeDefined();
    expect(raiseAction!.minAmount).toBe(4); // current bet + min raise = 2 + 2
    expect(raiseAction!.maxAmount).toBe(50); // currentBet + stack = 0 + 50
  });
});

describe('applyAction', () => {
  it('should apply fold correctly', () => {
    const player = makePlayer();
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'fold' }, state);

    expect(result.chipsPut).toBe(0);
    expect(player.isActive).toBe(false);
    expect(player.lastAction).toBe('fold');
  });

  it('should apply check correctly', () => {
    const player = makePlayer();
    const state = makeBettingState({ currentBet: 0 });

    const result = applyAction(player, { type: 'check' }, state);

    expect(result.chipsPut).toBe(0);
    expect(player.lastAction).toBe('check');
  });

  it('should throw on check when there is a bet', () => {
    const player = makePlayer();
    const state = makeBettingState({ currentBet: 2 });

    expect(() => applyAction(player, { type: 'check' }, state))
      .toThrow('Cannot check when there is a bet to call');
  });

  it('should apply call correctly', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'call' }, state);

    expect(result.chipsPut).toBe(2);
    expect(player.stackBB).toBe(98);
    expect(player.currentBet).toBe(2);
    expect(player.lastAction).toBe('call');
  });

  it('should handle call with insufficient stack (all-in call)', () => {
    const player = makePlayer({ stackBB: 1, currentBet: 0 });
    const state = makeBettingState({ currentBet: 5 });

    const result = applyAction(player, { type: 'call' }, state);

    expect(result.chipsPut).toBe(1);
    expect(player.stackBB).toBe(0);
    expect(player.isAllIn).toBe(true);
  });

  it('should apply bet correctly', () => {
    const player = makePlayer({ stackBB: 100 });
    const state = makeBettingState({ currentBet: 0 });

    const result = applyAction(player, { type: 'bet', amount: 3 }, state);

    expect(result.chipsPut).toBe(3);
    expect(result.newBetLevel).toBe(3);
    expect(player.stackBB).toBe(97);
    expect(player.currentBet).toBe(3);
  });

  it('should throw on bet when there is already a bet', () => {
    const player = makePlayer();
    const state = makeBettingState({ currentBet: 2 });

    expect(() => applyAction(player, { type: 'bet', amount: 3 }, state))
      .toThrow('Cannot bet when there is already a bet');
  });

  it('should apply raise correctly', () => {
    const player = makePlayer({ stackBB: 100, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2, minRaiseIncrement: 2, street: 'preflop' });

    const result = applyAction(player, { type: 'raise', amount: 6 }, state);

    expect(result.chipsPut).toBe(6);
    expect(result.newBetLevel).toBe(6);
    expect(player.stackBB).toBe(94);
    expect(player.currentBet).toBe(6);
  });

  it('should apply all-in correctly', () => {
    const player = makePlayer({ stackBB: 50, currentBet: 0 });
    const state = makeBettingState({ currentBet: 2 });

    const result = applyAction(player, { type: 'all_in' }, state);

    expect(result.chipsPut).toBe(50);
    expect(player.stackBB).toBe(0);
    expect(player.isAllIn).toBe(true);
    expect(player.currentBet).toBe(50);
    expect(result.newBetLevel).toBe(50);
  });
});

describe('isBettingRoundComplete', () => {
  it('should be complete when all active players have acted and matched', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0, currentBet: 2 }),
      makePlayer({ seat: 1, currentBet: 2 }),
      makePlayer({ seat: 2, isActive: false }), // folded
    ];
    const state = makeBettingState({
      currentBet: 2,
      actedSeats: new Set([0, 1]),
    });

    expect(isBettingRoundComplete(players, state)).toBe(true);
  });

  it('should not be complete when a player has not acted', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0, currentBet: 2 }),
      makePlayer({ seat: 1, currentBet: 0 }),
    ];
    const state = makeBettingState({
      currentBet: 2,
      actedSeats: new Set([0]),
    });

    expect(isBettingRoundComplete(players, state)).toBe(false);
  });

  it('should not be complete when a player has not matched the bet', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0, currentBet: 4 }),
      makePlayer({ seat: 1, currentBet: 2 }),
    ];
    const state = makeBettingState({
      currentBet: 4,
      actedSeats: new Set([0, 1]),
    });

    expect(isBettingRoundComplete(players, state)).toBe(false);
  });

  it('should be complete when only one active bettor remains', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0 }),
      makePlayer({ seat: 1, isActive: false }),
      makePlayer({ seat: 2, isActive: false }),
    ];
    const state = makeBettingState();

    expect(isBettingRoundComplete(players, state)).toBe(true);
  });

  it('should be complete when all active players are all-in', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0, isAllIn: true }),
      makePlayer({ seat: 1, isAllIn: true }),
    ];
    const state = makeBettingState();

    expect(isBettingRoundComplete(players, state)).toBe(true);
  });
});

describe('resetForNewStreet', () => {
  it('should reset all player bets and create fresh state', () => {
    const players: HandPlayer[] = [
      makePlayer({ seat: 0, currentBet: 10, lastAction: 'raise' }),
      makePlayer({ seat: 1, currentBet: 10, lastAction: 'call' }),
      makePlayer({ seat: 2, isActive: false, currentBet: 5, lastAction: 'fold' }),
    ];

    const newState = resetForNewStreet(players, 'turn', 1);

    // Players should have bets reset
    expect(players[0].currentBet).toBe(0);
    expect(players[1].currentBet).toBe(0);
    expect(players[0].lastAction).toBeNull();
    expect(players[1].lastAction).toBeNull();

    // State should be fresh
    expect(newState.currentBet).toBe(0);
    expect(newState.minRaiseIncrement).toBe(1);
    expect(newState.lastRaiserSeat).toBeNull();
    expect(newState.actedSeats.size).toBe(0);
    expect(newState.street).toBe('turn');
  });
});
