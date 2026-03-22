/**
 * MiniTable — compact poker table visualization for hand replay.
 * Shows player positions, community cards, pot size, and highlights active player.
 */

import React from 'react';
import type { Card, Position } from '../../types/poker';
import { CardComponent } from '../table/CardComponent';

interface MiniTablePlayer {
  name: string;
  position: Position;
  isFolded?: boolean;
  isHuman?: boolean;
  holeCards?: [Card, Card];
  chipDelta?: number;
}

interface MiniTableProps {
  players: MiniTablePlayer[];
  communityCards: Card[];
  pot?: number;
  activePosition?: Position;
  className?: string;
}

/**
 * Position layout for 6-max on a mini oval table.
 * Positions are placed around an ellipse.
 */
const POSITION_COORDS: Record<Position, { x: string; y: string }> = {
  BTN: { x: '80%', y: '75%' },
  SB:  { x: '50%', y: '90%' },
  BB:  { x: '20%', y: '75%' },
  UTG: { x: '10%', y: '30%' },
  HJ:  { x: '50%', y: '10%' },
  CO:  { x: '90%', y: '30%' },
};

export const MiniTable: React.FC<MiniTableProps> = ({
  players,
  communityCards,
  pot,
  activePosition,
  className = '',
}) => {
  return (
    <div className={`relative w-full aspect-[2/1] max-w-md mx-auto ${className}`}>
      {/* Table felt */}
      <div className="absolute inset-4 rounded-[50%] bg-gradient-to-b from-felt-700 to-felt-800 border-2 border-felt-600 shadow-lg" />

      {/* Community cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
        {communityCards.length > 0 ? (
          communityCards.map((card, i) => (
            <CardComponent key={i} card={card} size="sm" />
          ))
        ) : (
          <span className="text-xs text-gray-500/50 italic">No cards</span>
        )}
      </div>

      {/* Pot display */}
      {pot != null && pot > 0 && (
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-2 py-0.5">
          <span className="text-xs text-yellow-400 font-mono">{pot.toFixed(1)} BB</span>
        </div>
      )}

      {/* Player seats */}
      {players.map((player) => {
        const coords = POSITION_COORDS[player.position];
        if (!coords) return null;

        const isActive = player.position === activePosition;

        return (
          <div
            key={player.position}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: coords.x, top: coords.y }}
          >
            <div
              className={`flex flex-col items-center gap-0.5
                ${player.isFolded ? 'opacity-40' : ''}`}
            >
              {/* Hole cards */}
              {player.holeCards && !player.isFolded && (
                <div className="flex gap-px">
                  {player.holeCards.map((card, i) => (
                    <CardComponent key={i} card={card} size="sm" />
                  ))}
                </div>
              )}

              {/* Name & position badge */}
              <div
                className={`px-1.5 py-0.5 rounded text-center text-[10px] leading-tight
                  ${isActive
                    ? 'bg-yellow-500/30 border border-yellow-500/60 text-yellow-300'
                    : player.isHuman
                      ? 'bg-felt-600/40 border border-felt-500/40 text-felt-300'
                      : 'bg-gray-800/80 border border-gray-700 text-gray-400'
                  }`}
              >
                <div className="font-medium truncate max-w-[4rem]">
                  {player.name}
                </div>
                <div className="text-[8px] opacity-70">{player.position}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniTable;
