import React from 'react';
import HeroSeat from './HeroSeat';
import BotSeat from './BotSeat';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface SidePot {
  amount: number;
  eligibleSeatIndices: number[];
}

interface PlayerState {
  seatIndex: number;
  name: string;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  chipStack: number;
  isActive: boolean;
  isBust: boolean;
  isHero: boolean;
  difficulty: 'fish' | 'regular' | 'gto';
  holeCards?: Card[];
  currentBet?: number;
  lastAction?: string | null;
  handRank?: string | null;
}

interface HandState {
  handId: string;
  handNumber: number;
  gameId: string;
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  pot: number;
  sidePots?: SidePot[];
  communityCards: Card[];
  dealerSeatIndex: number;
  players: PlayerState[];
  currentActorSeatIndex?: number | null;
  isComplete: boolean;
}

interface GameSession {
  gameId: string;
  config: {
    bots: { seatIndex: number; difficulty: 'fish' | 'regular' | 'gto' }[];
    blindLevel: string;
    stackSize: string;
    gameSpeed: string;
  };
  status: string;
  currentHandNumber: number;
  players: PlayerState[];
  createdAt: string;
}

interface TableLayoutProps {
  handState: HandState;
  gameSession: GameSession;
}

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColor: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

// 6-seat positions around an oval table (percentages)
// Seat 0 = Hero (bottom center), then clockwise
const seatPositions: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // 0: bottom center (hero)
  { top: '62%', left: '10%' },   // 1: bottom-left
  { top: '18%', left: '10%' },   // 2: top-left
  { top: '5%', left: '50%' },    // 3: top center
  { top: '18%', left: '90%' },   // 4: top-right
  { top: '62%', left: '90%' },   // 5: bottom-right
];

function CommunityCard({ card }: { card: Card }) {
  return (
    <div className="w-12 h-[68px] rounded-lg bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center gap-0">
      <span className={`text-base font-bold leading-none ${suitColor[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-lg leading-none ${suitColor[card.suit]}`}>
        {suitSymbol[card.suit]}
      </span>
    </div>
  );
}

function CommunityCardPlaceholder() {
  return (
    <div className="w-12 h-[68px] rounded-lg border-2 border-dashed border-emerald-600/40" />
  );
}

function PotDisplay({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1.5">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-600 shadow-sm flex items-center justify-center">
        <span className="text-[8px] font-bold text-amber-900">$</span>
      </div>
      <span className="text-amber-400 font-bold text-sm font-mono">{amount}</span>
    </div>
  );
}

function SidePotDisplay({ sidePots }: { sidePots: SidePot[] }) {
  return (
    <div className="flex gap-2">
      {sidePots.map((pot, i) => (
        <div
          key={i}
          className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border border-gray-500" />
          <span className="text-gray-300 text-xs font-mono">{pot.amount}</span>
        </div>
      ))}
    </div>
  );
}

function DealerButton({ seatIndex }: { seatIndex: number }) {
  const pos = seatPositions[seatIndex];
  // Offset the dealer button slightly from the seat
  return (
    <div
      className="absolute z-20 w-7 h-7 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center"
      style={{
        top: pos.top,
        left: pos.left,
        transform: 'translate(-180%, -50%)',
      }}
    >
      <span className="text-[10px] font-black text-gray-800">D</span>
    </div>
  );
}

export default function TableLayout({ handState, gameSession }: TableLayoutProps) {
  const {
    pot,
    sidePots,
    communityCards,
    dealerSeatIndex,
    players,
    currentActorSeatIndex,
    street,
  } = handState;

  const botConfigs = gameSession.config.bots;

  // Fill community cards to 5 slots
  const cardSlots: (Card | null)[] = [
    ...communityCards,
    ...Array(5 - communityCards.length).fill(null),
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10]">
      {/* Table felt */}
      <div className="absolute inset-4 rounded-[50%] bg-gradient-to-b from-emerald-800 to-emerald-900 border-[6px] border-emerald-950 shadow-2xl">
        {/* Inner felt rim */}
        <div className="absolute inset-3 rounded-[50%] border border-emerald-700/40" />
      </div>

      {/* Center: community cards + pot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
        {/* Street label */}
        <div className="text-emerald-300/60 text-xs font-semibold uppercase tracking-widest mb-1">
          {street}
        </div>

        {/* Community cards */}
        <div className="flex gap-1.5">
          {cardSlots.map((card, i) =>
            card ? (
              <CommunityCard key={i} card={card} />
            ) : (
              <CommunityCardPlaceholder key={i} />
            )
          )}
        </div>

        {/* Pot */}
        <PotDisplay amount={pot} />

        {/* Side pots */}
        {sidePots && sidePots.length > 0 && <SidePotDisplay sidePots={sidePots} />}
      </div>

      {/* Seats */}
      {players.map((player) => {
        const pos = seatPositions[player.seatIndex];
        const isCurrentActor = currentActorSeatIndex === player.seatIndex;
        const botConfig = botConfigs.find((b) => b.seatIndex === player.seatIndex);

        return (
          <div
            key={player.seatIndex}
            className="absolute z-10"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {player.isHero ? (
              <HeroSeat player={player} isCurrentActor={isCurrentActor} />
            ) : (
              <BotSeat
                player={player}
                isCurrentActor={isCurrentActor}
                isThinking={isCurrentActor && !handState.isComplete}
                difficulty={botConfig?.difficulty || player.difficulty}
              />
            )}
          </div>
        );
      })}

      {/* Dealer button */}
      <DealerButton seatIndex={dealerSeatIndex} />

      {/* Hand info */}
      <div className="absolute top-2 left-4 text-emerald-400/50 text-xs font-mono">
        Hand #{handState.handNumber} · {gameSession.config.blindLevel}
      </div>
    </div>
  );
}