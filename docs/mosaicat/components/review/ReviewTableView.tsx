import React from 'react';

// ── Types ──────────────────────────────────────────────────
type Suit = 's' | 'h' | 'd' | 'c';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'allin';

interface Card {
  rank: Rank;
  suit: Suit;
}

interface DecisionPlayerState {
  seatIndex: number;
  name: string;
  position: Position;
  chipStack: number;
  isActive: boolean;
  currentBet: number;
}

interface ActionLogEntry {
  seatIndex: number;
  name: string;
  position: Position;
  type: ActionType;
  amount?: number;
}

interface DecisionPoint {
  index: number;
  street: Street;
  seatIndex: number;
  isHero: boolean;
  pot: number;
  communityCards: Card[];
  playerStates: DecisionPlayerState[];
  action: { type: ActionType; amount?: number };
  actionsAtPoint: ActionLogEntry[];
}

interface ReviewTableViewProps {
  decisionPoint: DecisionPoint;
  heroHoleCards: Card[];
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────

const suitSymbols: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-blue-500',
  c: 'text-emerald-700',
};

const positionColors: Record<Position, string> = {
  BTN: 'bg-yellow-100 text-yellow-800',
  SB: 'bg-purple-100 text-purple-800',
  BB: 'bg-indigo-100 text-indigo-800',
  UTG: 'bg-red-100 text-red-800',
  MP: 'bg-cyan-100 text-cyan-800',
  CO: 'bg-emerald-100 text-emerald-800',
};

const streetLabels: Record<Street, string> = {
  preflop: 'Pre-flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

/** Seat positions around the elliptical table (6-max).
 *  Angles measured clockwise from bottom-center. */
const SEAT_LAYOUT: Array<{ bottom?: string; top?: string; left?: string; right?: string; transform?: string }> = [
  { bottom: '-48px', left: '50%', transform: 'translateX(-50%)' },   // seat 0 – bottom center (hero)
  { bottom: '-24px', right: '4%' },                                   // seat 1 – bottom right
  { top: '-24px', right: '4%' },                                      // seat 2 – top right
  { top: '-48px', left: '50%', transform: 'translateX(-50%)' },       // seat 3 – top center
  { top: '-24px', left: '4%' },                                       // seat 4 – top left
  { bottom: '-24px', left: '4%' },                                    // seat 5 – bottom left
];

function formatChips(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(1);
}

// ── Sub-components ─────────────────────────────────────────

const HoleCard: React.FC<{ card?: Card; faceDown?: boolean }> = ({ card, faceDown }) => {
  if (faceDown || !card) {
    return (
      <div className="w-8 h-11 rounded bg-blue-900 border border-blue-800 shadow-sm" />
    );
  }
  return (
    <div className="w-8 h-11 rounded bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <span className={`text-xs font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
      <span className={`text-xs ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
    </div>
  );
};

const CommunityCardArea: React.FC<{ cards: Card[]; street: Street }> = ({ cards, street }) => {
  const emptySlots = 5 - cards.length;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium tracking-wide uppercase text-emerald-300/70">
        {streetLabels[street]}
      </span>
      <div className="flex items-center gap-2">
        {cards.map((card, i) => (
          <div
            key={i}
            style={{ width: 64, height: 88 }}
            className="rounded-lg bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center"
          >
            <span className={`text-lg font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
            <span className={`text-xl mt-0.5 ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ width: 64, height: 88 }}
            className="rounded-lg border-2 border-dashed border-emerald-600/30 bg-emerald-900/20"
          />
        ))}
      </div>
    </div>
  );
};

const PotDisplay: React.FC<{ pot: number }> = ({ pot }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider">Pot</div>
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-emerald-500/20">
      <div className="relative w-5 h-5 flex-shrink-0">
        <div className="absolute bottom-0 left-0 w-5 h-1.5 rounded-full bg-amber-400 border border-amber-500" />
        <div className="absolute bottom-1 left-0 w-5 h-1.5 rounded-full bg-amber-300 border border-amber-400" />
        <div className="absolute bottom-2 left-0 w-5 h-1.5 rounded-full bg-yellow-300 border border-yellow-400" />
      </div>
      <span className="text-lg font-bold text-yellow-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatChips(pot)}
      </span>
    </div>
  </div>
);

const PositionLabel: React.FC<{ position: Position }> = ({ position }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${positionColors[position]}`}>
    {position}
  </span>
);

const SeatView: React.FC<{
  player: DecisionPlayerState;
  isHero: boolean;
  isActing: boolean;
  heroHoleCards?: Card[];
}> = ({ player, isHero, isActing, heroHoleCards }) => {
  const borderClass = isActing
    ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200/50'
    : !player.isActive
      ? 'border-gray-100 bg-gray-50 opacity-60'
      : 'border-gray-200 bg-white shadow-sm';

  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${borderClass}`}
      style={{ minWidth: 120 }}
    >
      {/* Hole cards */}
      <div className="flex gap-1 mb-0.5">
        {isHero && heroHoleCards ? (
          heroHoleCards.map((card, i) => <HoleCard key={i} card={card} />)
        ) : (
          <>
            <HoleCard faceDown />
            <HoleCard faceDown />
          </>
        )}
      </div>

      {/* Avatar */}
      {isHero ? (
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          H
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-100 text-gray-500 border border-gray-200 flex items-center justify-center text-sm">
          🤖
        </div>
      )}

      {/* Name */}
      <span className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">
        {player.name}
      </span>

      {/* Position */}
      <PositionLabel position={player.position} />

      {/* Stack */}
      <span className="text-xs font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatChips(player.chipStack)} BB
      </span>

      {/* Current bet */}
      {player.currentBet > 0 && (
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
          Bet: {formatChips(player.currentBet)}
        </span>
      )}

      {/* Folded label */}
      {!player.isActive && (
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Folded
        </span>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────

export const ReviewTableView: React.FC<ReviewTableViewProps> = ({
  decisionPoint,
  heroHoleCards,
  className = '',
}) => {
  const { street, pot, communityCards, playerStates, seatIndex: actingSeat } = decisionPoint;

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`} style={{ aspectRatio: '16 / 9' }}>
      {/* Outer rail */}
      <div
        className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-amber-900 to-amber-950 shadow-2xl"
        style={{ padding: 12 }}
      >
        {/* Felt */}
        <div className="w-full h-full rounded-[50%] bg-gradient-to-br from-emerald-800 to-emerald-900 border-4 border-emerald-700/50 shadow-inner relative overflow-visible">
          {/* Center: Pot + Community Cards */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <PotDisplay pot={pot} />
            <CommunityCardArea cards={communityCards} street={street} />
          </div>
        </div>
      </div>

      {/* Player seats */}
      {playerStates.map((player) => {
        const layout = SEAT_LAYOUT[player.seatIndex] ?? SEAT_LAYOUT[0];
        const isHero = player.seatIndex === 0;
        const isActing = player.seatIndex === actingSeat;

        return (
          <div
            key={player.seatIndex}
            className="z-10"
            style={{ position: 'absolute', ...layout }}
          >
            <SeatView
              player={player}
              isHero={isHero}
              isActing={isActing}
              heroHoleCards={isHero ? heroHoleCards : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ReviewTableView;