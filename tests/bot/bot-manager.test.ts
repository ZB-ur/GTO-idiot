import { describe, it, expect } from 'vitest';
import { BotManager } from '../../src/bot/bot-manager';
import { GameEngine, type GameConfig } from '../../src/engine/game-engine';

describe('BotManager', () => {
  it('should create bots with specified difficulty levels', () => {
    const manager = new BotManager();
    manager.registerBot(1, 'FishBot', 'fish');
    manager.registerBot(2, 'RegBot', 'regular');
    manager.registerBot(3, 'GTOBot', 'gto');

    expect(manager.getBot(1)!.difficulty).toBe('fish');
    expect(manager.getBot(2)!.difficulty).toBe('regular');
    expect(manager.getBot(3)!.difficulty).toBe('gto');
  });

  it('should assign unique seats to bots', () => {
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');
    manager.registerBot(2, 'Bot2', 'regular');
    manager.registerBot(3, 'Bot3', 'gto');

    const seats = manager.getBotSeats();
    expect(seats.length).toBe(3);
    expect(new Set(seats).size).toBe(3);
  });

  it('should trigger bot action and return result', () => {
    const config: GameConfig = {
      blinds: { small_blind: 1, big_blind: 2 },
      playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100],
      playerNames: ['Hero', 'FishBot'],
      botFlags: [false, true],
    };
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();

    const manager = new BotManager();
    manager.registerBot(1, 'FishBot', 'fish');

    const action = manager.getBotAction(1, engine);
    expect(['fold', 'call', 'raise', 'check', 'all_in']).toContain(action.action);
  });

  it('should throw for unregistered bot seat', () => {
    const manager = new BotManager();
    const config: GameConfig = {
      blinds: { small_blind: 1, big_blind: 2 },
      playerCount: 2, heroSeat: 0, dealerSeat: 0,
      startingStacks: [100, 100],
      playerNames: ['Hero', 'Bot'],
      botFlags: [false, true],
    };
    const engine = new GameEngine('s1', 1, config);
    engine.startHand();
    expect(() => manager.getBotAction(5, engine)).toThrow(/No bot registered/);
  });

  it('should correctly identify bots', () => {
    const manager = new BotManager();
    manager.registerBot(1, 'Bot1', 'fish');
    expect(manager.isBot(1)).toBe(true);
    expect(manager.isBot(0)).toBe(false);
  });
});
