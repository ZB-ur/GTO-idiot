import React from 'react';

// Types derived from API spec
interface Card {
  rank: string; // '2'-'9', 'T', 'J', 'Q', 'K', 'A'
  suit: string; // 's' | 'h' | 'd' | 'c'
}

interface DecisionPlayerState {
  seatIndex: number;
  position: string; // Position enum
  chipCount: number;
  status: string; // PlayerStatus enum
  currentBet: number;
}

interface ReplayBoardState {
  street: string;
  communityCards: Card[];
  pot: number;
  players: DecisionPlayerState[];
}

interface ReplayBoardProps {
  boardState: ReplayBoardState;
  userHoleCards: [Card, Card];
  userSeatIndex: number;
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900',
};

// 6-max seat layout positions (elliptical around the table)
// Ordered so userSeatIndex=0 maps to bottom-center, going clockwise
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // 0 - bottom center
  { top: '65%', left: '12%' },   // 1 - bottom left
  { top: '18%', left: '12%' },   // 2 - top left
  { top: '5%',  left: '50%' },   // 3 - top center
  { top: '18%', left: '88%' },   // 4 - top right
  { top: '65%', left: '88%' },   // 5 - bottom right
];

function formatChips(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return amount.toString();
}

function PlayingCard({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-blue-700 border border-blue-800 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-blue-500 bg-blue-600" />
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
  const colorClass = SUIT_COLORS[card.suit] || 'text-gray-900';

  return (
    <div className={`w-10 h-14 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col items-center justify-center ${colorClass}`}>
      <span className="text-sm font-bold leading-none">{card.rank}</span>
      <span className="text-xs leading-none">{suitSymbol}</span>
    </div>
  );
}

function CommunityCards({ cards, street }: { cards: Card[]; street: string }) {
  // Show placeholders for unrevealed community cards
  const totalSlots = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;

  if (totalSlots === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-emerald-300 text-xs font-medium uppercase tracking-wide">Preflop</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSlots }).map((_, i) => (
        <PlayingCard key={i} card={cards[i]} faceDown={!cards[i]} />
      ))}
    </div>
  );
}

function PotDisplay({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" />
      </svg>
      <span className="text-white font-semibold text-sm">{formatChips(amount)}</span>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: 'border-emerald-400 bg-emerald-900/40',
  folded: 'border-gray-600 bg-gray-800/60 opacity-50',
  'all-in': 'border-amber-400 bg-amber-900/40',
  'sitting-out': 'border-gray-600 bg-gray-800/60 opacity-30',
};

function SeatPosition({
  player,
  isUser,
  holeCards,
}: {
  player: DecisionPlayerState;
  isUser: boolean;
  holeCards?: [Card, Card];
}) {
  const statusStyle = STATUS_STYLES[player.status] || STATUS_STYLES.active;

  return (
    <div className="flex flex-col items-center gap-1" style={{ transform: 'translate(-50%, -50%)' }}>
      {/* Hole cards (only for user) */}
      {isUser && holeCards && player.status !== 'folded' && (
        <div className="flex gap-0.5 mb-0.5">
          <PlayingCard card={holeCards[0]} />
          <PlayingCard card={holeCards[1]} />
        </div>
      )}
      {!isUser && player.status !== 'folded' && (
        <div className="flex gap-0.5 mb-0.5">
          <PlayingCard faceDown />
          <PlayingCard faceDown />
        </div>
      )}

      {/* Player info box */}
      <div className={`rounded-lg border-2 px-3 py-1.5 text-center min-w-[72px] ${statusStyle}`}>
        <div className="text-white text-xs font-semibold truncate">
          {isUser ? '你' : player.position}
        </div>
        <div className="text-emerald-200 text-xs font-mono">
          {formatChips(player.chipCount)}
        </div>
      </div>

      {/* Current bet */}
      {player.currentBet > 0 && (
        <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-yellow-200 text-xs font-mono">{formatChips(player.currentBet)}</span>
        </div>
      )}

      {/* Status badge */}
      {player.status === 'folded' && (
        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Fold</span>
      )}
      {player.status === 'all-in' && (
        <span className="text-amber-300 text-[10px] uppercase tracking-wider font-bold">All-in</span>
      )}
    </div>
  );
}

export const ReplayBoard: React.FC<ReplayBoardProps> = ({
  boardState,
  userHoleCards,
  userSeatIndex,
}) => {
  // Rotate seats so user is always at position 0 (bottom center)
  const getVisualIndex = (seatIndex: number) => {
    return (seatIndex - userSeatIndex + 6) % 6;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[16/10]">
      {/* Table felt */}
      <div className="absolute inset-4 rounded-[50%] bg-emerald-800 border-[6px] border-emerald-900 shadow-xl">
        {/* Inner felt line */}
        <div className="absolute inset-3 rounded-[50%] border border-emerald-700/50" />

        {/* Street indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className="text-emerald-300/60 text-[10px] uppercase tracking-widest font-medium">
            {boardState.street}
          </span>
        </div>

        {/* Community cards - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <CommunityCards cards={boardState.communityCards} street={boardState.street} />
          <PotDisplay amount={boardState.pot} />
        </div>
      </div>

      {/* Player seats */}
      {boardState.players.map((player) => {
        const visualIdx = getVisualIndex(player.seatIndex);
        const pos = SEAT_POSITIONS[visualIdx];
        return (
          <div
            key={player.seatIndex}
            className="absolute"
            style={{ top: pos.top, left: pos.left }}
          >
            <SeatPosition
              player={player}
              isUser={player.seatIndex === userSeatIndex}
              holeCards={player.seatIndex === userSeatIndex ? userHoleCards : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ReplayBoard;