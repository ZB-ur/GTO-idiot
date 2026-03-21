import React, { useMemo } from 'react';
import { PlayerSeat, Player, SeatPosition } from './PlayerSeat';
import { CommunityCards, Card } from './CommunityCards';
import { PotDisplay, SidePot } from './PotDisplay';
import { ActionPanel } from './ActionPanel';

// ─── API-aligned types ───────────────────────────────────────────
export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';
export type HandPhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'settled';
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface HandPlayer {
  seat: number;
  name: string;
  stackBB: number;
  position: Position;
  isActive: boolean;
  isAllIn?: boolean;
  currentBet: number;
  holeCards?: [Card, Card] | null;
  lastAction?: ActionType | null;
  isHuman?: boolean;
  botStyle?: string;
}

export interface Pot {
  amount: number;
  eligibleSeats: number[];
}

export interface HandState {
  id: string;
  sessionId: string;
  handNumber: number;
  phase: HandPhase;
  players: HandPlayer[];
  communityCards: Card[];
  pots: Pot[];
  currentActingSeat: number | null;
  dealerSeat: number;
  userHoleCards?: [Card, Card];
}

export interface LegalAction {
  type: ActionType;
  minAmount?: number;
  maxAmount?: number;
  callAmount?: number;
}

export interface AvailableActions {
  handId: string;
  seat: number;
  actions: LegalAction[];
}

export interface SessionInfo {
  startedAt: string;
  handCount: number;
  profitLossBB: number;
}

export interface PokerTableProps {
  handState: HandState;
  availableActions?: AvailableActions;
  isUserTurn: boolean;
  onAction: (action: { type: string; amount?: number }) => void;
  onPause: () => void;
  onEnd: () => void;
  sessionInfo: SessionInfo;
}

// ─── Seat layout for 6-max elliptical table ──────────────────────
// Clockwise: 0=bottom-center(user), 1=bottom-right, 2=top-right, 3=top-center, 4=top-left, 5=bottom-left
const SEAT_LAYOUT: { seatPosition: SeatPosition; style: React.CSSProperties }[] = [
  {
    seatPosition: 'bottom-left',
    style: { position: 'absolute', bottom: '-48px', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    seatPosition: 'bottom-right',
    style: { position: 'absolute', bottom: '-24px', right: '4%', transform: 'translateX(0)' },
  },
  {
    seatPosition: 'top-right',
    style: { position: 'absolute', top: '-24px', right: '4%', transform: 'translateX(0)' },
  },
  {
    seatPosition: 'top-left',
    style: { position: 'absolute', top: '-48px', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    seatPosition: 'top-left',
    style: { position: 'absolute', top: '-24px', left: '4%', transform: 'translateX(0)' },
  },
  {
    seatPosition: 'bottom-left',
    style: { position: 'absolute', bottom: '-24px', left: '4%', transform: 'translateX(0)' },
  },
];

const PHASE_LABELS: Record<HandPhase, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
  settled: 'Settled',
};

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const mins = Math.floor((now - start) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatProfit(bb: number): string {
  const prefix = bb > 0 ? '+' : '';
  return `${prefix}${bb.toFixed(1)} BB`;
}

/**
 * PokerTable — 6-player poker table main view.
 * Renders an elliptical felt surface with seated players, community cards,
 * pot display, session status bar, and action panel.
 */
export const PokerTable: React.FC<PokerTableProps> = ({
  handState,
  availableActions,
  isUserTurn,
  onAction,
  onPause,
  onEnd,
  sessionInfo,
}) => {
  const { players, communityCards, pots, currentActingSeat, dealerSeat, phase, handNumber } = handState;

  // Compute main pot and side pots for PotDisplay
  const mainPot = pots[0]?.amount ?? 0;
  const sidePots: SidePot[] | undefined = pots.length > 1
    ? pots.slice(1).map((p) => ({ amount: p.amount, eligiblePlayers: p.eligibleSeats }))
    : undefined;

  // Map available actions to ActionPanel format
  const actionPanelActions = useMemo(() => {
    if (!availableActions) return [];
    return availableActions.actions.map((a) => ({
      actionType: a.type as 'fold' | 'check' | 'call' | 'raise' | 'all_in',
      minAmount: a.minAmount ?? a.callAmount,
      maxAmount: a.maxAmount,
    }));
  }, [availableActions]);

  const totalPot = pots.reduce((sum, p) => sum + p.amount, 0);

  const handleAction = (actionType: string, amount?: number) => {
    onAction({ type: actionType, amount });
  };

  const isShowdown = phase === 'showdown' || phase === 'settled';

  // Convert HandPlayer to PlayerSeat-compatible Player
  const mapToPlayer = (hp: HandPlayer): Player => ({
    seatIndex: hp.seat,
    name: hp.name,
    chips: hp.stackBB,
    position: hp.position as any,
    isHuman: hp.isHuman ?? false,
    isActive: hp.isActive,
    botStyle: hp.botStyle as any,
    holeCards: hp.holeCards ?? undefined,
    currentBet: hp.currentBet > 0 ? hp.currentBet : undefined,
  });

  const profitColor = sessionInfo.profitLossBB > 0
    ? 'text-green-400'
    : sessionInfo.profitLossBB < 0
      ? 'text-red-400'
      : 'text-gray-300';

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* ── Session Status Bar ── */}
      <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Hand # */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">Hand</span>
            <span className="text-white text-sm font-semibold tabular-nums">#{handNumber}</span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          {/* Phase */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">Phase</span>
            <span className="text-emerald-400 text-sm font-semibold">{PHASE_LABELS[phase]}</span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          {/* Hands played */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">Played</span>
            <span className="text-white text-sm font-semibold tabular-nums">{sessionInfo.handCount}</span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          {/* Profit */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">P/L</span>
            <span className={`text-sm font-semibold tabular-nums ${profitColor}`}>
              {formatProfit(sessionInfo.profitLossBB)}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          {/* Duration */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">Time</span>
            <span className="text-gray-300 text-sm font-medium">{formatDuration(sessionInfo.startedAt)}</span>
          </div>
        </div>

        {/* Session controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm5 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </button>
          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4z" clipRule="evenodd" />
            </svg>
            End Session
          </button>
        </div>
      </div>

      {/* ── Table Area ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-4xl" style={{ aspectRatio: '16 / 9' }}>
          {/* Outer table rail */}
          <div
            className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-amber-900 to-amber-950 shadow-2xl"
            style={{ padding: '12px' }}
          >
            {/* Felt surface */}
            <div className="w-full h-full rounded-[50%] bg-gradient-to-br from-emerald-800 to-emerald-900 border-4 border-emerald-700/50 shadow-inner relative overflow-visible">
              {/* Center: Pot + Community Cards */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <PotDisplay mainPot={mainPot} sidePots={sidePots} />
                <CommunityCards cards={communityCards} />
              </div>
            </div>
          </div>

          {/* Player seats around the table */}
          {players.map((hp) => {
            const layout = SEAT_LAYOUT[hp.seat];
            if (!layout) return null;

            const player = mapToPlayer(hp);

            return (
              <div key={hp.seat} style={layout.style} className="z-10">
                <PlayerSeat
                  player={player}
                  isCurrentActor={currentActingSeat === hp.seat}
                  isDealer={dealerSeat === hp.seat}
                  isThinking={currentActingSeat === hp.seat && !hp.isHuman}
                  showCards={isShowdown || (hp.isHuman ?? false)}
                  position={layout.seatPosition}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Action Panel (bottom) ── */}
      <div className="flex-shrink-0 bg-slate-800 border-t border-gray-700">
        <ActionPanel
          availableActions={actionPanelActions}
          potSize={totalPot}
          isActive={isUserTurn}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default PokerTable;