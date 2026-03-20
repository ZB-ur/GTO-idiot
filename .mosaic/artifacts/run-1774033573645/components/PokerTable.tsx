import React from 'react';
import { PlayerSeat, Player, SeatPosition } from './PlayerSeat';
import { CommunityCards, Card } from './CommunityCards';
import { PotDisplay, SidePot } from './PotDisplay';

export interface PotInfo {
  mainPot: number;
  sidePots?: SidePot[];
}

export interface PokerTableProps {
  players: Player[];
  communityCards: Card[];
  pot: PotInfo;
  dealerSeatIndex: number;
  currentPlayerSeatIndex: number;
  thinkingSeatIndex?: number;
  showAllCards?: boolean;
}

/**
 * 6-seat elliptical poker table layout positions.
 * Seats are arranged clockwise:
 *   0 = bottom-left (human default)
 *   1 = mid-left
 *   2 = top-left
 *   3 = top-right
 *   4 = mid-right
 *   5 = bottom-right
 */
const SEAT_LAYOUT: { position: SeatPosition; style: React.CSSProperties }[] = [
  // Seat 0 — bottom-left
  {
    position: 'bottom-left',
    style: { position: 'absolute', bottom: '-40px', left: '15%', transform: 'translateX(-50%)' },
  },
  // Seat 1 — mid-left
  {
    position: 'mid-left',
    style: { position: 'absolute', top: '50%', left: '-60px', transform: 'translateY(-50%)' },
  },
  // Seat 2 — top-left
  {
    position: 'top-left',
    style: { position: 'absolute', top: '-40px', left: '15%', transform: 'translateX(-50%)' },
  },
  // Seat 3 — top-right
  {
    position: 'top-right',
    style: { position: 'absolute', top: '-40px', right: '15%', transform: 'translateX(50%)' },
  },
  // Seat 4 — mid-right
  {
    position: 'mid-right',
    style: { position: 'absolute', top: '50%', right: '-60px', transform: 'translateY(-50%)' },
  },
  // Seat 5 — bottom-right
  {
    position: 'bottom-right',
    style: { position: 'absolute', bottom: '-40px', right: '15%', transform: 'translateX(50%)' },
  },
];

export const PokerTable: React.FC<PokerTableProps> = ({
  players,
  communityCards,
  pot,
  dealerSeatIndex,
  currentPlayerSeatIndex,
  thinkingSeatIndex,
  showAllCards = false,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: '16 / 9' }}>
      {/* Outer table border / rail */}
      <div
        className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-amber-900 to-amber-950 shadow-2xl"
        style={{ padding: '12px' }}
      >
        {/* Felt surface */}
        <div className="w-full h-full rounded-[50%] bg-gradient-to-br from-emerald-800 to-emerald-900 border-4 border-emerald-700/50 shadow-inner relative overflow-visible">
          {/* Center area — community cards + pot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Pot */}
            <PotDisplay mainPot={pot.mainPot} sidePots={pot.sidePots} />

            {/* Community Cards */}
            <CommunityCards cards={communityCards} />
          </div>
        </div>
      </div>

      {/* Player seats — positioned around the ellipse */}
      {players.map((player) => {
        const layout = SEAT_LAYOUT[player.seatIndex];
        if (!layout) return null;

        return (
          <div key={player.seatIndex} style={layout.style} className="z-10">
            <PlayerSeat
              player={player}
              isCurrentActor={currentPlayerSeatIndex === player.seatIndex}
              isDealer={dealerSeatIndex === player.seatIndex}
              isThinking={thinkingSeatIndex === player.seatIndex}
              showCards={showAllCards || player.isHuman}
              position={layout.position}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PokerTable;