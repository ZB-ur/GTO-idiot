/**
 * PokerTable — the main game view composing all table UI sub-components.
 *
 * Layout: oval table with 6 seats arranged around it, community cards and
 * pot at center, action panel at the bottom, session controls at the top.
 */

import React from 'react';
import { useGameStore } from '../../stores/game-store';
import { useSessionStore } from '../../stores/session-store';
import { useUIStore, uiStore } from '../../stores/ui-store';
import { useGameFlow } from '../../hooks/useGameFlow';
import type { Player } from '../../types';

import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { ActionPanel } from './ActionPanel';
import { HandStrengthIndicator } from './HandStrengthIndicator';
import { SessionControls } from './SessionControls';

/**
 * 6-seat positions mapped to CSS classes for oval layout.
 * Order: [0]=top-left, [1]=top-right, [2]=right, [3]=bottom-right, [4]=bottom-left, [5]=left
 */
const SEAT_POSITIONS: string[] = [
  'top-0 left-1/4 -translate-x-1/2 -translate-y-1/2',       // seat 0: top-left
  'top-0 right-1/4 translate-x-1/2 -translate-y-1/2',       // seat 1: top-right
  'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',       // seat 2: right
  'bottom-0 right-1/4 translate-x-1/2 translate-y-1/2',     // seat 3: bottom-right
  'bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2',     // seat 4: bottom-left
  'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',       // seat 5: left
];

export const PokerTable: React.FC = () => {
  const handState = useGameStore((s) => s.handState);
  const availableActions = useGameStore((s) => s.availableActions);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const currentSession = useSessionStore((s) => s.currentSession);
  const isGTOPanelOpen = useUIStore((s) => s.isGTOPanelOpen);

  const { submitAction, dealNextHand, endSession } = useGameFlow();

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No active session. Start a new game from the home page.
      </div>
    );
  }

  const humanPlayerIndex = currentSession.humanPlayerIndex;

  // If no hand is in progress, show the "Deal Next Hand" prompt
  if (!handState) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <SessionControls
          session={currentSession}
          handNumber={currentSession.handCount}
          onEndSession={endSession}
          onToggleGTOPanel={() => uiStore.toggleGTOPanel()}
          isGTOPanelOpen={isGTOPanelOpen}
          className="w-full max-w-xl"
        />
        <div className="text-gray-300 text-lg font-medium">Ready for the next hand?</div>
        <button
          onClick={dealNextHand}
          className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500
            text-white text-lg font-bold transition-colors active:scale-95 transform
            shadow-lg shadow-emerald-600/30"
        >
          Deal Hand #{currentSession.handCount + 1}
        </button>
      </div>
    );
  }

  const players: Player[] = handState.players;
  const isHandComplete = handState.isHandComplete;
  const isHumanTurn = handState.isHumanTurn;

  return (
    <div className="flex flex-col h-full gap-3 p-2">
      {/* Top: Session controls */}
      <SessionControls
        session={currentSession}
        handNumber={handState.handNumber}
        onEndSession={endSession}
        onToggleGTOPanel={() => uiStore.toggleGTOPanel()}
        isGTOPanelOpen={isGTOPanelOpen}
      />

      {/* Middle: The table */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-2xl aspect-[3/2]">
          {/* Table felt */}
          <div
            className="absolute inset-8 rounded-[50%] bg-gradient-to-br from-green-800 to-green-900
              border-4 border-green-700 shadow-inner"
          />

          {/* Table rail */}
          <div
            className="absolute inset-4 rounded-[50%] border-8 border-gray-800
              bg-transparent shadow-2xl"
          />

          {/* Center: Community cards + Pot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            {/* Street indicator */}
            <div className="text-[0.65rem] font-bold text-green-400/80 uppercase tracking-widest">
              {handState.street}
            </div>

            <PotDisplay pot={handState.pot} />

            <CommunityCards cards={handState.communityCards} />
          </div>

          {/* Player seats */}
          {players.map((player, index) => {
            const isHuman = index === humanPlayerIndex;
            const isCurrentTurn = index === handState.currentPlayerIndex && !isHandComplete;
            // Show cards: human always sees their own; show all on showdown/hand complete
            const showCards = isHuman || isHandComplete;

            return (
              <div
                key={player.id}
                className={`absolute ${SEAT_POSITIONS[index] ?? ''} z-10`}
              >
                <PlayerSeat
                  player={player}
                  isHuman={isHuman}
                  isCurrentTurn={isCurrentTurn}
                  showCards={showCards}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Human player info + action panel */}
      <div className="flex flex-col items-center gap-2 pb-2">
        {/* Hand strength for human player */}
        <HandStrengthIndicator strength={handState.humanHandStrength} />

        {/* Winner announcement */}
        {isHandComplete && handState.winnerInfo && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/50">
              {handState.winnerInfo.winners.map((w) => {
                const winnerPlayer = players.find((p) => p.id === w.playerId);
                return (
                  <div key={w.playerId} className="text-center">
                    <span className="text-yellow-400 font-bold">
                      {winnerPlayer?.name ?? 'Unknown'}
                    </span>
                    <span className="text-gray-300"> wins </span>
                    <span className="text-yellow-400 font-bold tabular-nums">
                      {w.amount.toFixed(0)} BB
                    </span>
                    <span className="text-gray-400 text-xs ml-2">({w.handRank})</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={dealNextHand}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                text-white font-bold transition-colors active:scale-95 transform"
            >
              Next Hand
            </button>
          </div>
        )}

        {/* Action panel (only when it's human's turn and hand not complete) */}
        {isHumanTurn && !isHandComplete && availableActions && (
          <ActionPanel
            availableActions={availableActions}
            onAction={submitAction}
            isProcessing={isProcessing}
          />
        )}

        {/* Waiting for BOTs indicator */}
        {!isHumanTurn && !isHandComplete && (
          <div className="text-sm text-gray-400 animate-pulse">
            Waiting for other players...
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerTable;
