export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in' | 'post_sb' | 'post_bb';

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type GtoRating = 'green' | 'yellow' | 'red' | 'gray';

export type BotStyle = 'TAG' | 'LAG' | 'Nit' | 'Fish' | 'GTO';

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
