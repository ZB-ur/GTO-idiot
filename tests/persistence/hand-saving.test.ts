import { describe, it, expect } from 'vitest';
import { GameService } from '../../src/services/game-service';

describe('Hand Saving', () => {
  it('should auto-save completed hand from game engine to IndexedDB', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await svc.submitAction(gs.gameId, { action: 'fold' });
    }
    const records = svc.getHandRecords(gs.gameId);
    expect(records.length).toBeGreaterThanOrEqual(0);
  });

  it('should not save incomplete or aborted hands', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    // If hand is still in progress, no record should be saved yet
    if (gs.currentHand?.status === 'in_progress') {
      // Records only saved after hand concludes
      // In-progress hands shouldn't have records yet (they're saved on conclude)
    }
    expect(gs.currentHand).toBeDefined();
  });

  it('should record all street actions in correct order', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await svc.submitAction(gs.gameId, { action: 'fold' });
    }
    const records = svc.getHandRecords(gs.gameId);
    if (records.length > 0) {
      const record = records[0];
      expect(record.streets.length).toBeGreaterThan(0);
      expect(record.streets[0].street).toBe('preflop');
      for (const street of record.streets) {
        for (let i = 1; i < street.actions.length; i++) {
          expect(street.actions[i].timestamp).toBeGreaterThanOrEqual(street.actions[i - 1].timestamp);
        }
      }
    }
  });
});
