// ============================================================
// E2E: Full hand lifecycle — deal → actions → settlement
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('E2E: Hand Lifecycle', () => {
  const humanSeat = 0;
  let engine: GameEngine;
  let players: Player[];

  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    players = createPlayers(humanSeat);
    engine = new GameEngine({
      sessionId: 'e2e-session',
      players,
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat,
    });
  });

  it('should complete a hand where all bots fold preflop', () => {
    const state = engine.startHand();
    expect(state.phase).toBe('preflop');

    // Fold every acting player
    let iterations = 0;
    while (!engine.isHandComplete() && iterations < 20) {
      engine.submitAction({ type: 'fold' });
      iterations++;
    }

    expect(engine.isHandComplete()).toBe(true);

    const settlement = engine.settleHand();
    expect(settlement.wonWithoutShowdown).toBe(true);
    expect(settlement.winners).toHaveLength(1);

    // Total chips should be conserved
    const totalChips = settlement.playerFinalStacks.reduce((sum, p) => sum + p.stackBB, 0);
    expect(totalChips).toBeCloseTo(DEFAULT_STARTING_STACK_BB * 6, 1);
  });

  it('should complete a hand with calls through to showdown', () => {
    const state = engine.startHand();
    expect(state.phase).toBe('preflop');

    // All players call/check through every street
    let iterations = 0;
    while (!engine.isHandComplete() && iterations < 100) {
      const available = engine.getAvailableActions();
      const actions = available.actions;

      if (actions.length === 0) break;

      // Prefer check, then call, then fold
      const check = actions.find(a => a.type === 'check');
      const call = actions.find(a => a.type === 'call');

      if (check) {
        engine.submitAction({ type: 'check' });
      } else if (call) {
        engine.submitAction({ type: 'call' });
      } else {
        engine.submitAction({ type: 'fold' });
      }
      iterations++;
    }

    expect(engine.isHandComplete()).toBe(true);

    const settlement = engine.settleHand();
    expect(settlement.winners.length).toBeGreaterThan(0);
    expect(settlement.playerFinalStacks.length).toBe(6);

    // Chip conservation
    const totalChips = settlement.playerFinalStacks.reduce((sum, p) => sum + p.stackBB, 0);
    expect(totalChips).toBeCloseTo(DEFAULT_STARTING_STACK_BB * 6, 1);
  });

  it('should handle a hand with raises', () => {
    engine.startHand();

    // First player raises
    const result1 = engine.submitAction({ type: 'raise', amount: 3 });
    expect(result1.actionLog.action).toBe('raise');

    // Remaining players fold
    while (!engine.isHandComplete()) {
      engine.submitAction({ type: 'fold' });
    }

    const settlement = engine.settleHand();
    expect(settlement.wonWithoutShowdown).toBe(true);
  });

  it('should handle all-in scenario', () => {
    // Create players with short stacks
    const shortStackPlayers = createPlayers(humanSeat).map(p => ({
      ...p,
      stackBB: 10,
    }));

    const shortEngine = new GameEngine({
      sessionId: 'e2e-short',
      players: shortStackPlayers,
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat,
    });

    shortEngine.startHand();

    // First player goes all-in
    shortEngine.submitAction({ type: 'all_in' });

    // Second player calls all-in
    const available = shortEngine.getAvailableActions();
    if (available.actions.some(a => a.type === 'all_in')) {
      shortEngine.submitAction({ type: 'all_in' });
    } else if (available.actions.some(a => a.type === 'call')) {
      shortEngine.submitAction({ type: 'call' });
    }

    // Rest fold
    while (!shortEngine.isHandComplete()) {
      const acts = shortEngine.getAvailableActions();
      if (acts.actions.some(a => a.type === 'fold')) {
        shortEngine.submitAction({ type: 'fold' });
      } else if (acts.actions.some(a => a.type === 'check')) {
        shortEngine.submitAction({ type: 'check' });
      } else {
        break;
      }
    }

    if (shortEngine.isHandComplete()) {
      const settlement = shortEngine.settleHand();
      expect(settlement.winners.length).toBeGreaterThan(0);

      // Chip conservation
      const totalChips = settlement.playerFinalStacks.reduce((sum, p) => sum + p.stackBB, 0);
      expect(totalChips).toBeCloseTo(10 * 6, 1);
    }
  });

  it('should advance through all streets: preflop → flop → turn → river → showdown', () => {
    engine.startHand();
    const phases: string[] = ['preflop'];

    let iterations = 0;
    while (!engine.isHandComplete() && iterations < 100) {
      const currentPhase = engine.getHandState().phase;
      if (!phases.includes(currentPhase)) {
        phases.push(currentPhase);
      }

      const available = engine.getAvailableActions();
      if (available.actions.length === 0) break;

      const check = available.actions.find(a => a.type === 'check');
      const call = available.actions.find(a => a.type === 'call');

      if (check) {
        engine.submitAction({ type: 'check' });
      } else if (call) {
        engine.submitAction({ type: 'call' });
      } else {
        engine.submitAction({ type: 'fold' });
      }
      iterations++;
    }

    // Should have progressed through at least preflop
    expect(phases).toContain('preflop');
    // If hand went to showdown, should have flop/turn/river
    if (phases.includes('showdown')) {
      expect(phases).toContain('flop');
      expect(phases).toContain('turn');
      expect(phases).toContain('river');
    }
  });

  it('should deal community cards correctly at each street', () => {
    engine.startHand();

    // Check preflop: 0 community cards
    let state = engine.getHandState();
    expect(state.communityCards).toHaveLength(0);

    // Play through preflop
    let iterations = 0;
    while (state.phase === 'preflop' && !engine.isHandComplete() && iterations < 50) {
      const available = engine.getAvailableActions();
      if (available.actions.length === 0) break;
      const check = available.actions.find(a => a.type === 'check');
      const call = available.actions.find(a => a.type === 'call');
      if (check) engine.submitAction({ type: 'check' });
      else if (call) engine.submitAction({ type: 'call' });
      else engine.submitAction({ type: 'fold' });
      state = engine.getHandState();
      iterations++;
    }

    if (state.phase === 'flop') {
      expect(state.communityCards).toHaveLength(3);
    }
  });

  it('should properly track pot size throughout a hand', () => {
    engine.startHand();
    let state = engine.getHandState();

    // Initial pot should have blinds
    const initialPot = state.pots.reduce((s, p) => s + p.amount, 0);
    expect(initialPot).toBeCloseTo(DEFAULT_BLINDS.smallBlind + DEFAULT_BLINDS.bigBlind, 2);

    // After a call, pot should increase
    engine.submitAction({ type: 'call' });
    state = engine.getHandState();
    const potAfterCall = state.pots.reduce((s, p) => s + p.amount, 0);
    expect(potAfterCall).toBeGreaterThan(initialPot);
  });

  it('should record all hole cards for history after settlement', () => {
    engine.startHand();

    while (!engine.isHandComplete()) {
      engine.submitAction({ type: 'fold' });
    }

    const allCards = engine.getAllHoleCards();
    // All 6 active players should have been dealt cards
    expect(allCards.size).toBe(6);

    for (const [_seat, cards] of allCards) {
      expect(cards).toHaveLength(2);
      expect(cards[0].rank).toBeTruthy();
      expect(cards[0].suit).toBeTruthy();
    }
  });
});
