import React, { useState, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface Pot {
  main: number;
  sidePots?: { amount: number; eligiblePlayers: number[] }[];
  total: number;
}

interface LegalAction {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  minAmount?: number;
  maxAmount?: number;
}

interface HandPlayer {
  seatIndex: number;
  playerName: string;
  chipCount: number;
  status: 'active' | 'folded' | 'all-in' | 'busted';
  currentBet: number;
  holeCards?: Card[];
  isDealer?: boolean;
  position?: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
}

interface ActionRecord {
  seatIndex: number;
  playerName: string;
  action: string;
  amount?: number;
  street: string;
  potAfter?: number;
  timestamp: string;
}

interface HandResult {
  winners: {
    seatIndex: number;
    playerName: string;
    amount: number;
    handStrength?: string;
    holeCards?: Card[];
  }[];
  potResults: {
    potName: string;
    amount: number;
    winnerSeatIndex: number;
  }[];
  showdownPlayers?: {
    seatIndex: number;
    holeCards: Card[];
    handStrength?: string;
  }[];
}

interface HandState {
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  pot: Pot;
  communityCards: Card[];
  players: HandPlayer[];
  isUserTurn: boolean;
  legalActions?: LegalAction[];
  currentActorIndex?: number;
  dealerSeatIndex: number;
  actionHistory: ActionRecord[];
  handResult?: HandResult;
}

interface PokerTableProps {
  handState: HandState;
  onAction: (action: string, amount?: number) => void;
}

// ── Helpers ──────────────────────────────────────────────────
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-600',
};

function formatChips(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// Seat positions around an oval table (percentages for absolute positioning)
// Order: bottom-center (user), then clockwise
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '82%', left: '50%' },   // Seat 0 — bottom center (user)
  { top: '70%', left: '12%' },   // Seat 1 — bottom-left
  { top: '22%', left: '8%' },    // Seat 2 — top-left
  { top: '8%', left: '50%' },    // Seat 3 — top center
  { top: '22%', left: '92%' },   // Seat 4 — top-right
  { top: '70%', left: '88%' },   // Seat 5 — bottom-right
];

// Bet chip positions (closer to center than seats)
const BET_POSITIONS: { top: string; left: string }[] = [
  { top: '68%', left: '50%' },
  { top: '60%', left: '24%' },
  { top: '36%', left: '22%' },
  { top: '28%', left: '50%' },
  { top: '36%', left: '78%' },
  { top: '60%', left: '76%' },
];

// ── Sub-components ───────────────────────────────────────────

function CardView({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col items-center justify-center leading-none">
      <span className={`text-sm font-bold ${SUIT_COLORS[card.suit]}`}>{card.rank}</span>
      <span className={`text-base ${SUIT_COLORS[card.suit]}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

function PlayerSeat({
  player,
  isCurrentActor,
  isUser,
}: {
  player: HandPlayer;
  isCurrentActor: boolean;
  isUser: boolean;
}) {
  const isFolded = player.status === 'folded';
  const isBusted = player.status === 'busted';
  const isAllIn = player.status === 'all-in';

  return (
    <div className={`flex flex-col items-center gap-1 ${isFolded || isBusted ? 'opacity-50' : ''}`}>
      {/* Hole cards */}
      <div className="flex gap-0.5 h-14">
        {player.holeCards && player.holeCards.length === 2 ? (
          <>
            <CardView card={player.holeCards[0]} />
            <CardView card={player.holeCards[1]} />
          </>
        ) : player.status === 'active' || isAllIn ? (
          <>
            <CardView faceDown />
            <CardView faceDown />
          </>
        ) : null}
      </div>

      {/* Player info chip */}
      <div
        className={`
          relative px-3 py-1.5 rounded-xl text-center min-w-[100px] border-2
          ${isCurrentActor ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-transparent'}
          ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-100'}
        `}
      >
        {player.isDealer && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold flex items-center justify-center shadow">
            D
          </span>
        )}
        <div className="text-xs font-semibold truncate max-w-[90px]">{player.playerName}</div>
        <div className="text-sm font-bold">{formatChips(player.chipCount)} BB</div>
        {player.position && (
          <span className="text-[10px] text-gray-300 uppercase">{player.position}</span>
        )}
        {isAllIn && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
            ALL IN
          </span>
        )}
      </div>
    </div>
  );
}

function CommunityCards({ cards, street }: { cards: Card[]; street: string }) {
  const totalSlots = 5;
  const slots: (Card | null)[] = [];
  for (let i = 0; i < totalSlots; i++) {
    slots.push(i < cards.length ? cards[i] : null);
  }

  return (
    <div className="flex gap-1.5">
      {slots.map((card, i) => (
        <div key={i}>
          {card ? (
            <CardView card={card} />
          ) : (
            <div className="w-10 h-14 rounded-lg border border-emerald-600/40 bg-emerald-900/30" />
          )}
        </div>
      ))}
    </div>
  );
}

function PotDisplay({ pot }: { pot: Pot }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="bg-black/40 backdrop-blur-sm text-yellow-300 text-sm font-bold px-4 py-1.5 rounded-full">
        Pot: {formatChips(pot.total)} BB
      </div>
      {pot.sidePots && pot.sidePots.length > 0 && (
        <div className="flex gap-2">
          {pot.sidePots.map((sp, i) => (
            <span key={i} className="bg-black/30 text-yellow-200 text-xs px-2 py-0.5 rounded-full">
              Side {i + 1}: {formatChips(sp.amount)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBar({
  legalActions,
  onAction,
  isUserTurn,
}: {
  legalActions: LegalAction[];
  onAction: (action: string, amount?: number) => void;
  isUserTurn: boolean;
}) {
  const [betAmount, setBetAmount] = useState<number>(0);

  const betAction = legalActions.find((a) => a.action === 'bet' || a.action === 'raise');
  const minBet = betAction?.minAmount ?? 0;
  const maxBet = betAction?.maxAmount ?? 0;

  const actionButtons = useMemo(() => {
    const buttons: { action: string; label: string; color: string; needsAmount: boolean }[] = [];
    for (const la of legalActions) {
      switch (la.action) {
        case 'fold':
          buttons.push({ action: 'fold', label: 'Fold', color: 'bg-gray-600 hover:bg-gray-500', needsAmount: false });
          break;
        case 'check':
          buttons.push({ action: 'check', label: 'Check', color: 'bg-emerald-600 hover:bg-emerald-500', needsAmount: false });
          break;
        case 'call':
          buttons.push({ action: 'call', label: `Call${la.minAmount ? ` ${la.minAmount}` : ''}`, color: 'bg-emerald-600 hover:bg-emerald-500', needsAmount: false });
          break;
        case 'bet':
          buttons.push({ action: 'bet', label: 'Bet', color: 'bg-blue-600 hover:bg-blue-500', needsAmount: true });
          break;
        case 'raise':
          buttons.push({ action: 'raise', label: 'Raise', color: 'bg-blue-600 hover:bg-blue-500', needsAmount: true });
          break;
        case 'all-in':
          buttons.push({ action: 'all-in', label: 'All In', color: 'bg-red-500 hover:bg-red-400', needsAmount: false });
          break;
      }
    }
    return buttons;
  }, [legalActions]);

  if (!isUserTurn) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Waiting for opponent...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {actionButtons.map((btn) => (
        <React.Fragment key={btn.action}>
          {btn.needsAmount && (
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5">
              <input
                type="range"
                min={minBet}
                max={maxBet}
                value={betAmount || minBet}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-24 accent-blue-500"
              />
              <input
                type="number"
                min={minBet}
                max={maxBet}
                value={betAmount || minBet}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-16 bg-slate-600 text-white text-sm text-center rounded px-1 py-1 border border-slate-500"
              />
            </div>
          )}
          <button
            onClick={() => btn.needsAmount ? onAction(btn.action, betAmount || minBet) : onAction(btn.action)}
            className={`${btn.color} text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-md active:scale-95`}
          >
            {btn.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function HandResultOverlay({ result, onDismiss }: { result: HandResult; onDismiss: () => void }) {
  const mainWinner = result.winners[0];
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl px-8 py-6 text-center shadow-2xl max-w-sm">
        <div className="text-yellow-400 text-lg font-bold mb-1">🏆 Winner</div>
        <div className="text-white text-xl font-bold">{mainWinner.playerName}</div>
        {mainWinner.handStrength && (
          <div className="text-emerald-400 text-sm mt-1">{mainWinner.handStrength}</div>
        )}
        <div className="text-yellow-300 text-2xl font-bold mt-2">
          +{formatChips(mainWinner.amount)} BB
        </div>
        {mainWinner.holeCards && (
          <div className="flex justify-center gap-1 mt-3">
            {mainWinner.holeCards.map((c, i) => (
              <CardView key={i} card={c} />
            ))}
          </div>
        )}
        {result.showdownPlayers && result.showdownPlayers.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-600">
            <div className="text-gray-400 text-xs mb-2">Showdown</div>
            <div className="flex justify-center gap-4">
              {result.showdownPlayers
                .filter((sp) => sp.seatIndex !== mainWinner.seatIndex)
                .map((sp) => (
                  <div key={sp.seatIndex} className="flex gap-0.5">
                    {sp.holeCards.map((c, i) => (
                      <CardView key={i} card={c} />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
        <button
          onClick={onDismiss}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
        >
          Next Hand
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function PokerTable({ handState, onAction }: PokerTableProps) {
  const [showResult, setShowResult] = useState(!!handState.handResult);

  // Find user seat index
  const userSeatIndex = 0; // By convention, seat 0 is the user

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="text-gray-100 font-semibold text-sm">
          Hand #{handState.handNumber}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs uppercase tracking-wider">
            {handState.street}
          </span>
          <span className="bg-emerald-600/20 text-emerald-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
            6-Max NL Hold'em
          </span>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-[16/10]">
          {/* Felt oval */}
          <div
            className="absolute inset-[8%] rounded-[50%] bg-gradient-to-b from-emerald-700 to-emerald-800 border-[6px] border-emerald-900 shadow-[inset_0_4px_30px_rgba(0,0,0,0.4),0_8px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Rail */}
            <div className="absolute -inset-3 rounded-[50%] border-4 border-amber-900/60 pointer-events-none" />
          </div>

          {/* Community cards + Pot (centered on table) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <CommunityCards cards={handState.communityCards} street={handState.street} />
            <PotDisplay pot={handState.pot} />
          </div>

          {/* Player seats */}
          {handState.players.map((player, i) => (
            <div
              key={player.seatIndex}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                top: SEAT_POSITIONS[i].top,
                left: SEAT_POSITIONS[i].left,
              }}
            >
              <PlayerSeat
                player={player}
                isCurrentActor={handState.currentActorIndex === player.seatIndex}
                isUser={player.seatIndex === userSeatIndex}
              />
            </div>
          ))}

          {/* Bet chips */}
          {handState.players.map((player, i) =>
            player.currentBet > 0 ? (
              <div
                key={`bet-${player.seatIndex}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  top: BET_POSITIONS[i].top,
                  left: BET_POSITIONS[i].left,
                }}
              >
                <div className="bg-black/40 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {formatChips(player.currentBet)}
                </div>
              </div>
            ) : null,
          )}

          {/* Hand result overlay */}
          {handState.handResult && showResult && (
            <HandResultOverlay
              result={handState.handResult}
              onDismiss={() => setShowResult(false)}
            />
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="bg-slate-800 border-t border-slate-700">
        <ActionBar
          legalActions={handState.legalActions ?? []}
          onAction={onAction}
          isUserTurn={handState.isUserTurn}
        />
      </div>
    </div>
  );
}