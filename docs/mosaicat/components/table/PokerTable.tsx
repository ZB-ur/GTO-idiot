import React from 'react';
import { ActionPanel, AvailableActions, PlayerAction } from './ActionPanel';

// ── Types ────────────────────────────────────────────────────────

export interface Card {
  rank: string; // '2'..'A'
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export interface PlayerState {
  id: string;
  name: string;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  chipsBB: number;
  holeCards?: [Card, Card];
  isHuman: boolean;
  isActive: boolean;
  isDealer: boolean;
  isTurn: boolean;
  currentBet?: number;
  hasFolded: boolean;
}

export interface HandState {
  handId: string;
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards: Card[];
  potBB: number;
  players: PlayerState[];
  availableActions: AvailableActions;
  potOdds?: string;
  humanPlayerId: string;
}

interface PokerTableProps {
  handState: HandState;
  onAction: (action: PlayerAction) => void;
  onEndSession: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-green-700',
  spades: 'text-gray-900',
};

/**
 * 6-max seat positions around the oval.
 * Indexed by position name → CSS positioning.
 */
const SEAT_POSITIONS: Record<string, { top: string; left: string }> = {
  UTG: { top: '10%', left: '25%' },
  HJ: { top: '10%', left: '75%' },
  CO: { top: '50%', left: '95%' },
  BTN: { top: '85%', left: '75%' },
  SB: { top: '85%', left: '25%' },
  BB: { top: '50%', left: '5%' },
};

// ── Sub-components ───────────────────────────────────────────────

const CardView: React.FC<{ card: Card; faceDown?: boolean }> = ({ card, faceDown }) => {
  if (faceDown) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 border border-blue-400/30 rounded-sm" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col items-center justify-center">
      <span className={`text-sm font-bold leading-none ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-base leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
};

const CommunityCards: React.FC<{ cards: Card[]; street: string }> = ({ cards, street }) => {
  const totalSlots = 5;
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {Array.from({ length: totalSlots }).map((_, i) => {
        if (i < cards.length) {
          return <CardView key={i} card={cards[i]} />;
        }
        return (
          <div
            key={i}
            className="w-10 h-14 rounded-lg border-2 border-dashed border-emerald-500/30"
          />
        );
      })}
    </div>
  );
};

const PotDisplay: React.FC<{ potBB: number }> = ({ potBB }) => (
  <div className="flex items-center justify-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5">
    <span className="text-yellow-400 text-xs font-semibold">POT</span>
    <span className="text-white text-sm font-bold">{potBB} BB</span>
  </div>
);

const PlayerSeat: React.FC<{ player: PlayerState }> = ({ player }) => {
  const pos = SEAT_POSITIONS[player.position];
  const ringColor = player.isTurn
    ? 'ring-4 ring-yellow-400 ring-opacity-80'
    : player.hasFolded
    ? 'opacity-40'
    : '';

  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Hole cards */}
      <div className="flex gap-0.5 mb-1">
        {player.holeCards ? (
          <>
            <CardView card={player.holeCards[0]} />
            <CardView card={player.holeCards[1]} />
          </>
        ) : !player.hasFolded ? (
          <>
            <CardView card={{ rank: '', suit: 'spades' }} faceDown />
            <CardView card={{ rank: '', suit: 'spades' }} faceDown />
          </>
        ) : null}
      </div>

      {/* Avatar / info chip */}
      <div
        className={`bg-gray-900/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center min-w-[80px] shadow-lg ${ringColor}`}
      >
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          {player.position}
        </div>
        <div className="text-xs text-white font-semibold truncate max-w-[80px]">
          {player.name}
        </div>
        <div className="text-[11px] text-emerald-400 font-bold">{player.chipsBB} BB</div>
      </div>

      {/* Current bet */}
      {player.currentBet !== undefined && player.currentBet > 0 && (
        <div className="bg-yellow-500/90 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-900">
          {player.currentBet} BB
        </div>
      )}

      {/* Dealer button */}
      {player.isDealer && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[10px] font-black text-gray-900 flex items-center justify-center shadow border border-gray-300">
          D
        </div>
      )}
    </div>
  );
};

const SessionControls: React.FC<{ onEndSession: () => void; handNumber: number }> = ({
  onEndSession,
  handNumber,
}) => (
  <div className="absolute top-3 right-3 flex items-center gap-3 z-10">
    <span className="text-xs text-white/60 font-medium">Hand #{handNumber}</span>
    <button
      onClick={onEndSession}
      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10"
    >
      End Session
    </button>
  </div>
);

// ── Main Component ───────────────────────────────────────────────

export const PokerTable: React.FC<PokerTableProps> = ({
  handState,
  onAction,
  onEndSession,
}) => {
  const humanPlayer = handState.players.find((p) => p.id === handState.humanPlayerId);
  const isHumanTurn = humanPlayer?.isTurn ?? false;

  return (
    <div className="relative w-full min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden pb-32">
      {/* Session controls */}
      <SessionControls onEndSession={onEndSession} handNumber={handState.handNumber} />

      {/* Street indicator */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">
          {handState.street}
        </span>
      </div>

      {/* Table */}
      <div
        className="relative"
        style={{ width: '680px', height: '400px' }}
      >
        {/* Felt oval */}
        <div
          className="absolute inset-0 rounded-[50%] bg-emerald-800 border-[6px] border-emerald-900 shadow-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, #065f46 0%, #064e3b 60%, #022c22 100%)',
          }}
        />

        {/* Inner rail */}
        <div
          className="absolute inset-4 rounded-[50%] border-2 border-emerald-600/20"
        />

        {/* Community cards + Pot */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <CommunityCards cards={handState.communityCards} street={handState.street} />
          <PotDisplay potBB={handState.potBB} />
        </div>

        {/* Player seats */}
        {handState.players.map((player) => (
          <PlayerSeat key={player.id} player={player} />
        ))}
      </div>

      {/* Action panel */}
      <ActionPanel
        availableActions={handState.availableActions}
        onAction={onAction}
        potOdds={handState.potOdds}
        disabled={!isHumanTurn}
      />
    </div>
  );
};

export default PokerTable;