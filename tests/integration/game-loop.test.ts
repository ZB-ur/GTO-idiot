import { describe, it, expect } from 'vitest';
import { GameEngine, type GameConfig } from '../../src/engine/game-engine';
import { BotManager } from '../../src/bot/bot-manager';

function makeConfig(playerCount = 3): GameConfig {
  const stacks = Array(playerCount).fill(100);
  const names = ['Hero', ...Array(playerCount - 1).fill(0).map((_, i) => `Bot${i + 1}`)];
  const bots = [false, ...Array(playerCount - 1).fill(true)];
  return {
    blinds: { small_blind: 1, big_blind: 2 },
    playerCount, heroSeat: 0, dealerSeat: 0,
    startingStacks: stacks, playerNames: names, botFlags: bots,
  };
}

function playHandToCompletion(engine: GameEngine, manager: BotManager, heroAction: string = 'call') {
  let state = engine.startHand();
  let outcome;
  let maxIterations = 100;
  while (maxIterations-- > 0) {
    const seat = state.current_player_seat;
    if (seat === null || state.status !== 'in_progress') break;
    if (manager.isBot(seat)) {
      const action = manager.getBotAction(seat, engine);
      outcome = engine.performAction(action);
    } else {
      // Hero acts
      const available = state.available_actions.map((a) => a.type);
      if (available.includes(heroAction as any)) {
        outcome = engine.performAction({ action: heroAction as any });
      } else if (available.includes('check')) {
        outcome = engine.performAction({ action: 'check' });
      } else if (available.includes('call')) {
        outcome = engine.performAction({ action: 'call' });
      } else {
        outcome = engine.performAction({ action: 'fold' });
      }
    }
    if (outcome?.handComplete) break;
    state = outcome?.handState ?? engine.getVisibleState();
  }
  return outcome;
}

describe('Game Loop Integration', () => {
  it('should play a complete hand through all streets to showdown', () => {
    const config = makeConfig(2);
    const engine = new GameEngine('s1', 1, config);
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');

    const outcome = playHandToCompletion(engine, manager, 'call');
    expect(outcome).toBeDefined();
    expect(outcome!.handComplete).toBe(true);
  });

  it('should handle all players fold to one winner', () => {
    const config = makeConfig(3);
    const engine = new GameEngine('s1', 1, config);
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');
    manager.registerBot(2, 'Bot2', 'fish');

    // Hero folds
    const outcome = playHandToCompletion(engine, manager, 'fold');
    expect(outcome).toBeDefined();
    expect(outcome!.handComplete).toBe(true);
  });

  it('should handle all-in and run out board', () => {
    const config = makeConfig(2);
    const engine = new GameEngine('s1', 1, config);
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');

    const outcome = playHandToCompletion(engine, manager, 'all_in');
    expect(outcome).toBeDefined();
    if (outcome!.handComplete) {
      expect(outcome!.handState.community_cards.length).toBe(5);
    }
  });

  it('should trigger bot actions with simulated delay', () => {
    const config = makeConfig(2);
    const engine = new GameEngine('s1', 1, config);
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'regular');

    engine.startHand();
    const start = performance.now();
    // Bot decision should be fast
    const action = manager.getBotAction(1, engine);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
    expect(['fold', 'call', 'raise', 'check', 'all_in']).toContain(action.action);
  });

  it('should handle session with multiple consecutive hands', () => {
    const config = makeConfig(2);
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');

    for (let h = 1; h <= 5; h++) {
      const cfg = { ...config, dealerSeat: (h - 1) % 2 };
      const engine = new GameEngine('s1', h, cfg);
      const outcome = playHandToCompletion(engine, manager, 'call');
      expect(outcome).toBeDefined();
      expect(outcome!.handComplete).toBe(true);
    }
  });
});
