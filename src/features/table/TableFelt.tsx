import type { ReactNode } from 'react';
import { SeatLayout } from './SeatLayout';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';

export function TableFelt(): ReactNode {
  return (
    <div>
      <SeatLayout />
      <CommunityCards cards={[]} />
      <PotDisplay amount={0} />
    </div>
  );
}
