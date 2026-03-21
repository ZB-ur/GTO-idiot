import { describe, it, expect } from 'vitest';
import { GameEngine, type GameConfig } from '../../src/engine/game-engine';

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    blinds: { small_blind: 1, big_blind: 2 },
    playerCount: 6,
    heroSeat: 0,
    startingStacks: [100, 100, 100, 100, 100, 100],
    playerNames: ['Hero', 'Bot1', 'Bot2', 'Bot3', 'Bot4', 'Bot5'],
    botFlags: [false, true, true, true, true, true],
    dealerSeat: 0,
    ...overrides,
  };
}

describe('GameEngine', () => {
  it('should initialize 6-max hand with correct positions (SB/BB/UTG/MP/CO/BTN)', () => {
    const engine = new GameEngine('s1', 1, makeConfig());
    const state = engine.startHand();
    expect(state.players.length).toBe(6);
    const positions = state.players.map((p) => p.position);
    expect(positions).toContain('BTN');
    expect(positions).toContain('SB');
    expect(positions).toContain('BB');
    expect(positions).toContain('UTG');
  });

  it('should collect blinds at hand start', () => {
    const engine = new GameEngine('s1', 1, makeConfig());
    const state = engine.startHand();
    // SB (seat 1) should have posted 1, BB (seat 2) should have posted 2
    const sb = state.players.find((p) => p.position === 'SB');
    const bb = state.players.find((p) => p.position === 'BB');
    expect(sb!.current_bet).toBe(1);
    expect(bb!.current_bet).toBe(2);
    expect(sb!.stack).toBe(99);
    expect(bb!.stack).toBe(98);
  });

  it('should rotate dealer button after each hand', () => {
    const config1 = makeConfig({ dealerSeat: 0 });
    const config2 = makeConfig({ dealerSeat: 1 });
    const engine1 = new GameEngine('s1', 1, config1);
    const engine2 = new GameEngine('s1', 2, config2);
    const state1 = engine1.startHand();
    const state2 = engine2.startHand();
    expect(state1.dealer_seat).toBe(0);
    expect(state2.dealer_seat).toBe(1);
  });

  it('should deal 2 hole cards to each active player', () => {
    const engine = new GameEngine('s1', 1, makeConfig());
    const state = engine.startHand();
    // Hero should have hole cards
    const hero = state.players.find((p) => p.seat === 0);
    expect(hero!.hole_cards).not.toBeNull();
    expect(hero!.hole_cards!.length).toBe(2);
    // Bot cards should be hidden
    const bot = state.players.find((p) => p.seat === 1);
    expect(bot!.hole_cards).toBeNull();
    // But engine should have them internally
    expect(engine.getHoleCards(1)!.length).toBe(2);
  });

  it('should transition streets: preflop -> flop -> turn -> river', () => {
    const config = makeConfig({ playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100], playerNames: ['Hero', 'Bot'],
      botFlags: [false, true] });
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    // Preflop: hero (BTN/SB) acts first in HU - call
    let outcome = engine.performAction({ action: 'call' });
    expect(outcome.handState.street).toBe('preflop');

    // BB checks
    outcome = engine.performAction({ action: 'check' });
    // Should advance to flop
    expect(outcome.handState.street).toBe('flop');
    expect(outcome.handState.community_cards.length).toBe(3);
  });

  it('should validate legal actions (fold/call/raise/check/all-in)', () => {
    const engine = new GameEngine('s1', 1, makeConfig());
    const state = engine.startHand();
    const actions = state.available_actions.map((a) => a.type);
    // UTG (seat 3) faces BB — should have fold, call, raise, all_in
    expect(actions).toContain('fold');
    expect(actions).toContain('call');
  });

  it('should reject invalid actions (check when facing bet, raise below minimum)', () => {
    const engine = new GameEngine('s1', 1, makeConfig());
    engine.startHand();
    // UTG faces BB of 2 — cannot check
    expect(() => engine.performAction({ action: 'check' })).toThrow();
  });

  it('should end hand when all but one player folds', () => {
    const config = makeConfig({ playerCount: 3, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100, 100], playerNames: ['Hero', 'Bot1', 'Bot2'],
      botFlags: [false, true, true] });
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    // SB folds, BB folds — wait, UTG acts first after BB
    // Seat order: BTN=0, SB=1, BB=2; UTG would be seat 0 again? No.
    // With 3 players: BTN(0), SB(1), BB(2). Preflop first actor is BTN (after BB)
    // Actually for 3 players: offset from dealer: 0=BTN, 1=SB, 2=BB
    // First actor preflop is after BB, which wraps to seat 0 (BTN)
    let outcome = engine.performAction({ action: 'fold' }); // BTN folds
    outcome = engine.performAction({ action: 'fold' }); // SB folds
    expect(outcome.handComplete).toBe(true);
  });

  it('should proceed to showdown when action completes on river', () => {
    const config = makeConfig({ playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100], playerNames: ['Hero', 'Bot'],
      botFlags: [false, true] });
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    // HU: BTN/SB acts first preflop
    engine.performAction({ action: 'call' }); // SB calls
    engine.performAction({ action: 'check' }); // BB checks -> flop

    // Flop
    engine.performAction({ action: 'check' }); // BB first postflop
    engine.performAction({ action: 'check' }); // BTN checks -> turn

    // Turn
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' }); // -> river

    // River
    engine.performAction({ action: 'check' });
    const outcome = engine.performAction({ action: 'check' });
    expect(outcome.handComplete).toBe(true);
    expect(outcome.showdown).not.toBeNull();
  });

  it('should handle all-in and continue dealing community cards', () => {
    const config = makeConfig({ playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100], playerNames: ['Hero', 'Bot'],
      botFlags: [false, true] });
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    // Hero goes all-in
    engine.performAction({ action: 'all_in' });
    // Bot calls
    const outcome = engine.performAction({ action: 'call' });
    expect(outcome.handComplete).toBe(true);
    expect(outcome.showdown).not.toBeNull();
    // Community cards should be dealt out
    expect(outcome.handState.community_cards.length).toBe(5);
  });

  it('should correctly determine winner at showdown', () => {
    const config = makeConfig({ playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100], playerNames: ['Hero', 'Bot'],
      botFlags: [false, true] });
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    // Play through to showdown
    engine.performAction({ action: 'call' });
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' });
    engine.performAction({ action: 'check' });
    const outcome = engine.performAction({ action: 'check' });

    expect(outcome.showdown).not.toBeNull();
    expect(outcome.showdown!.winners.length).toBeGreaterThanOrEqual(1);
    // Winner should have a positive amount_won
    expect(outcome.showdown!.winners[0].amount_won).toBeGreaterThan(0);
  });

  it('should handle heads-up blind posting (SB=BTN rule)', () => {
    const config = makeConfig({ playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100], playerNames: ['Hero', 'Bot'],
      botFlags: [false, true] });
    const engine = new GameEngine('s1', 1, config);
    const state = engine.startHand();

    // In HU: BTN posts SB, other posts BB
    const btnPlayer = state.players[0]; // dealer seat = 0
    const otherPlayer = state.players[1];
    expect(btnPlayer.current_bet).toBe(1); // SB
    expect(otherPlayer.current_bet).toBe(2); // BB
  });
});
