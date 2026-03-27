import type { ReactNode } from 'react';
import { PlayerSeat } from './PlayerSeat';

export function SeatLayout(): ReactNode {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <PlayerSeat key={i} seatIndex={i} />
      ))}
    </div>
  );
}
