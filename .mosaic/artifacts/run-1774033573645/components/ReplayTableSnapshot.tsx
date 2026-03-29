import React from 'react';

// Types from API spec
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface PotInfo {
  mainPot: number;
  sidePots?: { amount: number; eligiblePlayers: number[] }[];
}

interface SnapshotPlayer {
  seatIndex: number;
  name?: string;
  chips: number;
  isActive: boolean;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  currentBet?: number;
}

interface Action {
  playerSeatIndex: number;
  playerName?: string;
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  street: string;
  potAfter?: number;
  timestamp: string;
}

interface TableSnapshot {
  communityCards: Card[];
  pot: PotInfo;
  players: SnapshotPlayer[];
  actionsThisStreet?: Action[];
}

interface ReplayTableSnapshotProps {
  snapshot: TableSnapshot;
  highlightSeatIndex?: number;
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-900' },
  h: { symbol: '♥', color: 'text-red-500' },
  d: { symbol: '♦', color: 'text-blue-500' },
  c: { symbol: '♣', color: 'text-emerald-600' },
};

// 6-max seat positions on an elliptical table (percentages)
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // 0: bottom center (human)
  { top: '65%', left: '12%' },   // 1: bottom-left
  { top: '20%', left: '12%' },   // 2: top-left
  { top: '5%', left: '50%' },    // 3: top center
  { top: '20%', left: '88%' },   // 4: top-right
  { top: '65%', left: '88%' },   // 5: bottom-right
];

function CardDisplay({ card }: { card: Card }) {
  const suit = SUIT_SYMBOLS[card.suit];
  return (
    <span className="inline-flex items-center justify-center w-8 h-11 bg-white rounded-md shadow-sm border border-gray-200 text-sm font-bold">
      <span className="flex flex-col items-center leading-none">
        <span className="text-gray-900">{card.rank}</span>
        <span className={suit.color}>{suit.symbol}</span>
      </span>
    </span>
  );
}

function PlayerSeat({
  player,
  isHighlighted,
}: {
  player: SnapshotPlayer;
  isHighlighted: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[80px]
        ${isHighlighted
          ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-emerald-900'
          : player.isActive
            ? 'bg-slate-100 text-gray-900 border border-gray-200'
            : 'bg-gray-300/60 text-gray-400 border border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            isHighlighted ? 'bg-blue-700 text-blue-100' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {player.position}
        </span>
        <span className="text-xs font-medium truncate max-w-[60px]">
          {player.name || `Seat ${player.seatIndex + 1}`}
        </span>
      </div>
      <span
        className={`text-xs font-mono ${
          isHighlighted ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        {player.chips.toLocaleString()} BB
      </span>
      {player.currentBet != null && player.currentBet > 0 && (
        <span
          className={`text-[10px] font-semibold ${
            isHighlighted ? 'text-amber-300' : 'text-amber-600'
          }`}
        >
          Bet: {player.currentBet} BB
        </span>
      )}
      {!player.isActive && (
        <span className="text-[10px] italic text-gray-400">Folded</span>
      )}
    </div>
  );
}

export default function ReplayTableSnapshot({
  snapshot,
  highlightSeatIndex,
}: ReplayTableSnapshotProps) {
  const { communityCards, pot, players } = snapshot;

  const totalPot =
    pot.mainPot + (pot.sidePots?.reduce((s, p) => s + p.amount, 0) ?? 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[16/10]">
      {/* Felt background */}
      <div className="absolute inset-0 bg-emerald-900 rounded-[40%] border-4 border-emerald-800 shadow-lg" />

      {/* Inner felt ring */}
      <div className="absolute inset-4 border-2 border-emerald-700/40 rounded-[38%]" />

      {/* Community cards + pot (center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        {communityCards.length > 0 && (
          <div className="flex gap-1">
            {communityCards.map((card, i) => (
              <CardDisplay key={i} card={card} />
            ))}
          </div>
        )}
        <div className="bg-black/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Pot: {totalPot} BB
          {pot.sidePots && pot.sidePots.length > 0 && (
            <span className="text-emerald-300 ml-1">
              (+{pot.sidePots.length} side)
            </span>
          )}
        </div>
      </div>

      {/* Player seats */}
      {players.map((player) => {
        const pos = SEAT_POSITIONS[player.seatIndex] ?? SEAT_POSITIONS[0];
        return (
          <div
            key={player.seatIndex}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <PlayerSeat
              player={player}
              isHighlighted={highlightSeatIndex === player.seatIndex}
            />
          </div>
        );
      })}

      {/* Read-only badge */}
      <div className="absolute top-2 right-4 bg-black/40 text-white/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
        REPLAY
      </div>
    </div>
  );
}