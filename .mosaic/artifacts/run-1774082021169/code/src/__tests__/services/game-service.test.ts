import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CreateGameRequest } from '../../types/game';

// Mock the Dexie database before importing game-service
vi.mock('../../services/db', () => {
  const mockTable = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
  };
  return {
    db: {
      hands: { ...mockTable },
      sessions: { ...mockTable },
      settings: { ...mockTable },
    },
    DEFAULT_SETTINGS: {
      id: 'default',
      defaultSeatPosition: 'BTN',
      defaultStartingStack: 100,
      animationSpeed: 'normal',
      botActionDelay: { min: 500, max: 1500 },
    },
  };
});

// Mock hand-recorder to avoid DB calls
vi.mock('../../services/hand-recorder', () => ({
  recordHand: vi.fn().mockResolvedValue({}),
  getHandRecord: vi.fn().mockResolvedValue(undefined),
}));

describe('GameService', () => {
  let gameService: typeof import('../../services/game-service');

  beforeEach(async () => {
    vi.resetModules();
    gameService = await import('../../services/game-service');
  });

  describe('createGame', () => {
    it('should create a game session with 6 players', async () => {
      const request: CreateGameRequest = { seatPosition: 'BTN' };
      const session = await gameService.createGame(request);

      expect(session).toBeDefined();
      expect(session.status).toBe('active');
      expect(session.players).toHaveLength(6);
      expect(session.seatPosition).toBe('BTN');
    });

    it('should have exactly one user player', async () => {
      const session = await gameService.createGame({ seatPosition: 'CO' });
      const userPlayers = session.players.filter(p => p.isUser);
      expect(userPlayers).toHaveLength(1);
      expect(userPlayers[0]!.position).toBe('CO');
    });

    it('should have 5 bot players', async () => {
      const session = await gameService.createGame({ seatPosition: 'UTG' });
      const bots = session.players.filter(p => !p.isUser);
      expect(bots).toHaveLength(5);
    });

    it('should use default starting stack of 100', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      for (const player of session.players) {
        expect(player.stack).toBe(100);
      }
    });

    it('should use custom starting stack', async () => {
      const session = await gameService.createGame({
        seatPosition: 'BTN',
        startingStack: 200,
      });
      for (const player of session.players) {
        expect(player.stack).toBe(200);
      }
    });

    it('should use default blind size', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      expect(session.blindSize.smallBlind).toBe(0.5);
      expect(session.blindSize.bigBlind).toBe(1);
    });

    it('should use custom blind size', async () => {
      const session = await gameService.createGame({
        seatPosition: 'BTN',
        blindSize: { smallBlind: 1, bigBlind: 2 },
      });
      expect(session.blindSize.smallBlind).toBe(1);
      expect(session.blindSize.bigBlind).toBe(2);
    });

    it('should start with 0 hands played', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      expect(session.handsPlayed).toBe(0);
      expect(session.currentHandId).toBeNull();
    });

    it('should throw if a game is already active', async () => {
      await gameService.createGame({ seatPosition: 'BTN' });
      await expect(
        gameService.createGame({ seatPosition: 'CO' })
      ).rejects.toThrow('already active');
    });
  });

  describe('getGame', () => {
    it('should return the active game', async () => {
      const created = await gameService.createGame({ seatPosition: 'BTN' });
      const fetched = gameService.getGame(created.id);
      expect(fetched.id).toBe(created.id);
    });

    it('should throw for unknown game ID', () => {
      expect(() => gameService.getGame('unknown-id')).toThrow('not found');
    });
  });

  describe('endGame', () => {
    it('should end the game session', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      const ended = await gameService.endGame(session.id);
      expect(ended.status).toBe('ended');
    });

    it('should allow creating a new game after ending', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      await gameService.endGame(session.id);
      const newSession = await gameService.createGame({ seatPosition: 'CO' });
      expect(newSession.status).toBe('active');
    });
  });

  describe('dealNewHand', () => {
    it('should deal a new hand', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      const hand = await gameService.dealNewHand(session.id);

      expect(hand).toBeDefined();
      expect(hand.phase).not.toBe('waiting');
      expect(hand.gameId).toBe(session.id);
    });

    it('should have user hole cards', async () => {
      const session = await gameService.createGame({ seatPosition: 'BTN' });
      const hand = await gameService.dealNewHand(session.id);
      expect(hand.userHoleCards).toBeDefined();
    });

    it('should throw for unknown game', async () => {
      await expect(gameService.dealNewHand('unknown')).rejects.toThrow('not found');
    });
  });

  describe('submitAction', () => {
    it('should process a fold action', async () => {
      const session = await gameService.createGame({ seatPosition: 'UTG' });
      const hand = await gameService.dealNewHand(session.id);

      // Only submit if it's the user's turn
      if (hand.isUserTurn) {
        const result = await gameService.submitAction(session.id, hand.id, { action: 'fold' });
        expect(result).toBeDefined();
        expect(result.processedActions.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should throw when not users turn', async () => {
      const session = await gameService.createGame({ seatPosition: 'BB' });
      const hand = await gameService.dealNewHand(session.id);

      // If it's not user's turn initially, should throw
      if (!hand.isUserTurn) {
        await expect(
          gameService.submitAction(session.id, hand.id, { action: 'fold' })
        ).rejects.toThrow();
      }
    });
  });
});
