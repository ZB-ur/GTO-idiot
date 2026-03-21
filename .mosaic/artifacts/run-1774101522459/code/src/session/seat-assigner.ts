// ============================================================
// Seat Assigner — Assigns human + BOT players to 6-max table
// ============================================================

import type { BotStyle, Player, Position } from '../types';
import { POSITIONS, MAX_PLAYERS, DEFAULT_STARTING_STACK_BB } from '../types';
import { generateBotName } from '../bot';

// ============================================================
// Types
// ============================================================

export interface SeatAssignment {
  players: Player[];
  humanSeat: number;
}

// ============================================================
// Bot style rotation — varied table composition
// ============================================================

const BOT_STYLE_POOL: BotStyle[] = ['TAG', 'LAG', 'TP', 'LP', 'GTO'];

/**
 * Pick bot styles for the table, ensuring variety.
 * Returns (count) bot styles from the pool.
 */
function pickBotStyles(count: number): BotStyle[] {
  const styles: BotStyle[] = [];
  for (let i = 0; i < count; i++) {
    styles.push(BOT_STYLE_POOL[i % BOT_STYLE_POOL.length]);
  }
  // Shuffle for variety
  for (let i = styles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [styles[i], styles[j]] = [styles[j], styles[i]];
  }
  return styles;
}

// ============================================================
// Position assignment
// ============================================================

/**
 * Map seat indices to positions based on dealer seat.
 * In 6-max: BTN, SB, BB, UTG, MP, CO
 * Position order clockwise from dealer: BTN(dealer), SB, BB, UTG, MP, CO
 */
function assignPositions(dealerSeat: number): Map<number, Position> {
  const positionMap = new Map<number, Position>();
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const seat = (dealerSeat + i) % MAX_PLAYERS;
    positionMap.set(seat, POSITIONS[i]);
  }
  return positionMap;
}

// ============================================================
// Public API
// ============================================================

/**
 * Assign seats for a new session.
 * @param seatPreference 'auto' for random seat, 'manual' for specified seat
 * @param selectedSeat Required when seatPreference is 'manual' (0-5)
 * @param dealerSeat The initial dealer button position (default random)
 */
export function assignSeats(
  seatPreference: 'auto' | 'manual',
  selectedSeat?: number,
  dealerSeat?: number,
): SeatAssignment {
  // Determine human seat
  let humanSeat: number;
  if (seatPreference === 'manual' && selectedSeat != null) {
    if (selectedSeat < 0 || selectedSeat >= MAX_PLAYERS) {
      throw new Error(`Invalid seat number: ${selectedSeat}. Must be 0-${MAX_PLAYERS - 1}`);
    }
    humanSeat = selectedSeat;
  } else {
    humanSeat = Math.floor(Math.random() * MAX_PLAYERS);
  }

  // Determine dealer
  const dealer = dealerSeat ?? Math.floor(Math.random() * MAX_PLAYERS);
  const positions = assignPositions(dealer);

  // Pick bot styles for the 5 bot seats
  const botStyles = pickBotStyles(MAX_PLAYERS - 1);
  let botIdx = 0;

  const players: Player[] = [];
  for (let seat = 0; seat < MAX_PLAYERS; seat++) {
    const position = positions.get(seat)!;

    if (seat === humanSeat) {
      players.push({
        seat,
        name: 'Hero',
        isHuman: true,
        botStyle: null,
        stackBB: DEFAULT_STARTING_STACK_BB,
        position,
        isActive: true,
        isSittingOut: false,
      });
    } else {
      const style = botStyles[botIdx++];
      players.push({
        seat,
        name: generateBotName(style, seat),
        isHuman: false,
        botStyle: style,
        stackBB: DEFAULT_STARTING_STACK_BB,
        position,
        isActive: true,
        isSittingOut: false,
      });
    }
  }

  return { players, humanSeat };
}
