import React, { useState, useCallback, useMemo } from 'react';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';
import ActionPanel from './ActionPanel';
import HandResultModal from './HandResultModal';
import ConfirmDialog from './ConfirmDialog';

// ─── Shared types (matching sibling components) ───────────────────────
export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface Player {
  seat: number;
  name: string;
  stack: number;
  isHuman: boolean;
  isActive: boolean;
  position?: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  holeCards?: Card[];
  status?: 'waiting' | 'acting' | 'folded' | 'allin' | 'eliminated';
}

export interface Pot {
  amount: number;
  eligiblePlayers: number[];
  isMainPot?: boolean;
}

export interface ActionRecord {
  seat: number;
  playerName?: string;
  action: string;
  amount?: number;
  street: string;
  timestamp: string;
}

export interface HandResult {
  handId: string;
  winners: { seat: number; playerName: string; amount: number; handRank?: string; bestHand?: Card[] }[];
  playerResults: {
    seat: number;
    playerName: string;
    holeCards?: Card[];
    handRank?: string | null;
    chipChange: number;
    finalStack: number;
  }[];
  isShowdown?: boolean;
  highlights?: { type: string; description: string }[];
  timestamp: string;
}

export interface HandState {
  id: string;
  sessionId: string;
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete';
  players: Player[];
  communityCards: Card[];
  pots: Pot[];
  actionOn: number;
  dealerSeat: number;
  currentBet?: number;
  minRaise?: number;
  actions: ActionRecord[];
  isComplete?: boolean;
  result?: HandResult | null;
}

export interface AvailableAction {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';
  isAvailable: boolean;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  quickAmounts?: { label: string; amount: number }[];
}

export interface AvailableActions {
  actions: AvailableAction[];
  potSize: number;
  playerStack: number;
  amountToCall?: number;
}

export interface PokerTableProps {
  handState: HandState;
  availableActions?: AvailableActions;
  onPlayerAction: (action: string, amount?: number) => void;
  onNextHand: () => void;
  onEndSession: () => void;
  onReplayHand: (handId: string) => void;
}

// ─── 6-seat ellipse positions (percentages) ───────────────────────────
// Seat layout for a 6-max table viewed from above:
//   Seat 3 (top-left)    Seat 4 (top-right)
//   Seat 2 (left)                 Seat 5 (right)
//   Seat 1 (bottom-left) Seat 0 (bottom-right = hero)
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '65%' },  // Seat 0 — Hero (bottom-right)
  { top: '78%', left: '25%' },  // Seat 1 — bottom-left
  { top: '42%', left: '3%' },   // Seat 2 — left
  { top: '6%', left: '25%' },   // Seat 3 — top-left
  { top: '6%', left: '65%' },   // Seat 4 — top-right
  { top: '42%', left: '90%' },  // Seat 5 — right
];

const PokerTable: React.FC<PokerTableProps> = ({
  handState,
  availableActions,
  onPlayerAction,
  onNextHand,
  onEndSession,
  onReplayHand,
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const humanPlayer = useMemo(
    () => handState.players.find((p) => p.isHuman),
    [handState.players],
  );

  const isHumanTurn = useMemo(
    () => humanPlayer != null && handState.actionOn === humanPlayer.seat,
    [humanPlayer, handState.actionOn],
  );

  const showResultModal = handState.isComplete && handState.result != null;

  const handleEndSession = useCallback(() => {
    setShowEndConfirm(true);
  }, []);

  const confirmEndSession = useCallback(() => {
    setShowEndConfirm(false);
    onEndSession();
  }, [onEndSession]);

  const handleReplay = useCallback(() => {
    if (handState.result) {
      onReplayHand(handState.result.handId);
    }
  }, [handState.result, onReplayHand]);

  // Latest action for each seat (for action indicator)
  const latestActions = useMemo(() => {
    const map: Record<number, ActionRecord> = {};
    const currentStreetActions = handState.actions.filter((a) => a.street === handState.street);
    for (const action of currentStreetActions) {
      map[action.seat] = action;
    }
    return map;
  }, [handState.actions, handState.street]);

  // Filter available actions to only those that are available
  const activeActions = useMemo(
    () => availableActions?.actions.filter((a) => a.isAvailable) ?? [],
    [availableActions],
  );

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col items-center justify-center bg-gray-900 overflow-hidden select-none">
      {/* Hand info header */}
      <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700/50">
          <span className="text-gray-400 text-xs">Hand</span>
          <span className="text-white text-sm font-bold ml-1.5 tabular-nums">#{handState.handNumber}</span>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700/50">
          <span className="text-gray-400 text-xs">Street</span>
          <span className="text-emerald-400 text-sm font-semibold ml-1.5 capitalize">{handState.street}</span>
        </div>
      </div>

      {/* End session button */}
      <button
        onClick={handleEndSession}
        className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700/50 text-gray-400 text-xs font-medium hover:text-white hover:border-gray-600 transition-colors"
      >
        结束牌局
      </button>

      {/* Table felt — elliptical shape */}
      <div className="relative w-[720px] h-[420px] shrink-0">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-[50%] border-[6px] border-emerald-900 shadow-2xl shadow-black/50"
          style={{
            background: 'radial-gradient(ellipse at center, #166534 0%, #14532d 50%, #052e16 100%)',
          }}
        />

        {/* Inner felt line */}
        <div className="absolute inset-6 rounded-[50%] border-2 border-emerald-700/40" />

        {/* Community cards — center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <PotDisplay pots={handState.pots} />
            <CommunityCards cards={handState.communityCards} street={handState.street} />
          </div>
        </div>

        {/* Player seats */}
        {handState.players.map((player, i) => {
          const pos = SEAT_POSITIONS[player.seat] ?? SEAT_POSITIONS[i];
          const isDealer = handState.dealerSeat === player.seat;
          const isActionOn = handState.actionOn === player.seat;
          const isBotThinking = !player.isHuman && isActionOn && !handState.isComplete;
          const showHoleCards = player.isHuman || handState.street === 'showdown' || handState.isComplete === true;
          const latestAction = latestActions[player.seat];

          return (
            <div
              key={player.seat}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="relative">
                <PlayerSeat
                  player={player}
                  isDealer={isDealer}
                  isActionOn={isActionOn}
                  isBotThinking={isBotThinking}
                  showHoleCards={showHoleCards}
                />
                {/* Latest action badge */}
                {latestAction && !['post_sb', 'post_bb'].includes(latestAction.action) && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className={`
                        px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                        ${latestAction.action === 'fold'
                          ? 'bg-gray-700 text-gray-400'
                          : latestAction.action === 'allin'
                            ? 'bg-red-600/30 text-red-400 border border-red-500/40'
                            : latestAction.action === 'raise' || latestAction.action === 'bet'
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-700/60 text-gray-300 border border-gray-600/40'
                        }
                      `}
                    >
                      {latestAction.action}
                      {latestAction.amount != null && latestAction.amount > 0 && ` ${latestAction.amount.toFixed(1)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action panel — fixed at bottom */}
      {isHumanTurn && availableActions && activeActions.length > 0 && (
        <div className="w-full max-w-xl px-4 mt-4">
          <ActionPanel
            availableActions={activeActions}
            potSize={availableActions.potSize}
            playerStack={availableActions.playerStack}
            amountToCall={availableActions.amountToCall ?? 0}
            onAction={onPlayerAction}
            disabled={false}
          />
        </div>
      )}

      {/* Hand result modal */}
      {showResultModal && handState.result && (
        <HandResultModal
          result={handState.result}
          open={true}
          onNextHand={onNextHand}
          onReplay={handleReplay}
          onEndSession={handleEndSession}
        />
      )}

      {/* End session confirmation */}
      <ConfirmDialog
        open={showEndConfirm}
        title="结束牌局"
        message="确定要结束当前牌局吗？当前手牌进度将丢失。"
        confirmLabel="确认结束"
        cancelLabel="继续游戏"
        onConfirm={confirmEndSession}
        onCancel={() => setShowEndConfirm(false)}
        variant="warning"
      />
    </div>
  );
};

export default PokerTable;