import React from 'react';
import { PlayerSeat } from './PlayerSeat.js';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

type BotStyle = 'TAG' | 'LAG' | 'TightPassive' | 'Fish' | 'Balanced';
type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SeatState {
  playerId: string;
  nickname: string;
  seatIndex: number;
  isUser: boolean;
  botStyle?: BotStyle;
  chipCount: number;
  position: Position;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
}

interface SeatLayoutProps {
  seats: SeatState[];
  dealerSeatIndex: number;
  activeSeatIndex: number | null;
  thinkingSeatIndex: number | null;
}

// 6-seat elliptical positions (percentage based, centered on table)
// Order: seat 0 = bottom center (user), clockwise
const SEAT_POSITIONS: Array<{ top: string; left: string }> = [
  { top: '82%', left: '50%' },   // 0: bottom center (user)
  { top: '62%', left: '6%' },    // 1: bottom left
  { top: '14%', left: '10%' },   // 2: top left
  { top: '4%', left: '50%' },    // 3: top center
  { top: '14%', left: '90%' },   // 4: top right
  { top: '62%', left: '94%' },   // 5: bottom right
];

function DealerButton({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-6 h-6 rounded-full bg-amber-400 text-gray-950 text-xs font-black flex items-center justify-center shadow-md border-2 border-amber-300 z-10 -translate-x-1/2 -translate-y-1/2"
      style={style}
    >
      D
    </div>
  );
}

// Dealer button offset from seat position
const DEALER_OFFSETS: Array<{ topDelta: string; leftDelta: string }> = [
  { topDelta: '-6%', leftDelta: '8%' },
  { topDelta: '-6%', leftDelta: '4%' },
  { topDelta: '6%', leftDelta: '4%' },
  { topDelta: '6%', leftDelta: '4%' },
  { topDelta: '6%', leftDelta: '-4%' },
  { topDelta: '-6%', leftDelta: '-4%' },
];

export function SeatLayout({ seats, dealerSeatIndex, activeSeatIndex, thinkingSeatIndex }: SeatLayoutProps) {
  const dealerPos = SEAT_POSITIONS[dealerSeatIndex];
  const dealerOffset = DEALER_OFFSETS[dealerSeatIndex];

  return (
    <div className="absolute inset-0">
      {/* Dealer button */}
      {dealerPos && (
        <DealerButton
          style={{
            top: `calc(${dealerPos.top} + ${dealerOffset?.topDelta ?? '0%'})`,
            left: `calc(${dealerPos.left} + ${dealerOffset?.leftDelta ?? '0%'})`,
          }}
        />
      )}

      {/* Player seats */}
      {seats.map((seat) => {
        const pos = SEAT_POSITIONS[seat.seatIndex];
        if (!pos) return null;

        return (
          <div
            key={seat.playerId}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ top: pos.top, left: pos.left }}
          >
            <PlayerSeat
              seat={seat}
              isActive={activeSeatIndex === seat.seatIndex}
              isThinking={thinkingSeatIndex === seat.seatIndex}
              showCards={seat.isUser || false}
            />
          </div>
        );
      })}
    </div>
  );
}