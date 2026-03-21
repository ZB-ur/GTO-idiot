// ============================================================
// HandReplayViewer — Visual table state during replay
// Shows community cards, player positions, pot, and highlights
// ============================================================

import React, { useMemo } from 'react';
import type { Card as CardType } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types';
import type { ReplayState, ReplayPlayer } from '../../replay/replay-engine';

interface HandReplayViewerProps {
  state: ReplayState;
  className?: string;
}

// ============================================================
// Seat positions for 6-max (oval table layout)
// ============================================================

const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '75%', left: '50%' },  // Seat 0 — bottom center
  { top: '60%', left: '12%' },  // Seat 1 — bottom left
  { top: '18%', left: '12%' },  // Seat 2 — top left
  { top: '5%', left: '50%' },   // Seat 3 — top center
  { top: '18%', left: '88%' },  // Seat 4 — top right
  { top: '60%', left: '88%' },  // Seat 5 — bottom right
];

// ============================================================
// Mini card display
// ============================================================

function MiniCard({ card }: { card: CardType }) {
  const symbol = SUIT_SYMBOLS[card.suit];
  const isRed = SUIT_COLORS[card.suit] === 'red';
  return (
    <span className={`font-mono text-sm font-bold ${isRed ? 'text-red-400' : 'text-gray-100'}`}>
      {card.rank}{symbol}
    </span>
  );
}

function CardGroup({ cards, size = 'md' }: { cards: CardType[]; size?: 'sm' | 'md' }) {
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';
  return (
    <div className={`flex ${gap}`}>
      {cards.map((c, i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'px-1 py-0.5' : 'px-1.5 py-1'} bg-white/95 rounded shadow-sm`}
        >
          <MiniCard card={c} />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Player badge at table
// ============================================================

function PlayerBadge({ player, isActing, isDealer }: {
  player: ReplayPlayer;
  isActing: boolean;
  isDealer: boolean;
}) {
  const borderClass = isActing
    ? 'border-blue-400 ring-2 ring-blue-400/30'
    : player.isHuman
      ? 'border-blue-600/50'
      : !player.isActive
        ? 'border-gray-700 opacity-50'
        : 'border-gray-600';

  return (
    <div className={`relative bg-gray-800/90 rounded-lg border ${borderClass} px-2 py-1.5
                     min-w-[90px] text-center shadow-lg`}>
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center
                        text-[9px] font-bold text-gray-900 shadow">
          D
        </div>
      )}

      {/* Position badge */}
      <div className="text-[9px] font-semibold text-gray-500 uppercase">{player.position}</div>

      {/* Name */}
      <div className={`text-xs font-medium truncate ${player.isHuman ? 'text-blue-300' : 'text-gray-300'}`}>
        {player.name}
      </div>

      {/* Stack */}
      <div className="text-[10px] text-gray-400 font-mono">
        {player.stackBB.toFixed(1)} BB
      </div>

      {/* Hole cards */}
      {player.holeCards && player.holeCards.length === 2 && (
        <div className="mt-1">
          <CardGroup cards={player.holeCards} size="sm" />
        </div>
      )}

      {/* Last action */}
      {player.lastAction && (
        <div className={`text-[9px] mt-0.5 font-medium capitalize ${
          player.lastAction === 'fold' ? 'text-gray-500' :
          player.lastAction === 'all_in' ? 'text-red-400' :
          player.lastAction === 'raise' || player.lastAction === 'bet' ? 'text-yellow-400' :
          'text-gray-400'
        }`}>
          {player.lastAction.replace('_', '-')}
        </div>
      )}

      {/* Current bet */}
      {player.currentBet > 0 && (
        <div className="text-[9px] text-amber-400 font-mono">
          {player.currentBet.toFixed(1)} BB
        </div>
      )}

      {/* All-in marker */}
      {player.isAllIn && (
        <div className="text-[9px] text-red-400 font-bold">ALL IN</div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

const HandReplayViewer: React.FC<HandReplayViewerProps> = ({ state, className = '' }) => {
  const potTotal = useMemo(
    () => state.pots.reduce((sum, p) => sum + p.amount, 0),
    [state.pots],
  );

  return (
    <div className={`relative bg-gradient-to-b from-green-900/30 to-green-950/50
                     rounded-2xl border border-green-800/30 overflow-hidden ${className}`}
         style={{ minHeight: 360 }}>
      {/* Table felt */}
      <div className="absolute inset-4 rounded-[40%] border-2 border-green-700/20 bg-green-900/20" />

      {/* Center: Community cards + pot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        {/* Community cards */}
        {state.communityCards.length > 0 ? (
          <CardGroup cards={state.communityCards} />
        ) : (
          <div className="text-gray-600 text-xs italic">No board cards</div>
        )}

        {/* Pot */}
        <div className="bg-gray-900/70 rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-amber-500 text-xs">🪙</span>
          <span className="text-amber-400 text-sm font-mono font-semibold">
            {potTotal.toFixed(1)} BB
          </span>
        </div>

        {/* Phase badge */}
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
          {state.phase}
        </div>
      </div>

      {/* Player seats */}
      {state.players.map((player) => {
        const pos = SEAT_POSITIONS[player.seat] ?? SEAT_POSITIONS[0];
        return (
          <div
            key={player.seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <PlayerBadge
              player={player}
              isActing={state.actingSeat === player.seat}
              isDealer={state.dealerSeat === player.seat}
            />
          </div>
        );
      })}

      {/* Decision point indicator */}
      {state.isUserDecisionPoint && (
        <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs font-medium
                       px-2 py-1 rounded-lg shadow animate-pulse">
          📊 Decision Point
        </div>
      )}
    </div>
  );
};

export default React.memo(HandReplayViewer);
