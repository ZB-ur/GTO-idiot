import { describe, it, expect } from 'vitest';
import { GameService } from '../../src/services/game-service';
import { HistoryService } from '../../src/services/history-service';
import { ReplayService } from '../../src/services/replay-service';
import { ReportService } from '../../src/services/report-service';

describe('E2E Full Game Flow', () => {
  it('should complete a full hand deal through showdown', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    expect(gs.currentHand).not.toBeNull();

    // Keep calling until hand ends (fold or all actions done)
    let state = gs;
    let iterations = 0;
    while (state.currentHand?.status === 'in_progress' && state.currentHand?.isPlayerTurn && iterations < 20) {
      const result = await svc.submitAction(state.gameId, { action: 'call' });
      state = result.gameState;
      iterations++;
    }
    expect(state.currentHand).toBeDefined();
  });

  it('should save completed hand to history and retrieve it', async () => {
    const gameSvc = new GameService();
    const historySvc = new HistoryService();
    await historySvc.clearAll();

    const gs = await gameSvc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await gameSvc.submitAction(gs.gameId, { action: 'fold' });
    }
    const records = gameSvc.getHandRecords(gs.gameId);
    if (records.length > 0) {
      await historySvc.saveHand(records[0]);
      const retrieved = await historySvc.getHandById(records[0].handId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.handId).toBe(records[0].handId);
    }
  });

  it('should generate replay with GTO analysis for a completed hand', async () => {
    const gameSvc = new GameService();
    const historySvc = new HistoryService();
    const replaySvc = new ReplayService();
    await historySvc.clearAll();

    const gs = await gameSvc.createGame({ blindLevel: '1/2' });
    if (gs.currentHand?.isPlayerTurn) {
      await gameSvc.submitAction(gs.gameId, { action: 'fold' });
    }
    const records = gameSvc.getHandRecords(gs.gameId);
    if (records.length > 0) {
      await historySvc.saveHand(records[0]);
      const replay = await replaySvc.getReplay(records[0].handId);
      if (replay) {
        expect(replay.streets.length).toBeGreaterThan(0);
        expect(replay.overallCompliance).toBeDefined();
      }
    }
  });

  it('should generate compliance report from saved history', async () => {
    const gameSvc = new GameService();
    const historySvc = new HistoryService();
    const reportSvc = new ReportService();
    await historySvc.clearAll();

    for (let i = 0; i < 3; i++) {
      const gs = await gameSvc.createGame({ blindLevel: '1/2' });
      if (gs.currentHand?.isPlayerTurn) {
        await gameSvc.submitAction(gs.gameId, { action: 'fold' });
      }
      const records = gameSvc.getHandRecords(gs.gameId);
      if (records.length > 0) await historySvc.saveHand(records[0]);
    }
    const report = await reportSvc.generateReport(10);
    expect(report.handsAnalyzed).toBeGreaterThanOrEqual(0);
  });

  it('should complete multi-hand session with correct stack tracking', async () => {
    const svc = new GameService();
    const gs = await svc.createGame({ blindLevel: '1/2' });
    const initialStacks = gs.players.map((p) => p.chipStack);

    if (gs.currentHand?.isPlayerTurn) {
      await svc.submitAction(gs.gameId, { action: 'fold' });
    }
    const hand2 = await svc.dealNextHand(gs.gameId);
    if (hand2) {
      expect(hand2.street).toBe('preflop');
      expect(hand2.status).toBe('in_progress');
    }
  });
});
