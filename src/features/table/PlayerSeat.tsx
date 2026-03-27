import type { ReactNode } from 'react';

export interface PlayerSeatProps {
  seatIndex: number;
}

export function PlayerSeat({ seatIndex }: PlayerSeatProps): ReactNode {
  return <div>Seat {seatIndex}</div>;
}
