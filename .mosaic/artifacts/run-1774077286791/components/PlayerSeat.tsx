import React from 'react';

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

export interface PlayerSeatProps {
  player: Player;
  isDealer: boolean;
  isActionOn: boolean;
  isBotThinking: boolean;
  showHoleCards: boolean;
}

const SUIT_SYMBOLS: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

const formatStack = (stack: number): string => {
  if (stack >= 1000) return `${(stack / 1000).toFixed(1)}k`;
  return stack.toFixed(1);
};

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isDealer,
  isActionOn,
  isBotThinking,
  showHoleCards,
}) => {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'allin';
  const isEliminated = player.status === 'eliminated';
  const opacity = isFolded || isEliminated ? 'opacity-40' : '';

  return (
    <div className={`relative flex flex-col items-center gap-1 ${opacity}`}>
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-gray-900 text-[10px] font-bold shadow-md z-10">
          D
        </div>
      )}

      {/* Action ring / Avatar */}
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          border-2 transition-all duration-300
          ${isActionOn
            ? 'border-emerald-400 shadow-lg shadow-emerald-400/30 bg-gray-700'
            : isAllIn
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-600 bg-gray-700'
          }
        `}
      >
        {isBotThinking ? (
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span className="text-white text-lg font-bold">{player.name.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {/* Name + Position */}
      <div className="flex items-center gap-1">
        <span className="text-white text-xs font-medium truncate max-w-[60px]">{player.name}</span>
        {player.position && (
          <span className="text-gray-400 text-[10px] bg-gray-700 px-1 py-0.5 rounded font-medium">
            {player.position}
          </span>
        )}
      </div>

      {/* Stack */}
      <div className="flex items-center gap-0.5">
        {isAllIn ? (
          <span className="text-red-400 text-xs font-bold uppercase">All-In</span>
        ) : (
          <span className="text-gray-300 text-xs font-semibold tabular-nums">
            {formatStack(player.stack)} BB
          </span>
        )}
      </div>

      {/* Hole cards */}
      {player.holeCards && player.holeCards.length === 2 && (
        <div className="flex items-center gap-0.5 mt-0.5">
          {showHoleCards ? (
            player.holeCards.map((card, i) => (
              <div
                key={i}
                className={`w-10 h-[56px] rounded-md bg-white border border-gray-300 shadow-sm
                  flex flex-col items-center justify-center ${SUIT_COLORS[card.suit]}`}
              >
                <span className="text-xs font-bold leading-none">{card.rank}</span>
                <span className="text-sm leading-none">{SUIT_SYMBOLS[card.suit]}</span>
              </div>
            ))
          ) : (
            <>
              <div className="w-10 h-[56px] rounded-md bg-gradient-to-br from-emerald-700 to-emerald-900 border-2 border-emerald-600 flex items-center justify-center">
                <div className="w-6 h-8 rounded-sm border border-emerald-500/40 bg-emerald-800/50" />
              </div>
              <div className="w-10 h-[56px] rounded-md bg-gradient-to-br from-emerald-700 to-emerald-900 border-2 border-emerald-600 flex items-center justify-center -ml-2">
                <div className="w-6 h-8 rounded-sm border border-emerald-500/40 bg-emerald-800/50" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Status badge */}
      {isFolded && (
        <span className="text-gray-500 text-[10px] font-medium uppercase">Folded</span>
      )}
    </div>
  );
};

export default PlayerSeat;