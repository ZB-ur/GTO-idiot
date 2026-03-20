import React from 'react';
import { PlayingCard, Rank, Suit } from './PlayingCard';
import { ChipStack } from './ChipStack';
import { DealerButton } from './DealerButton';

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type BotStyle = 'TAG' | 'LAG' | 'Nit' | 'Fish' | 'GTO';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface Player {
  seatIndex: number;
  name: string;
  chips: number;
  position: Position;
  isHuman: boolean;
  isActive: boolean;
  isBusted?: boolean;
  botStyle?: BotStyle;
  holeCards?: [Card, Card];
  currentBet?: number;
}

export type SeatPosition =
  | 'top-left'
  | 'top-right'
  | 'mid-left'
  | 'mid-right'
  | 'bottom-left'
  | 'bottom-right';

interface PlayerSeatProps {
  player: Player;
  isCurrentActor: boolean;
  isDealer: boolean;
  isThinking: boolean;
  showCards: boolean;
  position: SeatPosition;
}

const botStyleColors: Record<BotStyle, string> = {
  TAG: 'bg-blue-100 text-blue-700',
  LAG: 'bg-amber-100 text-amber-700',
  Nit: 'bg-gray-100 text-gray-600',
  Fish: 'bg-emerald-100 text-emerald-700',
  GTO: 'bg-purple-100 text-purple-700',
};

const positionColors: Record<Position, string> = {
  UTG: 'bg-red-100 text-red-700',
  HJ: 'bg-orange-100 text-orange-700',
  CO: 'bg-amber-100 text-amber-700',
  BTN: 'bg-emerald-100 text-emerald-700',
  SB: 'bg-sky-100 text-sky-700',
  BB: 'bg-indigo-100 text-indigo-700',
};

function formatChips(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return amount.toLocaleString();
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentActor,
  isDealer,
  isThinking,
  showCards,
  position,
}) => {
  const { name, chips, isHuman, isActive, isBusted, botStyle, holeCards, currentBet } = player;

  const cardsAbove = position.startsWith('bottom');

  return (
    <div
      className={`
        relative flex flex-col items-center gap-1.5 p-3
        rounded-xl border-2 transition-all duration-300 select-none
        ${isBusted ? 'opacity-40 grayscale' : ''}
        ${isCurrentActor
          ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200/50'
          : isActive
            ? 'border-gray-200 bg-white shadow-sm'
            : 'border-gray-100 bg-gray-50 opacity-60'
        }
      `}
      style={{ minWidth: '120px' }}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-3 -right-3 z-10">
          <DealerButton />
        </div>
      )}

      {/* Cards above (for bottom positions) */}
      {cardsAbove && (
        <div className="flex gap-1 mb-0.5">
          {showCards && holeCards ? (
            <>
              <PlayingCard rank={holeCards[0].rank} suit={holeCards[0].suit} size="sm" />
              <PlayingCard rank={holeCards[1].rank} suit={holeCards[1].suit} size="sm" />
            </>
          ) : isActive && !isBusted ? (
            <>
              <PlayingCard faceDown size="sm" />
              <PlayingCard faceDown size="sm" />
            </>
          ) : null}
        </div>
      )}

      {/* Avatar + Name area */}
      <div className="flex flex-col items-center gap-1">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
              ${isHuman
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-gray-500 border border-gray-200'
              }
              ${isThinking ? 'animate-pulse' : ''}
            `}
          >
            {isHuman ? name.charAt(0).toUpperCase() : '🤖'}
          </div>

          {/* Thinking dots */}
          {isThinking && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Name + BOT badge */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">
            {name}
          </span>
          {!isHuman && botStyle && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${botStyleColors[botStyle]}`}>
              {botStyle}
            </span>
          )}
        </div>

        {/* Position badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${positionColors[player.position]}`}>
          {player.position}
        </span>
      </div>

      {/* Chips */}
      {!isBusted && (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-900">{formatChips(chips)} BB</span>
        </div>
      )}

      {/* Current bet */}
      {currentBet != null && currentBet > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          <ChipStack amount={currentBet} size="sm" />
        </div>
      )}

      {/* Cards below (for non-bottom positions) */}
      {!cardsAbove && (
        <div className="flex gap-1 mt-0.5">
          {showCards && holeCards ? (
            <>
              <PlayingCard rank={holeCards[0].rank} suit={holeCards[0].suit} size="sm" />
              <PlayingCard rank={holeCards[1].rank} suit={holeCards[1].suit} size="sm" />
            </>
          ) : isActive && !isBusted ? (
            <>
              <PlayingCard faceDown size="sm" />
              <PlayingCard faceDown size="sm" />
            </>
          ) : null}
        </div>
      )}

      {/* Action label (fold, etc.) */}
      {!isActive && !isBusted && (
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Folded
        </span>
      )}

      {isBusted && (
        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
          Busted
        </span>
      )}
    </div>
  );
};

export default PlayerSeat;