import type {
  HandRecord,
  HandHistoryPage,
  HandHistorySummary,
  OverallStats,
  HistoryFilter,
  HandOutcome,
  Street,
  ActionType,
} from '../types';
import { getDB } from '../db';

function deriveOutcome(record: HandRecord): HandOutcome {
  const humanPlayer = record.players.find((p) => p.isHuman);
  if (!humanPlayer) return 'lost';

  const profit = record.result.playerProfit;
  const playerFolded = record.streets.some((s) =>
    s.actions.some(
      (a) => a.playerId === humanPlayer.playerId && a.action === 'fold'
    )
  );

  if (playerFolded) return 'folded';
  if (profit === 0) return 'split';
  return profit > 0 ? 'won' : 'lost';
}

function deriveFinalStreet(record: HandRecord): Street {
  if (record.streets.length === 0) return 'preflop';
  return record.streets[record.streets.length - 1].street;
}

function toSummary(record: HandRecord): HandHistorySummary {
  const humanPlayer = record.players.find((p) => p.isHuman);
  return {
    handId: record.handId,
    playedAt: record.playedAt,
    blindLevel: record.blindLevel,
    playerPosition: humanPlayer?.position ?? 'BB',
    holeCards: humanPlayer?.holeCards ?? [],
    profit: record.result.playerProfit,
    result: deriveOutcome(record),
    finalStreet: deriveFinalStreet(record),
  };
}

export class HistoryService {
  async saveHand(record: HandRecord): Promise<void> {
    const db = await getDB();
    await db.put('hands', record);
  }

  async getHands(
    filter: HistoryFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<HandHistoryPage> {
    const db = await getDB();
    let allRecords = await db.getAll('hands');

    // Apply filters
    if (filter.dateFrom) {
      allRecords = allRecords.filter((r) => r.playedAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      allRecords = allRecords.filter((r) => r.playedAt <= filter.dateTo!);
    }
    if (filter.blindLevel) {
      allRecords = allRecords.filter(
        (r) => r.blindLevel === filter.blindLevel
      );
    }
    if (filter.profitFilter && filter.profitFilter !== 'all') {
      if (filter.profitFilter === 'profit') {
        allRecords = allRecords.filter((r) => r.result.playerProfit > 0);
      } else {
        allRecords = allRecords.filter((r) => r.result.playerProfit < 0);
      }
    }

    // Sort
    const sortBy = filter.sortBy ?? 'date_desc';
    allRecords.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return a.playedAt.localeCompare(b.playedAt);
        case 'date_desc':
          return b.playedAt.localeCompare(a.playedAt);
        case 'profit_asc':
          return a.result.playerProfit - b.result.playerProfit;
        case 'profit_desc':
          return b.result.playerProfit - a.result.playerProfit;
        default:
          return b.playedAt.localeCompare(a.playedAt);
      }
    });

    const total = allRecords.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paged = allRecords.slice(start, start + pageSize);

    return {
      items: paged.map(toSummary),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getHandById(handId: string): Promise<HandRecord | null> {
    const db = await getDB();
    const record = await db.get('hands', handId);
    return record ?? null;
  }

  async getStats(filter?: HistoryFilter): Promise<OverallStats> {
    const db = await getDB();
    let allRecords = await db.getAll('hands');

    if (filter) {
      if (filter.dateFrom) {
        allRecords = allRecords.filter((r) => r.playedAt >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        allRecords = allRecords.filter((r) => r.playedAt <= filter.dateTo!);
      }
      if (filter.blindLevel) {
        allRecords = allRecords.filter(
          (r) => r.blindLevel === filter.blindLevel
        );
      }
    }

    const totalHands = allRecords.length;
    if (totalHands === 0) {
      return { totalHands: 0, totalProfit: 0, avgProfitPerHand: 0 };
    }

    const totalProfit = allRecords.reduce(
      (sum, r) => sum + r.result.playerProfit,
      0
    );
    const avgProfitPerHand = totalProfit / totalHands;

    // Calculate win rate in BB/100
    const bbSizes: Record<string, number> = {
      '1/2': 2,
      '2/5': 5,
      '5/10': 10,
    };
    const totalBBProfit = allRecords.reduce((sum, r) => {
      const bb = bbSizes[r.blindLevel] ?? 2;
      return sum + r.result.playerProfit / bb;
    }, 0);
    const winRate = totalHands > 0 ? (totalBBProfit / totalHands) * 100 : 0;

    // Calculate VPIP and PFR
    let vpipHands = 0;
    let pfrHands = 0;
    const voluntaryActions: ActionType[] = ['call', 'raise', 'all_in'];
    const raiseActions: ActionType[] = ['raise', 'all_in'];

    for (const record of allRecords) {
      const humanPlayer = record.players.find((p) => p.isHuman);
      if (!humanPlayer) continue;

      const preflopStreet = record.streets.find((s) => s.street === 'preflop');
      if (!preflopStreet) continue;

      const playerActions = preflopStreet.actions.filter(
        (a) => a.playerId === humanPlayer.playerId
      );

      const hasVoluntaryAction = playerActions.some((a) =>
        voluntaryActions.includes(a.action)
      );
      if (hasVoluntaryAction) vpipHands++;

      const hasRaiseAction = playerActions.some((a) =>
        raiseActions.includes(a.action)
      );
      if (hasRaiseAction) pfrHands++;
    }

    return {
      totalHands,
      totalProfit: Math.round(totalProfit * 100) / 100,
      avgProfitPerHand: Math.round(avgProfitPerHand * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      vpip: totalHands > 0 ? Math.round((vpipHands / totalHands) * 10000) / 100 : 0,
      pfr: totalHands > 0 ? Math.round((pfrHands / totalHands) * 10000) / 100 : 0,
    };
  }

  async clearAll(): Promise<number> {
    const db = await getDB();
    const allKeys = await db.getAllKeys('hands');
    const count = allKeys.length;
    await db.clear('hands');
    return count;
  }
}

export const historyService = new HistoryService();
