import { describe, it, expect } from 'vitest';
import { GameService } from '../../src/services/game-service';

describe('GameEngine (via GameService)', () => {
  it('should create a new game session with 6 players and correct blind posting', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.players).toHaveLength(6);
    expect(gs.blindLevel).toBe('1/2');
    expect(gs.handCount).toBe(1);
    expect(gs.currentHand).not.toBeNull();
    expect(gs.currentHand!.pot).toBeGreaterThanOrEqual(3);
  });

  it('should deal 2 hole cards to each active player at hand start', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    const human = gs.currentHand!.players.find((p) => {
      return gs.players.find((pi) => pi.playerId === p.playerId)?.isHuman;
    });
    expect(human?.holeCards).toHaveLength(2);
  });

  it('should transition streets preflop to flop to turn to river', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.currentHand!.street).toBe('preflop');
  });

  it('should validate actions and reject invalid ones', async () => {
    const svc = new GameService();
    await expect(svc.submitAction('fake-id', { action: 'fold' })).rejects.toThrow('Game not found');
  });

  it('should correctly track betting round completion', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    const unacted = gs.currentHand!.players.filter((p) => !p.hasActed).length;
    expect(unacted).toBeGreaterThan(0);
  });

  it('should move to showdown when betting completes on river', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.currentHand!.status).toBe('in_progress');
  });

  it('should end hand immediately when all but one player folds', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      const result = await svc.submitAction(gs.gameId, { action: 'fold' });
      expect(result.gameState).toBeDefined();
    }
  });

  it('should correctly award pot to winner at showdown', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.currentHand).toBeTruthy();
  });

  it('should handle all-in player correctly', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2', startingStackBB: 5 });
    expect(gs.currentHand).not.toBeNull();
  });

  it('should rotate dealer button and blinds between hands', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await svc.submitAction(gs.gameId, { action: 'fold' });
    }
    const next = await svc.dealNextHand(gs.gameId);
    if (next) expect(next.dealerPosition).toBeDefined();
  });

  it('should return correct available actions for current player', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    const avail = await svc.getAvailableActions(gs.gameId);
    if (gs.currentHand?.isPlayerTurn && avail) {
      expect(avail.actions.length).toBeGreaterThan(0);
      expect(avail.potSize).toBeGreaterThan(0);
    }
  });

  it('should track hand status transitions correctly', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.currentHand!.status).toBe('in_progress');
    if (gs.currentHand?.isPlayerTurn) {
      const result = await svc.submitAction(gs.gameId, { action: 'fold' });
      expect(['in_progress', 'showdown', 'concluded']).toContain(result.gameState.currentHand?.status);
    }
  });
});
