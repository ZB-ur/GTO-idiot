import React from 'react';

export interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface HandPlayerState {
  playerId: string;
  position: string;
  chipStack: number;
  bet: number;
  holeCards?: [Card, Card];
  isFolded: boolean;
  isAllIn: boolean;
  hasActed?: boolean;
}

export interface PlayerInfo {
  playerId: string;
  name: string;
  position: string;
  chipStack: number;
  isHuman: boolean;
  isActive: boolean;
  botStyle?: string;
}

export interface HandState {
  handId: string;
  street: string;
  pot: number;
  communityCards: Card[];
  dealerPosition: string;
  activePlayerId: string | null;
  isPlayerTurn?: boolean;
  players: HandPlayerState[];
  status?: string;
}

export interface GameState {
  gameId: string;
  blindLevel: string;
  speed?: string;
  players: PlayerInfo[];
  currentHand: HandState;
  handCount: number;
  sessionProfit?: number;
}

export interface AvailableActions {
  actions: string[];
  potSize: number;
  toCall: number;
  minRaise?: number;
  maxRaise?: number;
  presetRaiseSizes?: Array<{ label: string; amount: number }>;
}

interface PokerTableProps {
  gameState: GameState;
  availableActions?: AvailableActions;
  onAction: (action: string, amount?: number) => void;
  speed: 'fast' | 'normal' | 'slow';
}

const suitSymbols: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-900' },
  h: { symbol: '♥', color: 'text-red-600' },
  d: { symbol: '♦', color: 'text-red-600' },
  c: { symbol: '♣', color: 'text-gray-900' },
};

// Seat positions around ellipse (6-max) — [top, left/right percentages]
const seatLayout: Record<string, { top: string; left: string }> = {
  BTN: { top: '75%', left: '80%' },
  SB: { top: '30%', left: '85%' },
  BB: { top: '5%', left: '65%' },
  UTG: { top: '5%', left: '25%' },
  HJ: { top: '30%', left: '5%' },
  CO: { top: '75%', left: '12%' },
};

const CardComponent: React.FC<{ card: Card; faceDown?: boolean }> = ({ card, faceDown }) => {
  if (faceDown) {
    return (
      <div className="w-9 h-12 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-sm flex items-center justify-center">
        <div className="w-5 h-7 rounded border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }
  const suit = suitSymbols[card.suit];
  return (
    <div className={`w-9 h-12 rounded-md bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center text-xs font-bold ${suit.color}`}>
      <span>{card.rank}</span>
      <span className="text-[10px] -mt-0.5">{suit.symbol}</span>
    </div>
  );
};

const PokerTable: React.FC<PokerTableProps> = ({ gameState, availableActions, onAction }) => {
  const { currentHand, players } = gameState;

  return (
    <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '16/10' }}>
      {/* Table felt */}
      <div className="absolute inset-8 rounded-[50%] bg-gradient-to-b from-emerald-700 to-emerald-800 border-[6px] border-emerald-900 shadow-xl">
        {/* Inner rail */}
        <div className="absolute inset-3 rounded-[50%] border border-emerald-600/30" />

        {/* Community cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5">
          {currentHand.communityCards.map((card, i) => (
            <CardComponent key={i} card={card} />
          ))}
          {/* Empty card slots */}
          {Array.from({ length: 5 - currentHand.communityCards.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-9 h-12 rounded-md border border-emerald-600/20" />
          ))}
        </div>

        {/* Pot display */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span className="text-yellow-400 text-sm font-bold">${currentHand.pot}</span>
          </div>
        </div>

        {/* Street indicator */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2">
          <span className="text-emerald-300/60 text-xs font-medium uppercase tracking-wider">
            {currentHand.street}
          </span>
        </div>
      </div>

      {/* Seats */}
      {players.map((player) => {
        const pos = seatLayout[player.position];
        if (!pos) return null;
        const handPlayer = currentHand.players.find((p) => p.playerId === player.playerId);
        const isActive = currentHand.activePlayerId === player.playerId;
        const isFolded = handPlayer?.isFolded;
        const isDealer = currentHand.dealerPosition === player.position;

        return (
          <div
            key={player.playerId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'ring-2 ring-yellow-400 ring-offset-2 bg-slate-800' : 'bg-slate-800/90'
              } ${isFolded ? 'opacity-40' : ''}`}
            >
              {/* Dealer chip */}
              {isDealer && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-400 text-[9px] font-bold text-gray-900 flex items-center justify-center shadow">
                  D
                </div>
              )}

              {/* Hole cards */}
              <div className="flex gap-0.5">
                {handPlayer?.holeCards ? (
                  handPlayer.holeCards.map((card, i) => <CardComponent key={i} card={card} />)
                ) : !isFolded ? (
                  <>
                    <CardComponent card={{ rank: '', suit: 's' }} faceDown />
                    <CardComponent card={{ rank: '', suit: 's' }} faceDown />
                  </>
                ) : null}
              </div>

              {/* Player info */}
              <div className="text-center min-w-[70px]">
                <div className="text-xs font-semibold text-white truncate">{player.name}</div>
                <div className="text-[10px] text-gray-400">{player.position}</div>
                <div className="text-xs font-mono text-yellow-300">${handPlayer?.chipStack ?? player.chipStack}</div>
              </div>

              {/* Current bet */}
              {handPlayer && handPlayer.bet > 0 && (
                <div className="absolute -bottom-5 bg-yellow-400/90 rounded-full px-2 py-0.5">
                  <span className="text-[10px] font-bold text-gray-900">${handPlayer.bet}</span>
                </div>
              )}

              {/* All-in badge */}
              {handPlayer?.isAllIn && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full px-2 py-0.5">
                  <span className="text-[9px] font-bold text-white uppercase">All-In</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Session info */}
      <div className="absolute bottom-0 left-0 text-xs text-gray-400 space-x-3">
        <span>Hand #{gameState.handCount}</span>
        <span>Blinds {gameState.blindLevel}</span>
        {gameState.sessionProfit != null && (
          <span className={gameState.sessionProfit >= 0 ? 'text-emerald-500' : 'text-red-400'}>
            {gameState.sessionProfit >= 0 ? '+' : ''}{gameState.sessionProfit}
          </span>
        )}
      </div>
    </div>
  );
};

export default PokerTable;