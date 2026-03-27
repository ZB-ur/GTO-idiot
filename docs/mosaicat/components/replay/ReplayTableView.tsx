import React from 'react';

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface SeatState {
  playerId: string;
  nickname: string;
  seatIndex: number;
  isUser: boolean;
  chipCount: number;
  position: Position;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
}

export interface GameState {
  handId: string;
  handNumber: number;
  street: string;
  pot: number;
  communityCards: Card[];
  seats: SeatState[];
  dealerSeatIndex: number;
  activeSeatIndex?: number | null;
  isHandComplete: boolean;
}

interface ReplayTableViewProps {
  gameState: Partial<GameState>;
  highlightSeatIndex?: number;
}

const SUIT_DISPLAY: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-100' },
  h: { symbol: '♥', color: 'text-red-500' },
  d: { symbol: '♦', color: 'text-red-500' },
  c: { symbol: '♣', color: 'text-gray-100' },
};

/** Seat positions around an oval table (6-max), in percentages */
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '25%' },  // seat 0 - bottom-left
  { top: '78%', left: '75%' },  // seat 1 - bottom-right
  { top: '40%', left: '95%' },  // seat 2 - right
  { top: '5%',  left: '75%' },  // seat 3 - top-right
  { top: '5%',  left: '25%' },  // seat 4 - top-left
  { top: '40%', left: '5%' },   // seat 5 - left
];

const CardView: React.FC<{ card: Card; small?: boolean }> = ({ card, small }) => {
  const suit = SUIT_DISPLAY[card.suit];
  return (
    <div className={`
      inline-flex items-center justify-center bg-white rounded shadow-md
      ${small ? 'w-7 h-10 text-xs' : 'w-9 h-12 text-sm'}
      font-mono font-bold ${suit.color}
    `}>
      <span>{card.rank}{suit.symbol}</span>
    </div>
  );
};

const FaceDownCard: React.FC<{ small?: boolean }> = ({ small }) => (
  <div className={`
    inline-flex items-center justify-center rounded shadow-md
    ${small ? 'w-7 h-10' : 'w-9 h-12'}
    bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600
  `}>
    <div className="w-3/4 h-3/4 border border-blue-400/30 rounded-sm" />
  </div>
);

const SeatComponent: React.FC<{
  seat: SeatState;
  isDealer: boolean;
  isHighlighted: boolean;
  position: { top: string; left: string };
}> = ({ seat, isDealer, isHighlighted, position }) => {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <div className={`
        relative flex flex-col items-center gap-1
        ${seat.isFolded ? 'opacity-40' : ''}
      `}>
        {/* Hole cards */}
        <div className="flex gap-0.5 mb-1">
          {seat.holeCards ? (
            seat.holeCards.map((card, i) => <CardView key={i} card={card} small />)
          ) : !seat.isFolded ? (
            <>
              <FaceDownCard small />
              <FaceDownCard small />
            </>
          ) : null}
        </div>

        {/* Player info box */}
        <div className={`
          relative px-3 py-1.5 rounded-lg text-center min-w-[80px]
          ${isHighlighted
            ? 'bg-amber-500/20 border-2 border-amber-500 shadow-lg shadow-amber-500/20'
            : seat.isUser
              ? 'bg-gray-800 border-2 border-amber-500/50'
              : 'bg-gray-800 border border-gray-700'
          }
        `}>
          {/* Dealer button */}
          {isDealer && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-gray-950 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
              D
            </div>
          )}

          <p className={`text-xs font-medium truncate ${seat.isUser ? 'text-amber-400' : 'text-gray-200'}`}>
            {seat.nickname}
          </p>
          <p className="text-[10px] text-gray-400">{seat.position}</p>
          <p className="text-xs font-semibold text-gray-300">{seat.chipCount}</p>
        </div>

        {/* Last action / bet */}
        {seat.lastAction && !seat.isFolded && (
          <div className="px-2 py-0.5 bg-gray-900/80 border border-gray-700 rounded-full text-[10px] text-gray-300">
            {seat.lastAction}
          </div>
        )}

        {/* All-in badge */}
        {seat.isAllIn && (
          <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-[10px] text-red-400 font-semibold">
            ALL IN
          </div>
        )}
      </div>
    </div>
  );
};

export const ReplayTableView: React.FC<ReplayTableViewProps> = ({
  gameState,
  highlightSeatIndex,
}) => {
  const seats = gameState.seats ?? [];
  const communityCards = gameState.communityCards ?? [];
  const pot = gameState.pot ?? 0;
  const dealerSeatIndex = gameState.dealerSeatIndex ?? 0;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <div className="relative w-full aspect-[16/10]">
        {/* Felt */}
        <div className="absolute inset-8 bg-emerald-900 rounded-[50%] border-4 border-emerald-700 shadow-inner">
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-[50%] border border-emerald-600/30" />
        </div>

        {/* Center: pot + community cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          {/* Pot */}
          {pot > 0 && (
            <div className="px-3 py-1 bg-gray-950/80 rounded-full border border-gray-700">
              <span className="text-xs text-amber-400 font-semibold">底池 {pot}</span>
            </div>
          )}

          {/* Community cards */}
          {communityCards.length > 0 && (
            <div className="flex gap-1">
              {communityCards.map((card, i) => (
                <CardView key={i} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Seats */}
        {seats.map((seat) => (
          <SeatComponent
            key={seat.seatIndex}
            seat={seat}
            isDealer={seat.seatIndex === dealerSeatIndex}
            isHighlighted={seat.seatIndex === highlightSeatIndex}
            position={SEAT_POSITIONS[seat.seatIndex] ?? SEAT_POSITIONS[0]}
          />
        ))}
      </div>
    </div>
  );
};