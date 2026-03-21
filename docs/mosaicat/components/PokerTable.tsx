import React from 'react';

// Types
interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface PlayerState {
  seat: number;
  name: string;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  stack: number;
  hole_cards?: Card[] | null;
  is_active: boolean;
  is_all_in?: boolean;
  is_bot: boolean;
  current_bet?: number;
  total_invested?: number;
  last_action?: string | null;
}

interface SidePot {
  amount: number;
  eligibleSeats: number[];
}

interface PokerTableProps {
  players: PlayerState[];
  communityCards: Card[];
  pot: number;
  sidePots?: SidePot[];
  dealerSeat: number;
  currentPlayerSeat?: number;
  showAllCards?: boolean;
}

// Seat positions around an elliptical table (percentages relative to table container)
// Seats 0-5 arranged: bottom-center, bottom-left, top-left, top-center, top-right, bottom-right
const SEAT_POSITIONS: Array<{ top: string; left: string }> = [
  { top: '82%', left: '50%' },   // Seat 0 - bottom center (hero)
  { top: '65%', left: '8%' },    // Seat 1 - bottom left
  { top: '18%', left: '8%' },    // Seat 2 - top left
  { top: '2%', left: '50%' },    // Seat 3 - top center
  { top: '18%', left: '92%' },   // Seat 4 - top right
  { top: '65%', left: '92%' },   // Seat 5 - bottom right
];

// Dealer button offset from seat position
const DEALER_OFFSETS: Array<{ top: string; left: string }> = [
  { top: '-28px', left: '40px' },
  { top: '-28px', left: '40px' },
  { top: '28px', left: '40px' },
  { top: '28px', left: '0px' },
  { top: '28px', left: '-40px' },
  { top: '-28px', left: '-40px' },
];

const suitSymbol: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColor: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const CardDisplay: React.FC<{ card: Card }> = ({ card }) => (
  <div className="w-10 h-14 bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-gray-200">
    <span className={`text-sm font-bold ${suitColor[card.suit]}`}>
      {card.rank}
    </span>
    <span className={`text-base leading-none ${suitColor[card.suit]}`}>
      {suitSymbol[card.suit]}
    </span>
  </div>
);

const CardBack: React.FC = () => (
  <div className="w-10 h-14 rounded-lg shadow-md border border-gray-600 bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center">
    <div className="w-6 h-9 border border-emerald-400/30 rounded-sm" />
  </div>
);

const PokerTable: React.FC<PokerTableProps> = ({
  players,
  communityCards,
  pot,
  sidePots,
  dealerSeat,
  currentPlayerSeat,
  showAllCards = false,
}) => {
  const getPlayerBySeat = (seat: number) =>
    players.find((p) => p.seat === seat);

  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: '16 / 10' }}>
      {/* Table felt - elliptical shape */}
      <div className="absolute inset-[8%] rounded-[50%] bg-emerald-900 border-[6px] border-gray-700 shadow-[inset_0_4px_30px_rgba(0,0,0,0.5),0_0_40px_rgba(0,0,0,0.3)]">
        {/* Inner rail line */}
        <div className="absolute inset-3 rounded-[50%] border border-emerald-700/40" />

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {communityCards.map((card, i) => (
              <CardDisplay key={i} card={card} />
            ))}
            {/* Placeholder slots for remaining community cards */}
            {Array.from({ length: Math.max(0, 5 - communityCards.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-10 h-14 rounded-lg border border-emerald-700/30 bg-emerald-800/30"
              />
            ))}
          </div>

          {/* Pot Display */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-1 flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-yellow-600 shadow-sm" />
              <span className="text-gray-50 text-sm font-semibold">
                {pot.toLocaleString()}
              </span>
            </div>
            {sidePots && sidePots.length > 0 && (
              <div className="flex gap-1">
                {sidePots.map((sp, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/60 rounded-full px-2 py-0.5 text-xs text-gray-400"
                  >
                    Side: {sp.amount}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Seats */}
      {Array.from({ length: 6 }).map((_, seatIndex) => {
        const player = getPlayerBySeat(seatIndex);
        const pos = SEAT_POSITIONS[seatIndex];
        const isCurrentPlayer = currentPlayerSeat === seatIndex;
        const isDealer = dealerSeat === seatIndex;

        return (
          <div
            key={seatIndex}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            {player ? (
              <div className="relative">
                {/* Player seat card */}
                <div
                  className={`relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[90px] transition-all ${
                    isCurrentPlayer
                      ? 'bg-gray-800 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20'
                      : player.is_active
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-gray-800/60 border border-gray-700/50 opacity-60'
                  }`}
                >
                  {/* Hole cards */}
                  <div className="flex gap-0.5 -mt-8">
                    {player.hole_cards && (showAllCards || !player.is_bot) ? (
                      player.hole_cards.map((card, i) => (
                        <CardDisplay key={i} card={card} />
                      ))
                    ) : player.is_active ? (
                      <>
                        <CardBack />
                        <CardBack />
                      </>
                    ) : null}
                  </div>

                  {/* Name & position badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-50 text-sm font-medium truncate max-w-[70px]">
                      {player.name}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-700 rounded px-1 py-0.5 font-mono">
                      {player.position}
                    </span>
                  </div>

                  {/* Stack */}
                  <span className="text-emerald-400 text-xs font-semibold">
                    {player.is_all_in ? (
                      <span className="text-yellow-500">ALL IN</span>
                    ) : (
                      `${player.stack.toLocaleString()} BB`
                    )}
                  </span>

                  {/* Last action */}
                  {player.last_action && (
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                      {player.last_action}
                    </span>
                  )}

                  {/* Current bet chip */}
                  {player.current_bet != null && player.current_bet > 0 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span className="text-gray-300 text-[10px] font-semibold">
                        {player.current_bet}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dealer button */}
                {isDealer && (
                  <div
                    className="absolute w-6 h-6 rounded-full bg-white text-gray-900 text-[10px] font-bold flex items-center justify-center shadow-md border border-gray-300 z-10"
                    style={{
                      top: DEALER_OFFSETS[seatIndex].top,
                      left: DEALER_OFFSETS[seatIndex].left,
                    }}
                  >
                    D
                  </div>
                )}
              </div>
            ) : (
              /* Empty seat */
              <div className="w-[90px] h-[60px] rounded-xl border border-dashed border-gray-700/50 flex items-center justify-center">
                <span className="text-gray-600 text-xs">Empty</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PokerTable;