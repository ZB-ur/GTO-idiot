import React from 'react';

// --- Types ---
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface Player {
  id: string;
  nickname: string;
  position: string;
  chipCount: number;
  isUser: boolean;
  isActive: boolean;
  botStyle?: string;
  holeCards?: Card[] | null;
  currentBet?: number;
}

interface Pot {
  amount: number;
  eligiblePlayerIds: string[];
  label?: string;
}

interface AvailableAction {
  type: string;
  isAvailable: boolean;
}

interface AvailableActions {
  actions: AvailableAction[];
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
  potSize?: number;
}

interface GameState {
  gameId: string;
  handNumber: number;
  players: Player[];
  pots: Pot[];
  communityCards: Card[];
  currentStreet: string;
  handPhase: string;
  dealerPosition: number;
  activePlayerIndex: number;
  isUserTurn?: boolean;
  blinds?: { sb: number; bb: number };
}

interface HandResult {
  winnerId: string;
  winnerNickname: string;
  amount: number;
  handRank: string;
  potLabel?: string;
}

interface PokerTableProps {
  gameState: GameState;
  availableActions?: AvailableActions;
  onAction: (action: string, amount?: number) => void;
  readonly?: boolean;
  gtoCoverage?: boolean;
}

// --- Helpers ---
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-500',
  d: 'text-blue-400',
  c: 'text-emerald-400',
};

function CardView({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
        <div className="w-6 h-8 rounded bg-amber-400/20 border border-amber-400/30" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 bg-gray-50 border border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-sm">
      <span className={`text-sm font-bold leading-none ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-xs leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

// Seat positions around an oval (CSS positions in %)
const SEAT_POSITIONS = [
  { top: '78%', left: '50%' },  // 0: bottom center (User typically)
  { top: '65%', left: '10%' },  // 1: bottom-left
  { top: '18%', left: '10%' },  // 2: top-left
  { top: '5%', left: '50%' },   // 3: top center
  { top: '18%', left: '90%' },  // 4: top-right
  { top: '65%', left: '90%' },  // 5: bottom-right
];

const BET_POSITIONS = [
  { top: '62%', left: '50%' },
  { top: '55%', left: '25%' },
  { top: '32%', left: '25%' },
  { top: '25%', left: '50%' },
  { top: '32%', left: '75%' },
  { top: '55%', left: '75%' },
];

function Seat({
  player,
  isDealer,
  isActive,
  seatIndex,
}: {
  player: Player;
  isDealer: boolean;
  isActive: boolean;
  seatIndex: number;
}) {
  const pos = SEAT_POSITIONS[seatIndex];
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Hole cards */}
      <div className="flex gap-0.5">
        {player.holeCards ? (
          player.holeCards.map((c, i) => <CardView key={i} card={c} />)
        ) : player.isActive ? (
          <>
            <CardView faceDown />
            <CardView faceDown />
          </>
        ) : null}
      </div>

      {/* Player chip */}
      <div
        className={`relative px-3 py-1.5 rounded-xl text-center min-w-[80px] border ${
          isActive
            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
            : player.isActive
            ? 'bg-gray-800 border-gray-600'
            : 'bg-gray-800/50 border-gray-700 opacity-50'
        }`}
      >
        <div className="text-xs font-semibold text-gray-50 truncate">{player.nickname}</div>
        <div className="text-[10px] text-gray-400">
          {player.position} · {player.chipCount} BB
        </div>
        {player.botStyle && (
          <span className="absolute -top-2 -right-2 text-[9px] px-1 py-0.5 rounded bg-gray-700 text-gray-300 border border-gray-600">
            {player.botStyle}
          </span>
        )}
        {isDealer && (
          <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-400 text-gray-950 text-[10px] font-bold flex items-center justify-center">
            D
          </span>
        )}
      </div>
    </div>
  );
}

function BetChip({ amount, seatIndex }: { amount: number; seatIndex: number }) {
  const pos = BET_POSITIONS[seatIndex];
  if (!amount) return null;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-300 shadow" />
      <span className="text-xs font-bold text-amber-400">{amount}</span>
    </div>
  );
}

export function PokerTable({
  gameState,
  availableActions,
  onAction,
  readonly = false,
}: PokerTableProps) {
  const [raiseAmount, setRaiseAmount] = React.useState(availableActions?.minRaise ?? 0);

  const totalPot = gameState.pots.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-950 flex flex-col">
      {/* Table Surface */}
      <div className="relative flex-1 mx-auto w-full max-w-4xl">
        {/* Felt oval */}
        <div
          className="absolute top-[12%] left-[8%] right-[8%] bottom-[18%] rounded-[50%] bg-emerald-900 border-4 border-emerald-800 shadow-inner"
          style={{ boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.5)' }}
        />

        {/* Pot Display */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="px-4 py-1.5 bg-gray-900/80 rounded-xl border border-gray-700 backdrop-blur-sm">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Pot</div>
            <div className="text-lg font-bold text-amber-400">{totalPot} BB</div>
          </div>
        </div>

        {/* Community Cards */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5">
          {gameState.communityCards.map((card, i) => (
            <CardView key={i} card={card} />
          ))}
          {/* Placeholder slots */}
          {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-10 h-14 rounded-lg border border-emerald-800/50 bg-emerald-900/30"
            />
          ))}
        </div>

        {/* Seats */}
        {gameState.players.map((player, i) => (
          <Seat
            key={player.id}
            player={player}
            seatIndex={i}
            isDealer={i === gameState.dealerPosition}
            isActive={i === gameState.activePlayerIndex}
          />
        ))}

        {/* Bet chips */}
        {gameState.players.map((player, i) =>
          player.currentBet ? (
            <BetChip key={`bet-${i}`} amount={player.currentBet} seatIndex={i} />
          ) : null,
        )}
      </div>

      {/* Action Panel */}
      {!readonly && gameState.isUserTurn && availableActions && (
        <div className="bg-gray-900 border-t border-gray-700 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2 flex-wrap justify-center">
            {availableActions.actions
              .filter((a) => a.isAvailable)
              .map((action) => {
                const isBetOrRaise = action.type === 'bet' || action.type === 'raise';
                return (
                  <button
                    key={action.type}
                    onClick={() =>
                      onAction(action.type, isBetOrRaise ? raiseAmount : undefined)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      action.type === 'fold'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                        : action.type === 'call' || action.type === 'check'
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                    }`}
                  >
                    {action.type === 'call' && availableActions.callAmount
                      ? `Call ${availableActions.callAmount}`
                      : action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                  </button>
                );
              })}

            {/* Raise slider */}
            {availableActions.actions.some(
              (a) => (a.type === 'raise' || a.type === 'bet') && a.isAvailable,
            ) && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="range"
                  min={availableActions.minRaise ?? 0}
                  max={availableActions.maxRaise ?? 100}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="w-28 accent-amber-400"
                />
                <span className="text-sm font-bold text-amber-400 min-w-[40px]">
                  {raiseAmount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}