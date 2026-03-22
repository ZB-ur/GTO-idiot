import React from 'react';
import { PlayerCards } from './PlayerCards';
import { ChipStack } from './ChipStack';
import { DealerButton } from './DealerButton';

interface PlayerInfo {
  name: string;
  chipStack: number;
  position: string;
  isHuman: boolean;
  isActive: boolean;
}

interface CardData {
  rank: string;
  suit: string;
}

interface SeatPositionProps {
  player: PlayerInfo;
  holeCards?: CardData[];
  isFolded?: boolean;
  isAllIn?: boolean;
  isCurrentActor?: boolean;
  isDealer?: boolean;
  currentBet?: number;
  thinking?: boolean;
}

export const SeatPosition: React.FC<SeatPositionProps> = ({
  player,
  holeCards,
  isFolded = false,
  isAllIn = false,
  isCurrentActor = false,
  isDealer = false,
  currentBet,
  thinking = false,
}) => {
  const borderColor = isCurrentActor
    ? 'border-blue-400 ring-2 ring-blue-400/30'
    : isFolded
    ? 'border-gray-300 opacity-50'
    : 'border-gray-200';

  return (
    <div className={`relative flex flex-col items-center gap-1`}>
      {isDealer && (
        <div className="absolute -top-2 -right-2 z-10">
          <DealerButton />
        </div>
      )}

      <div
        className={`flex flex-col items-center bg-white border-2 ${borderColor} rounded-xl px-3 py-2 shadow-sm min-w-[90px] transition-all`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
            player.isHuman
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>

        {/* Name + position */}
        <span className="text-xs font-semibold text-gray-900 truncate max-w-[80px]">
          {player.name}
        </span>
        <span className="text-[10px] text-gray-400 uppercase font-medium">
          {player.position}
        </span>

        {/* Chips */}
        <div className="flex items-center gap-1 mt-1">
          <ChipStack amount={player.chipStack} size="xs" />
          <span className={`text-xs font-bold ${isAllIn ? 'text-red-500' : 'text-gray-700'}`}>
            {isAllIn ? 'ALL-IN' : `$${player.chipStack.toLocaleString()}`}
          </span>
        </div>

        {/* Thinking indicator */}
        {thinking && (
          <div className="flex gap-0.5 mt-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Hole cards */}
      <PlayerCards cards={holeCards} faceDown={!holeCards} folded={isFolded} />

      {/* Current bet */}
      {currentBet !== undefined && currentBet > 0 && (
        <div className="absolute -bottom-5 flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500" />
          <span className="text-[10px] font-bold text-white">${currentBet}</span>
        </div>
      )}
    </div>
  );
};