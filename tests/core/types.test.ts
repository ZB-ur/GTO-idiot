import { describe, it, expect } from 'vitest';
import type { Rank, Suit, Position, Street, ActionType, HandRank, BotStyle, Card, GameState, HandState } from '../../src/types';

describe('Types', () => {
  it('should define all Card rank and suit combinations', () => {
    const ranks: Rank[] = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    const suits: Suit[] = ['s','h','d','c'];
    expect(ranks).toHaveLength(13);
    expect(suits).toHaveLength(4);
    const cards: Card[] = [];
    for (const r of ranks) for (const s of suits) cards.push({ rank: r, suit: s });
    expect(cards).toHaveLength(52);
  });

  it('should define all Position values for 6-max', () => {
    const positions: Position[] = ['UTG','HJ','CO','BTN','SB','BB'];
    expect(positions).toHaveLength(6);
  });

  it('should define all Street ActionType HandRank BotStyle enums', () => {
    const streets: Street[] = ['preflop','flop','turn','river'];
    expect(streets).toHaveLength(4);
    const actions: ActionType[] = ['fold','check','call','raise','all_in'];
    expect(actions).toHaveLength(5);
    const handRanks: HandRank[] = ['high_card','one_pair','two_pair','three_of_a_kind','straight','flush','full_house','four_of_a_kind','straight_flush','royal_flush'];
    expect(handRanks).toHaveLength(10);
    const styles: BotStyle[] = ['TAG','LAG','Fish','Nit','Maniac'];
    expect(styles).toHaveLength(5);
  });

  it('should enforce GameState and HandState shape via type checks', () => {
    const gs: GameState = { gameId:'t', blindLevel:'1/2', speed:'normal', players:[], currentHand:null, handCount:0, sessionProfit:0 };
    expect(gs.gameId).toBe('t');
    const hs: HandState = { handId:'h1', street:'preflop', pot:3, communityCards:[], dealerPosition:'BTN', activePlayerId:null, players:[], status:'in_progress' };
    expect(hs.status).toBe('in_progress');
  });
});
