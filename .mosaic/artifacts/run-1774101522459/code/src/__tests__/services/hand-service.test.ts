// ============================================================
// Hand Service tests — hand lifecycle orchestration
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../engine/game-engine';
import {
  getEngine,
  setEngine,
  removeEngine,
} from '../../services/hand-service';
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

describe('Hand Service - engine registry', () => {
  const sessionId = 'test-session-1';

  beforeEach(() => {
    removeEngine(sessionId);
  });

  it('should register and retrieve an engine', () => {
    const engine = new GameEngine({
      sessionId,
      players: createPlayers(),
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat: 0,
    });

    setEngine(sessionId, engine);
    expect(getEngine(sessionId)).toBe(engine);
  });

  it('should return undefined for unregistered session', () => {
    expect(getEngine('nonexistent')).toBeUndefined();
  });

  it('should remove engine', () => {
    const engine = new GameEngine({
      sessionId,
      players: createPlayers(),
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat: 0,
    });

    setEngine(sessionId, engine);
    removeEngine(sessionId);
    expect(getEngine(sessionId)).toBeUndefined();
  });
});

describe('Hand Service - GameEngine integration via service', () => {
  let engine: GameEngine;
  const sessionId = 'test-session-2';

  beforeEach(() => {
    engine = new GameEngine({
      sessionId,
      players: createPlayers(),
      blinds: DEFAULT_BLINDS,
      dealerSeat: 0,
      humanSeat: 0,
    });
    setEngine(sessionId, engine);
  });

  it('should start a hand through engine', () => {
    const state = engine.startHand();

    expect(state.phase).toBe('preflop');
    expect(state.players).toHaveLength(6);
    expect(state.userHoleCards).toHaveLength(2);
  });

  it('should process actions and track state', () => {
    engine.startHand();

    const result = engine.submitAction({ type: 'fold' });
    expect(result.actionLog).toBeDefined();
    expect(result.actionLog.action).toBe('fold');
  });

  it('should settle hand after all fold', () => {
    engine.startHand();

    // Fold all until one remains
    while (!engine.isHandComplete()) {
      engine.submitAction({ type: 'fold' });
    }

    const settlement = engine.settleHand();
    expect(settlement.wonWithoutShowdown).toBe(true);
    expect(settlement.winners).toHaveLength(1);
  });

  it('should track action log across multiple actions', () => {
    engine.startHand();

    engine.submitAction({ type: 'call' });
    engine.submitAction({ type: 'call' });

    const log = engine.getActionLog();
    expect(log).toHaveLength(2);
    expect(log[0].street).toBe('preflop');
    expect(log[1].street).toBe('preflop');
  });

  it('should report correct hand completion status', () => {
    engine.startHand();
    expect(engine.isHandComplete()).toBe(false);

    while (!engine.isHandComplete()) {
      engine.submitAction({ type: 'fold' });
    }

    expect(engine.isHandComplete()).toBe(true);
  });
});
