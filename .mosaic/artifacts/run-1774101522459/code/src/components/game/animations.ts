// ============================================================
// Animations — CSS class helpers and timing constants for game UI
// ============================================================

/** Animation duration constants (ms) */
export const TIMING = {
  DEAL_CARD: 300,
  FLIP_CARD: 400,
  CHIP_MOVE: 500,
  FADE_IN: 200,
  BOT_THINK: 800,
  STREET_TRANSITION: 600,
  SETTLE_DELAY: 1200,
  WINNER_HIGHLIGHT: 2000,
} as const;

/** Card deal animation with staggered delay per card index */
export function dealCardStyle(index: number): React.CSSProperties {
  return {
    animationDelay: `${index * 100}ms`,
    animationFillMode: 'both',
  };
}

/** Chip movement from a seat position toward the pot center */
export function chipMoveStyle(
  fromX: number,
  fromY: number
): React.CSSProperties {
  return {
    '--from-x': `${fromX}px`,
    '--from-y': `${fromY}px`,
  } as React.CSSProperties;
}

/**
 * Build a className string for animating card entrance.
 * Returns Tailwind animation class + opacity transitions.
 */
export function cardEnterClass(animate: boolean): string {
  if (!animate) return 'opacity-100';
  return 'animate-deal opacity-100';
}

/**
 * Build a className string for card flip (reveal).
 */
export function cardFlipClass(animate: boolean): string {
  if (!animate) return '';
  return 'animate-flip';
}

/**
 * Build a className for fade-in entrance.
 */
export function fadeInClass(animate: boolean): string {
  if (!animate) return 'opacity-100';
  return 'animate-fade-in';
}

/**
 * Get the stagger delay for dealing to a specific seat.
 * Seats are dealt clockwise from dealer + 1.
 */
export function seatDealDelay(
  seatIndex: number,
  dealerSeat: number,
  totalSeats: number
): number {
  const offset = (seatIndex - dealerSeat - 1 + totalSeats) % totalSeats;
  return offset * 120; // 120ms between each seat
}

/**
 * Winner pulse animation inline style.
 */
export function winnerPulseStyle(): React.CSSProperties {
  return {
    animation: `pulse 1s ease-in-out 3`,
    boxShadow: '0 0 20px rgba(234, 179, 8, 0.6)',
  };
}
