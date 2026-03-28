import React from 'react';
import SeatPosition from './SeatPosition';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';
import ActionPanel from './ActionPanel';

interface Card {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 's' | 'h' | 'd' | 'c';
}

interface Player {
  seatIndex: number;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  name: string;
  chipCount: number;
  status: 'active' | 'folded' | 'all-in' | 'sitting-out';
  isUser: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
  lastActionAmount?: number | null;
  isDealer?: boolean;
}

interface SidePot {
  amount: number;
  eligiblePlayerIndices: number[];
}

interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount?: number | null;
  canBet: boolean;
  minBetAmount?: number | null;
  maxBetAmount?: number | null;
  canRaise: boolean;
  minRaiseAmount?: number | null;
  maxRaiseAmount?: number | null;
  presetRaises?: { label: string; amount: number }[];
}

interface ShowdownWinner {
  seatIndex: number;
  amountWon: number;
}

interface ShowdownResult {
  winners: ShowdownWinner[];
  playerHands: {
    seatIndex: number;
    holeCards: Card[];
    bestHand: Card[];
    handRank: string;
    handDescription: string;
  }[];
}

interface GameState {
  sessionId: string;
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  players: Player[];
  communityCards: Card[];
  potTotal: number;
  sidePots?: SidePot[];
  currentPlayerIndex: number | null;
  isUserTurn: boolean;
  availableActions?: AvailableActions | null;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  handPhase?: 'dealing' | 'betting' | 'showdown' | 'complete';
  showdownResults?: ShowdownResult | null;
}

interface PlayerActionInput {
  actionType: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in' | 'post-blind';
  amount?: number | null;
}

interface PokerTableProps {
  gameState: GameState;
  onAction: (action: PlayerActionInput) => void;
}

/**
 * Seat layout positions around the elliptical table.
 * Indexed by seatIndex (0–5), maps to CSS positioning.
 * Seats arranged: 0=bottom-left, 1=left, 2=top-left, 3=top-right, 4=right, 5=bottom-right
 */
const SEAT_POSITIONS: { top: string; left: string; transform: string }[] = [
  { top: '72%', left: '15%', transform: 'translate(-50%, -50%)' },   // 0: bottom-left
  { top: '28%', left: '5%',  transform: 'translate(-50%, -50%)' },   // 1: top-left-side
  { top: '5%',  left: '30%', transform: 'translate(-50%, -50%)' },   // 2: top-left
  { top: '5%',  left: '70%', transform: 'translate(-50%, -50%)' },   // 3: top-right
  { top: '28%', left: '95%', transform: 'translate(-50%, -50%)' },   // 4: top-right-side
  { top: '72%', left: '85%', transform: 'translate(-50%, -50%)' },   // 5: bottom-right
];

export const PokerTable: React.FC<PokerTableProps> = ({ gameState, onAction }) => {
  const {
    handNumber,
    street,
    players,
    communityCards,
    potTotal,
    sidePots,
    currentPlayerIndex,
    isUserTurn,
    availableActions,
    smallBlind,
    bigBlind,
    handPhase,
    showdownResults,
  } = gameState;

  const isComplete = handPhase === 'complete' || handPhase === 'showdown';
  const winners = showdownResults?.winners ?? [];
  const winnerIndices = new Set(winners.map((w) => w.seatIndex));

  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: '16 / 10' }}>
      {/* Table felt — elliptical */}
      <div className="absolute inset-[8%] rounded-[50%] bg-emerald-800 border-[6px] border-emerald-900 shadow-xl">
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-[50%] border-2 border-emerald-600/30" />

        {/* Community cards + Pot — centered on table */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Street label */}
          <span className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-medium">
            Hand #{handNumber} · {street}
          </span>

          <CommunityCards cards={communityCards} />

          <PotDisplay potTotal={potTotal} sidePots={sidePots} />

          {/* Blinds info */}
          <span className="text-[10px] text-emerald-400/50">
            Blinds {smallBlind}/{bigBlind}
          </span>
        </div>
      </div>

      {/* Seats */}
      {players.map((player) => {
        const pos = SEAT_POSITIONS[player.seatIndex];
        const isActive = currentPlayerIndex === player.seatIndex;
        const isWinner = winnerIndices.has(player.seatIndex);

        return (
          <div
            key={player.seatIndex}
            className="absolute z-10"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.transform,
            }}
          >
            {/* Winner glow */}
            {isComplete && isWinner && (
              <div className="absolute inset-0 -m-2 rounded-2xl bg-amber-400/20 animate-pulse" />
            )}
            <SeatPosition player={player} isActive={isActive} />
          </div>
        );
      })}

      {/* Winner overlay */}
      {isComplete && showdownResults && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/40 shadow-2xl text-center">
            {winners.map((w) => {
              const player = players.find((p) => p.seatIndex === w.seatIndex);
              const hand = showdownResults.playerHands.find((h) => h.seatIndex === w.seatIndex);
              return (
                <div key={w.seatIndex} className="flex items-center gap-3">
                  <span className="text-amber-400 text-lg">🏆</span>
                  <div>
                    <span className="text-white font-bold text-sm">{player?.name ?? `Seat ${w.seatIndex}`}</span>
                    <span className="text-amber-400 text-sm ml-2">+{w.amountWon.toLocaleString()}</span>
                    {hand && (
                      <p className="text-emerald-300 text-xs">{hand.handDescription}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action panel — fixed at bottom, only when it's user's turn */}
      {isUserTurn && availableActions && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <ActionPanel availableActions={availableActions} onAction={onAction} />
        </div>
      )}
    </div>
  );
};

export default PokerTable;