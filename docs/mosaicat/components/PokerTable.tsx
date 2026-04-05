import React from 'react';

// --- Type Definitions ---

interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface PlayerState {
  seatIndex: number;
  name: string;
  stackSize: number;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  isBot: boolean;
  botProfile?: 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  holeCards?: [Card, Card];
  currentBet?: number;
  lastAction?: string;
  lastActionAmount?: number;
}

interface PotInfo {
  mainPot: number;
  sidePots?: Array<{
    amount: number;
    eligibleSeatIndices: number[];
  }>;
}

interface GameState {
  sessionId: string;
  handNumber: number;
  bettingRound: 'preflop' | 'flop' | 'turn' | 'river';
  players: PlayerState[];
  communityCards: Card[];
  pot: PotInfo;
  dealerSeatIndex: number;
  isUserTurn: boolean;
  isHandComplete: boolean;
}

interface PokerTableProps {
  gameState: GameState;
  thinkingSeatIndex?: number;
}

// --- Seat Layout (6 positions around an oval) ---

const SEAT_POSITIONS: Array<{ top: string; left: string; labelAlign: string }> = [
  { top: '78%', left: '50%', labelAlign: 'top' },    // Seat 0 (User) — bottom center
  { top: '65%', left: '8%', labelAlign: 'right' },    // Seat 1 — bottom-left
  { top: '18%', left: '8%', labelAlign: 'right' },    // Seat 2 — top-left
  { top: '5%', left: '50%', labelAlign: 'bottom' },   // Seat 3 — top center
  { top: '18%', left: '92%', labelAlign: 'left' },    // Seat 4 — top-right
  { top: '65%', left: '92%', labelAlign: 'left' },    // Seat 5 — bottom-right
];

// --- Sub-components ---

function CardDisplay({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600 flex items-center justify-center shadow-md">
        <div className="w-6 h-8 rounded border border-emerald-500/40" />
      </div>
    );
  }

  const suitSymbol: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className="w-10 h-14 rounded-lg bg-gray-100 border border-gray-300 flex flex-col items-center justify-center shadow-md">
      <span className={`text-xs font-bold leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {card.rank}
      </span>
      <span className={`text-sm leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {suitSymbol[card.suit]}
      </span>
    </div>
  );
}

function CommunityCards({ cards }: { cards: Card[] }) {
  const placeholders = 5 - cards.length;
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {cards.map((card, i) => (
        <CardDisplay key={i} card={card} />
      ))}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-10 h-14 rounded-lg border border-dashed border-emerald-700/40"
        />
      ))}
    </div>
  );
}

function PotDisplay({ pot }: { pot: PotInfo }) {
  const totalPot =
    pot.mainPot + (pot.sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 bg-gray-950/60 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
        <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="10" r="8" />
        </svg>
        <span className="text-yellow-500 font-bold text-sm">{totalPot}</span>
      </div>
      {pot.sidePots && pot.sidePots.length > 0 && (
        <div className="flex gap-1">
          {pot.sidePots.map((sp, i) => (
            <span
              key={i}
              className="text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-full"
            >
              Side: {sp.amount}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerSeat({
  player,
  isDealer,
  isThinking,
}: {
  player: PlayerState;
  isDealer: boolean;
  isThinking: boolean;
}) {
  const opacity = player.isFolded ? 'opacity-40' : 'opacity-100';

  return (
    <div className={`flex flex-col items-center gap-1 ${opacity} transition-opacity`}>
      {/* Hole cards */}
      <div className="flex gap-0.5 h-14">
        {player.holeCards ? (
          player.holeCards.map((card, i) => <CardDisplay key={i} card={card} />)
        ) : player.isActive && !player.isFolded ? (
          <>
            <CardDisplay faceDown />
            <CardDisplay faceDown />
          </>
        ) : null}
      </div>

      {/* Player chip / avatar */}
      <div
        className={`relative px-3 py-1.5 rounded-xl border ${
          isThinking
            ? 'border-emerald-400 bg-gray-800 ring-2 ring-emerald-400/50 animate-pulse'
            : player.isAllIn
              ? 'border-amber-400 bg-gray-800'
              : 'border-gray-700 bg-gray-800'
        } min-w-[80px] text-center`}
      >
        {/* Dealer button */}
        {isDealer && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-500 text-gray-900 text-[10px] font-bold flex items-center justify-center shadow">
            D
          </span>
        )}

        <div className="text-gray-50 text-xs font-semibold truncate">{player.name}</div>
        <div className="text-emerald-400 text-xs font-mono">{player.stackSize}</div>
        <div className="text-gray-500 text-[10px]">{player.position}</div>
      </div>

      {/* Last action badge */}
      {player.lastAction && !player.isFolded && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-700/80 text-gray-300 uppercase tracking-wide">
          {player.lastAction}
          {player.lastActionAmount ? ` ${player.lastActionAmount}` : ''}
        </span>
      )}

      {/* Current bet */}
      {player.currentBet != null && player.currentBet > 0 && (
        <span className="text-[10px] text-yellow-400 font-mono">
          Bet: {player.currentBet}
        </span>
      )}
    </div>
  );
}

// --- Main Component ---

export default function PokerTable({ gameState, thinkingSeatIndex }: PokerTableProps) {
  return (
    <div className="relative w-full max-w-3xl aspect-[16/10] mx-auto select-none">
      {/* Outer table rim */}
      <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-gray-700 to-gray-800 shadow-2xl" />

      {/* Felt surface */}
      <div className="absolute inset-3 rounded-[50%] bg-gradient-to-br from-emerald-800 to-emerald-950 border-4 border-emerald-700/50 shadow-inner flex flex-col items-center justify-center gap-3">
        {/* Hand info */}
        <div className="text-gray-400 text-xs font-mono tracking-wider uppercase">
          Hand #{gameState.handNumber} · {gameState.bettingRound}
        </div>

        {/* Community cards */}
        <CommunityCards cards={gameState.communityCards} />

        {/* Pot */}
        <PotDisplay pot={gameState.pot} />
      </div>

      {/* Player seats (absolutely positioned around the table) */}
      {gameState.players.map((player, i) => {
        const pos = SEAT_POSITIONS[i];
        return (
          <div
            key={player.seatIndex}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <PlayerSeat
              player={player}
              isDealer={gameState.dealerSeatIndex === player.seatIndex}
              isThinking={thinkingSeatIndex === player.seatIndex}
            />
          </div>
        );
      })}
    </div>
  );
}