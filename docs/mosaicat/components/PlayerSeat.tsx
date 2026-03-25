'use client';

import { motion } from 'framer-motion';

interface PlayerSeatProps {
  name: string;
  chipCount: number;
  position: string;
  isBot: boolean;
  botStyle?: string;
  botIcon?: string;
  isActive: boolean;
  hasFolded: boolean;
  isAllIn: boolean;
  isCurrentActor: boolean;
  lastAction?: string;
  lastActionAmount?: number;
  isUser: boolean;
}

const BOT_STYLE_COLORS: Record<string, string> = {
  TAG: 'bg-blue-600',
  LAG: 'bg-orange-500',
  Nit: 'bg-gray-500',
  Fish: 'bg-green-500',
  GTO: 'bg-purple-600',
};

const BOT_STYLE_ICONS: Record<string, string> = {
  TAG: '🦈',
  LAG: '🔥',
  Nit: '🪨',
  Fish: '🐟',
  GTO: '🤖',
};

const ACTION_COLORS: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-green-400',
  call: 'text-blue-400',
  bet: 'text-yellow-400',
  raise: 'text-yellow-400',
  all_in: 'text-red-400',
  post_sb: 'text-gray-400',
  post_bb: 'text-gray-400',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
  post_sb: 'SB',
  post_bb: 'BB',
};

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
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
  name,
  chipCount,
  position,
  isBot,
  botStyle,
  botIcon,
  isActive,
  hasFolded,
  isAllIn,
  isCurrentActor,
  lastAction,
  lastActionAmount,
  isUser,
}: PlayerSeatProps) {
  const dimmed = hasFolded || !isActive;
  const icon = botIcon
    ? BOT_STYLE_ICONS[botStyle ?? ''] ?? botIcon
    : isUser
      ? name.charAt(0).toUpperCase()
      : name.charAt(0).toUpperCase();

  const ringClass = isCurrentActor && !dimmed
    ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/30'
    : isAllIn
      ? 'ring-2 ring-red-500'
      : 'ring-1 ring-gray-600';

  const formatAction = (action: string, amount?: number): string => {
    const label = ACTION_LABELS[action] ?? action;
    if (amount && amount > 0 && ['bet', 'raise', 'call', 'all_in'].includes(action)) {
      return `${label} ${amount}`;
    }
    return label;
  };

  return (
    <motion.div
      className={`
        relative flex flex-col items-center gap-1 min-w-[80px]
        ${dimmed ? 'opacity-40' : ''}
      `}
      animate={
        isCurrentActor && !dimmed
          ? {
              boxShadow: [
                '0 0 0px rgba(16,185,129,0)',
                '0 0 16px rgba(16,185,129,0.5)',
                '0 0 0px rgba(16,185,129,0)',
              ],
            }
          : {}
      }
      transition={isCurrentActor ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {/* Avatar */}
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          bg-gray-700 ${ringClass} transition-all duration-300
        `}
      >
        {isCurrentActor && isBot && !dimmed ? (
          <ThinkingDots />
        ) : (
          <span className="text-white text-lg font-bold">{icon}</span>
        )}
      </div>

      {/* Name + position */}
      <div className="flex items-center gap-1">
        <span className="text-white text-xs font-medium truncate max-w-[70px]">
          {name}
        </span>
        <span className="text-gray-400 text-[10px] bg-gray-700 px-1 py-0.5 rounded font-medium">
          {position}
        </span>
      </div>

      {/* Bot style badge */}
      {isBot && botStyle && (
        <span
          className={`inline-block px-1.5 py-0 rounded text-[9px] font-bold text-white ${
            BOT_STYLE_COLORS[botStyle] ?? 'bg-gray-600'
          }`}
        >
          {botStyle}
        </span>
      )}

      {/* Chip count */}
      {!isAllIn ? (
        <span
          className="text-gray-300 text-xs font-semibold"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {chipCount.toLocaleString()} BB
        </span>
      ) : (
        <span className="text-red-400 text-xs font-bold uppercase">All-In</span>
      )}

      {/* Last action label */}
      {lastAction && !dimmed && (
        <motion.span
          className={`text-[10px] font-semibold uppercase ${ACTION_COLORS[lastAction] ?? 'text-gray-400'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatAction(lastAction, lastActionAmount)}
        </motion.span>
      )}

      {/* Folded label */}
      {hasFolded && (
        <span className="text-gray-500 text-[10px] font-medium uppercase">Folded</span>
      )}

      {/* User indicator */}
      {isUser && (
        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-wide">
          You
        </span>
      )}
    </motion.div>
  );
}