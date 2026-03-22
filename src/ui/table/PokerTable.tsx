import React from 'react';
import type { GameState } from '../../types';
import SeatPosition from './SeatPosition';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';

export interface PokerTableProps {
  gameState: GameState;
}

/**
 * Seat layout positions for a 6-max table (oval shape).
 * Index maps to seat order: 0=bottom-center(hero), then clockwise.
 * We position seats using absolute positioning relative to the table container.
 */
const seatPositions: { top: string; left: string; transform: string }[] = [
  // Seat 0 - bottom center (typically the human player)
  { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Seat 1 - bottom-left
  { top: '70%', left: '10%', transform: 'translate(-50%, -50%)' },
  // Seat 2 - top-left
  { top: '15%', left: '10%', transform: 'translate(-50%, -50%)' },
  // Seat 3 - top-center
  { top: '5%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Seat 4 - top-right
  { top: '15%', left: '90%', transform: 'translate(-50%, -50%)' },
  // Seat 5 - bottom-right
  { top: '70%', left: '90%', transform: 'translate(-50%, -50%)' },
];

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  const hand = gameState.currentHand;
  const humanIndex = gameState.players.findIndex((p) => p.isHuman);

  // Reorder players so the human player is at seat 0 (bottom center)
  const orderedPlayers = gameState.players.map((_, i) => {
    const idx = (humanIndex + i) % gameState.players.length;
    return gameState.players[idx];
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10]" aria-label="Poker table">
      {/* Table felt */}
      <div
        className="
          absolute inset-[8%] rounded-[50%]
          bg-gradient-to-br from-green-800 via-green-700 to-green-800
          border-[8px] border-amber-900
          shadow-[inset_0_0_60px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.3)]
        "
      >
        {/* Table rail */}
        <div className="absolute inset-0 rounded-[50%] border-[3px] border-amber-800/50 pointer-events-none" />

        {/* Inner felt texture line */}
        <div className="absolute inset-4 rounded-[50%] border border-green-600/20 pointer-events-none" />
      </div>

      {/* Community cards - center of table */}
      <div
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <CommunityCards cards={hand?.communityCards ?? []} />
      </div>

      {/* Pot display - below community cards */}
      <div
        className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <PotDisplay
          amount={hand?.pot ?? 0}
          sidePots={hand?.sidePots?.map((sp) => ({ amount: sp.amount }))}
        />
      </div>

      {/* Hand status overlay */}
      {hand?.status === 'showdown' && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/70 backdrop-blur-sm text-yellow-300 text-lg font-bold px-6 py-2 rounded-full border border-yellow-500/30 shadow-lg">
            Showdown
          </div>
        </div>
      )}

      {hand?.status === 'concluded' && hand.result && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 z-20">
          <div
            className={`
              backdrop-blur-sm text-lg font-bold px-6 py-2 rounded-full border shadow-lg
              ${hand.result.playerProfit >= 0
                ? 'bg-green-900/70 text-green-300 border-green-500/30'
                : 'bg-red-900/70 text-red-300 border-red-500/30'
              }
            `}
          >
            {hand.result.playerProfit >= 0 ? '+' : ''}
            {hand.result.playerProfit.toLocaleString()}
          </div>
        </div>
      )}

      {/* Seat positions */}
      {orderedPlayers.map((player, seatIndex) => {
        const pos = seatPositions[seatIndex];
        const handPlayer = hand?.players.find((hp) => hp.playerId === player.playerId);
        const isDealer = hand ? player.position === hand.dealerPosition : false;
        const isActiveSeat = hand?.activePlayerId === player.playerId;

        return (
          <div
            key={player.playerId}
            className="absolute z-10"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.transform,
            }}
          >
            <SeatPosition
              player={player}
              handPlayer={handPlayer}
              isDealer={isDealer}
              isActive={isActiveSeat}
            />
          </div>
        );
      })}

      {/* Street indicator */}
      {hand && hand.status === 'in_progress' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full">
            {hand.street}
          </span>
        </div>
      )}
    </div>
  );
};

export default PokerTable;
