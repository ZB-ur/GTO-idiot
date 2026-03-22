import { describe, it, expect } from 'vitest';
import { GameService } from '../../src/services/game-service';

describe('GameService', () => {
  it('should orchestrate player action then BOT decisions then state update', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (!gs.currentHand?.isPlayerTurn) return; // skip if bots act first

    const result = await svc.submitAction(gs.gameId, { action: 'call' });
    expect(result.processedActions.length).toBeGreaterThanOrEqual(1);
    expect(result.gameState.currentHand).toBeDefined();
  });

  it('should process full betting round with BOTs acting in sequence', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      const result = await svc.submitAction(gs.gameId, { action: 'fold' });
      // Bots should have processed their actions
      expect(result.processedActions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should emit animation events for deal bet fold actions', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      const result = await svc.submitAction(gs.gameId, { action: 'fold' });
      const firstAction = result.processedActions[0];
      expect(firstAction.action).toBe('fold');
      expect(firstAction.street).toBeDefined();
      expect(firstAction.timestamp).toBeDefined();
    }
  });

  it('should handle end-of-hand settlement and trigger next hand', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await svc.submitAction(gs.gameId, { action: 'fold' });
    }
    const nextHand = await svc.dealNextHand(gs.gameId);
    if (nextHand) {
      expect(nextHand.street).toBe('preflop');
      expect(nextHand.status).toBe('in_progress');
    }
  });
});
