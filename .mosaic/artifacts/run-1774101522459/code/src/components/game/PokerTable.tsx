// ============================================================
// PokerTable — Oval table layout with 6 player seats, community
// cards, pot display, and action panel
// ============================================================

import React, { useMemo } from 'react';
import type {
  HandState,
  AvailableActions,
  HandSettlement,
  PlayerAction,
  Session,
} from '../../types';
import type { GameLoopPhase } from './useGameLoop';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';
import ActionPanel from './ActionPanel';
import ConfirmDialog from './ConfirmDialog';

export interface PokerTableProps {
  session: Session;
  handState: HandState | null;
  availableActions: AvailableActions | null;
  settlement: HandSettlement | null;
  phase: GameLoopPhase;
  onAction: (action: PlayerAction) => void;
  onStartHand: () => void;
  error: string | null;
  handCount: number;
}

/**
 * 6-max seat positions placed around an oval table.
 * Positions are ordered so seat 0 = bottom-center (human default).
 * Coordinates are percentages of the table container.
 */
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // Seat 0 — bottom center
  { top: '65%', left: '12%' },   // Seat 1 — bottom left
  { top: '18%', left: '12%' },   // Seat 2 — top left
  { top: '5%',  left: '50%' },   // Seat 3 — top center
  { top: '18%', left: '88%' },   // Seat 4 — top right
  { top: '65%', left: '88%' },   // Seat 5 — bottom right
];

const PokerTable: React.FC<PokerTableProps> = ({
  session,
  handState,
  availableActions,
  settlement,
  phase,
  onAction,
  onStartHand,
  error,
  handCount,
}) => {
  // Identify human player seat
  const humanSeat = useMemo(
    () => session.players.find((p) => p.isHuman)?.seat ?? 0,
    [session.players],
  );

  // Determine winner seats
  const winnerSeats = useMemo(() => {
    if (!settlement) return new Set<number>();
    return new Set(settlement.winners.map((w) => w.seat));
  }, [settlement]);

  // Confirm dialog state for fold protection
  const [confirmAction, setConfirmAction] = React.useState<PlayerAction | null>(null);

  const handleConfirmRequired = React.useCallback((action: PlayerAction) => {
    setConfirmAction(action);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (confirmAction) {
      onAction(confirmAction);
      setConfirmAction(null);
    }
  }, [confirmAction, onAction]);

  const handleCancelConfirm = React.useCallback(() => {
    setConfirmAction(null);
  }, []);

  // Total pot for action panel
  const totalPot = useMemo(() => {
    if (!handState) return 0;
    return handState.pots.reduce((sum, p) => sum + p.amount, 0);
  }, [handState]);

  // Is it the human's turn?
  const isHumanTurn = phase === 'player_turn' && availableActions !== null;

  // Can start a new hand?
  const canStartHand = phase === 'idle' || phase === 'settled';

  const isDealing = phase === 'dealing';

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10]">
      {/* Table felt */}
      <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-felt to-felt-dark border-4 border-felt-dark shadow-2xl" />
      {/* Table rail */}
      <div className="absolute inset-[-8px] rounded-[50%] border-8 border-amber-900/60 pointer-events-none" />

      {/* Center area: community cards + pot */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
        {handState && (
          <>
            <CommunityCards
              cards={handState.communityCards}
              phase={handState.phase}
              animate={true}
            />
            <PotDisplay pots={handState.pots} />
          </>
        )}

        {/* Start hand / Next hand button */}
        {canStartHand && (
          <button
            type="button"
            onClick={onStartHand}
            className="mt-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white
              transition-all active:scale-95 shadow-lg animate-fade-in"
          >
            {handCount === 0 ? 'Deal First Hand' : 'Deal Next Hand'}
          </button>
        )}

        {/* Dealing indicator */}
        {isDealing && (
          <div className="text-yellow-300 text-sm font-medium animate-pulse">
            Dealing...
          </div>
        )}

        {/* Settlement summary */}
        {settlement && phase === 'settled' && (
          <div className="bg-black/60 rounded-lg px-4 py-2 text-center animate-fade-in">
            {settlement.wonWithoutShowdown ? (
              <p className="text-yellow-300 text-sm font-semibold">
                {settlement.winners.map((w) => {
                  const player = handState?.players.find((p) => p.seat === w.seat);
                  return player?.name ?? `Seat ${w.seat}`;
                }).join(', ')}{' '}
                wins {settlement.winners.reduce((s, w) => s + w.amountWonBB, 0).toFixed(1)} BB
              </p>
            ) : (
              <div className="space-y-0.5">
                {settlement.showdownHands.map((sh) => {
                  const player = handState?.players.find((p) => p.seat === sh.seat);
                  const isWinner = winnerSeats.has(sh.seat);
                  return (
                    <p
                      key={sh.seat}
                      className={`text-xs ${isWinner ? 'text-yellow-300 font-semibold' : 'text-gray-400'}`}
                    >
                      {player?.name ?? `Seat ${sh.seat}`}: {sh.handRank}
                      {isWinner && ' ★'}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-900/80 text-red-200 text-sm px-4 py-2 rounded-lg mt-1 animate-fade-in">
            {error}
          </div>
        )}
      </div>

      {/* Player seats */}
      {session.players.map((player) => {
        const seatPos = SEAT_POSITIONS[player.seat] ?? SEAT_POSITIONS[0];
        const handPlayer = handState?.players.find((hp) => hp.seat === player.seat);

        // Determine hole cards visibility
        const isHuman = player.seat === humanSeat;
        const showCards =
          isHuman ||
          handState?.phase === 'showdown' ||
          handState?.phase === 'settled' ||
          (settlement != null && !settlement.wonWithoutShowdown);

        // Which cards to show
        let holeCards = handPlayer?.holeCards ?? null;
        if (isHuman && handState) {
          holeCards = handState.userHoleCards;
        }
        // At showdown, show all revealed hands
        if (settlement && !settlement.wonWithoutShowdown) {
          const showdownHand = settlement.showdownHands.find((sh) => sh.seat === player.seat);
          if (showdownHand) {
            holeCards = showdownHand.holeCards;
          }
        }

        return (
          <div
            key={player.seat}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ top: seatPos.top, left: seatPos.left }}
          >
            {handPlayer ? (
              <PlayerSeat
                player={handPlayer}
                isHuman={isHuman}
                isActing={handState?.currentActingSeat === player.seat && phase !== 'settled'}
                isWinner={winnerSeats.has(player.seat)}
                dealerSeat={handState?.dealerSeat ?? session.dealerSeat}
                holeCards={holeCards}
                showCards={!!showCards}
                animateDeal={isDealing}
              />
            ) : (
              // Pre-hand seat display
              <div className="flex flex-col items-center p-2 rounded-xl bg-felt-dark/60">
                <div className="w-[40px] h-[48px]" />
                <div className="text-center min-w-[80px]">
                  <div className={`text-xs font-semibold truncate ${isHuman ? 'text-yellow-300' : 'text-white'}`}>
                    {player.name}
                  </div>
                  <div className="text-xs text-gray-300 font-mono">
                    {player.stackBB.toFixed(1)} BB
                  </div>
                </div>
                <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                  {player.position}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Action Panel — fixed at bottom */}
      {isHumanTurn && availableActions && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[60%] z-30">
          <ActionPanel
            actions={availableActions.actions}
            potSize={totalPot}
            onAction={onAction}
            onConfirmRequired={handleConfirmRequired}
            disabled={phase !== 'player_turn'}
          />
        </div>
      )}

      {/* Bot thinking indicator */}
      {phase === 'bot_thinking' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-gray-900/80 px-4 py-2 rounded-lg text-gray-300 text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Bot is thinking...
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        title="Confirm Fold"
        message={`The pot is ${totalPot.toFixed(1)} BB. Are you sure you want to fold?`}
        confirmLabel="Fold"
        cancelLabel="Back"
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default React.memo(PokerTable);
