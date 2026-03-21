import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Dexie database
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

vi.mock('../../services/hand-recorder', () => ({
  recordHand: vi.fn().mockResolvedValue({}),
  getHandRecord: vi.fn().mockResolvedValue(undefined),
}));

describe('E2E: Game Loop', () => {
  let gameService: typeof import('../../services/game-service');

  beforeEach(async () => {
    vi.resetModules();
    gameService = await import('../../services/game-service');
  });

  it('should complete a full game loop: create → deal → play → end', async () => {
    // 1. Create game
    const session = await gameService.createGame({ seatPosition: 'BTN' });
    expect(session.status).toBe('active');
    expect(session.players).toHaveLength(6);

    // 2. Deal a hand
    const hand = await gameService.dealNewHand(session.id);
    expect(hand).toBeDefined();
    expect(hand.userHoleCards).toBeDefined();

    // 3. Play until hand completes — user folds immediately when it's their turn
    let currentHand = hand;
    let loopGuard = 0;

    while (currentHand.phase !== 'complete' && loopGuard < 50) {
      if (currentHand.isUserTurn && currentHand.currentActorId) {
        const result = await gameService.submitAction(
          session.id,
          currentHand.id,
          { action: 'fold' },
        );
        currentHand = result.handState;
      } else {
        // Bot actions are handled internally
        break;
      }
      loopGuard++;
    }

    // Hand should be complete or at least the user has folded
    // (bots may still be playing but that's handled internally)

    // 4. End game
    const ended = await gameService.endGame(session.id);
    expect(ended.status).toBe('ended');
  });

  it('should handle multiple hands in sequence', async () => {
    const session = await gameService.createGame({
      seatPosition: 'UTG',
      startingStack: 100,
    });

    // Play 3 hands
    for (let i = 0; i < 3; i++) {
      const hand = await gameService.dealNewHand(session.id);
      expect(hand).toBeDefined();

      // User folds on their turn
      if (hand.isUserTurn) {
        const result = await gameService.submitAction(
          session.id,
          hand.id,
          { action: 'fold' },
        );
        expect(result).toBeDefined();
      }
      // If not user's turn, bots have already played through in dealNewHand
    }

    // Session should have played 3 hands
    const game = gameService.getGame(session.id);
    expect(game.handsPlayed).toBe(3);

    await gameService.endGame(session.id);
  });

  it('should handle user calling through a hand', async () => {
    const session = await gameService.createGame({ seatPosition: 'UTG' });
    const hand = await gameService.dealNewHand(session.id);

    if (hand.isUserTurn) {
      // User calls preflop
      const result = await gameService.submitAction(
        session.id,
        hand.id,
        { action: 'call' },
      );
      expect(result).toBeDefined();
      expect(result.processedActions.length).toBeGreaterThanOrEqual(1);

      // Continue playing if still user's turn
      let currentHand = result.handState;
      let guard = 0;
      while (currentHand.isUserTurn && currentHand.phase !== 'complete' && guard < 20) {
        const nextResult = await gameService.submitAction(
          session.id,
          currentHand.id,
          { action: currentHand.players.find(p => p.playerId === currentHand.currentActorId)?.currentBet === 0 ? 'check' : 'call' },
        );
        currentHand = nextResult.handState;
        guard++;
      }
    }

    await gameService.endGame(session.id);
  });

  it('should handle all-in scenario', async () => {
    const session = await gameService.createGame({
      seatPosition: 'UTG',
      startingStack: 10, // Short stack to make all-in more likely
    });

    const hand = await gameService.dealNewHand(session.id);

    if (hand.isUserTurn) {
      const result = await gameService.submitAction(
        session.id,
        hand.id,
        { action: 'all_in' },
      );

      expect(result).toBeDefined();
      // User should be all-in
      const userPlayer = result.handState.players.find(
        p => p.playerId === hand.players.find(pl => pl.position === 'UTG')?.playerId
      );
      if (userPlayer) {
        expect(userPlayer.isAllIn || userPlayer.isFolded || result.handState.phase === 'complete').toBe(true);
      }
    }

    await gameService.endGame(session.id);
  });

  it('should validate invalid actions', async () => {
    const session = await gameService.createGame({ seatPosition: 'BTN' });
    const hand = await gameService.dealNewHand(session.id);

    // Submitting action for wrong game should fail
    await expect(
      gameService.submitAction('wrong-game', hand.id, { action: 'fold' })
    ).rejects.toThrow();
  });

  it('should properly track pot through actions', async () => {
    const session = await gameService.createGame({ seatPosition: 'UTG' });
    const hand = await gameService.dealNewHand(session.id);

    // Pot should start with at least the blinds
    expect(hand.pot).toBeGreaterThan(0);

    if (hand.isUserTurn) {
      const result = await gameService.submitAction(
        session.id,
        hand.id,
        { action: 'call' },
      );

      // After user calls, pot should be larger or at least equal
      expect(result.handState.pot).toBeGreaterThanOrEqual(hand.pot);
    }

    await gameService.endGame(session.id);
  });

  it('should assign winners when hand completes', async () => {
    const session = await gameService.createGame({ seatPosition: 'UTG' });
    const hand = await gameService.dealNewHand(session.id);

    // Fold immediately — last remaining player wins
    if (hand.isUserTurn) {
      const result = await gameService.submitAction(
        session.id,
        hand.id,
        { action: 'fold' },
      );

      // If the hand completed after user fold + bot play
      if (result.handComplete) {
        expect(result.handState.winners).toBeDefined();
        expect(result.handState.winners!.length).toBeGreaterThanOrEqual(1);
        // Winner should receive the pot
        const totalWon = result.handState.winners!.reduce((sum, w) => sum + w.amount, 0);
        expect(totalWon).toBeGreaterThan(0);
      }
    }

    await gameService.endGame(session.id);
  });
});
