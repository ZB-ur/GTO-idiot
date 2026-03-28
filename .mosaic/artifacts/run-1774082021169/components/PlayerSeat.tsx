'use client';

import { motion } from 'framer-motion';
import type { Card, Position, ActionType, BotStyle } from '@/engine/types';
import PlayingCard from './PlayingCard';
import ChipStack from '../common/ChipStack';

interface HoleCards {
  card1: Card;
  card2: Card;
}

interface PlayerSeatProps {
  playerId: string;
  name: string;
  position: Position;
  stack: number;
  currentBet?: number;
  lastAction?: ActionType;
  holeCards?: HoleCards;
  isUser: boolean;
  isActive: boolean;
  isFolded: boolean;
  isCurrentActor: boolean;
  botStyle?: BotStyle;
}

const BOT_STYLE_COLORS: Record<BotStyle, string> = {
  TAG: 'bg-blue-600',
  LAG: 'bg-orange-500',
  Nit: 'bg-gray-500',
  Fish: 'bg-green-500',
  GTO: 'bg-purple-600',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All In',
};

const ACTION_COLORS: Record<ActionType, string> = {
  fold: 'text-gray-400',
  check: 'text-green-400',
  call: 'text-blue-400',
  raise: 'text-yellow-400',
  all_in: 'text-red-400',
};

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 mt-1 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-yellow-400"
          animate={{ scale: [0, 1, 0] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.16,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function PlayerSeat({
  playerId,
  name,
  position,
  stack,
  currentBet,
  lastAction,
  holeCards,
  isUser,
  isActive,
  isFolded,
  isCurrentActor,
  botStyle,
}: PlayerSeatProps) {
  const dimmed = isFolded || !isActive;

  return (
    <motion.div
      data-player-id={playerId}
      className={`relative flex flex-col items-center gap-1 ${dimmed ? 'opacity-40' : ''}`}
      animate={
        isCurrentActor && !dimmed
          ? {
              boxShadow: [
                '0 0 0px rgba(234,179,8,0)',
                '0 0 16px rgba(234,179,8,0.6)',
                '0 0 0px rgba(234,179,8,0)',
              ],
            }
          : {}
      }
      transition={isCurrentActor ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {/* Hole cards */}
      {holeCards && (
        <div className="flex gap-0.5 mb-1">
          <PlayingCard
            card={isUser ? holeCards.card1 : undefined}
            faceDown={!isUser}
            size="sm"
            animated={isUser}
          />
          <PlayingCard
            card={isUser ? holeCards.card2 : undefined}
            faceDown={!isUser}
            size="sm"
            animated={isUser}
          />
        </div>
      )}

      {/* Player info box */}
      <div
        className={`relative rounded-xl px-3 py-1.5 min-w-[90px] text-center ${
          isCurrentActor && !dimmed
            ? 'bg-gray-800 ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20'
            : 'bg-gray-800/90'
        }`}
      >
        {/* Position badge */}
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
          {position}
        </div>

        {/* Player name */}
        <div className="text-white text-sm font-semibold truncate max-w-[100px]">
          {name}
          {isUser && (
            <span className="ml-1 text-[9px] text-blue-400 font-normal">(You)</span>
          )}
        </div>

        {/* Stack */}
        <div className="text-gray-300 text-xs font-mono">
          {stack.toLocaleString()} BB
        </div>

        {/* Bot style badge */}
        {botStyle && (
          <span
            className={`inline-block mt-0.5 px-1.5 py-0 rounded text-[9px] font-bold text-white ${BOT_STYLE_COLORS[botStyle]}`}
          >
            {botStyle}
          </span>
        )}

        {/* Last action */}
        {lastAction && !isFolded && (
          <div className={`text-[11px] font-semibold mt-0.5 ${ACTION_COLORS[lastAction]}`}>
            {ACTION_LABELS[lastAction]}
          </div>
        )}

        {/* Current bet */}
        {currentBet != null && currentBet > 0 && (
          <div className="text-yellow-300 text-[11px] font-mono mt-0.5">
            Bet: {currentBet.toLocaleString()}
          </div>
        )}

        {/* Thinking indicator */}
        {isCurrentActor && !isUser && !dimmed && <ThinkingDots />}

        {/* Folded label */}
        {isFolded && (
          <div className="text-red-400 text-[10px] font-bold mt-0.5">FOLDED</div>
        )}
      </div>
    </motion.div>
  );
}