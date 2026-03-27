import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

type BotStyle = 'TAG' | 'LAG' | 'TightPassive' | 'Fish' | 'Balanced';
type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SeatState {
  playerId: string;
  nickname: string;
  seatIndex: number;
  isUser: boolean;
  botStyle?: BotStyle;
  chipCount: number;
  position: Position;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
}

interface PlayerSeatProps {
  seat: SeatState;
  isActive: boolean;
  isThinking: boolean;
  showCards: boolean;
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-100', h: 'text-red-500', d: 'text-red-500', c: 'text-gray-100',
};

const STYLE_LABELS: Record<BotStyle, { text: string; color: string }> = {
  TAG: { text: '紧凶', color: 'text-red-400 bg-red-950 border-red-800' },
  LAG: { text: '松凶', color: 'text-orange-400 bg-orange-950 border-orange-800' },
  TightPassive: { text: '紧弱', color: 'text-blue-400 bg-blue-950 border-blue-800' },
  Fish: { text: '鱼', color: 'text-green-400 bg-green-950 border-green-800' },
  Balanced: { text: '平衡', color: 'text-purple-400 bg-purple-950 border-purple-800' },
};

function HoleCards({ cards, show }: { cards?: Card[] | null; show: boolean }) {
  if (!cards || cards.length < 2) {
    // Face-down cards
    return (
      <div className="flex gap-0.5">
        <div className="w-8 h-11 rounded bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-700 shadow-sm" />
        <div className="w-8 h-11 rounded bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-700 shadow-sm -ml-2" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="flex gap-0.5">
        <div className="w-8 h-11 rounded bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-700 shadow-sm" />
        <div className="w-8 h-11 rounded bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-700 shadow-sm -ml-2" />
      </div>
    );
  }

  return (
    <div className="flex gap-0.5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="w-8 h-11 rounded bg-gray-50 border border-gray-300 flex flex-col items-center justify-center shadow-sm text-xs font-bold leading-none"
        >
          <span className={SUIT_COLORS[card.suit]}>{card.rank}</span>
          <span className={SUIT_COLORS[card.suit]}>{SUIT_SYMBOLS[card.suit]}</span>
        </div>
      ))}
    </div>
  );
}

function BotThinkingIndicator() {
  return (
    <div className="flex gap-1 items-center">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export function PlayerSeat({ seat, isActive, isThinking, showCards }: PlayerSeatProps) {
  const { nickname, chipCount, position, isFolded, isAllIn, botStyle, isUser, holeCards, lastAction, currentBet } = seat;

  return (
    <div className={`flex flex-col items-center gap-1 transition-all ${isFolded ? 'opacity-40' : ''}`}>
      {/* Hole cards (above avatar) */}
      {!isFolded && (
        <HoleCards cards={holeCards} show={showCards} />
      )}

      {/* Avatar + active ring */}
      <div className="relative">
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
            ${isUser ? 'bg-amber-500 text-gray-950' : 'bg-gray-700 text-gray-200'}
            ${isActive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-950' : ''}
            ${isAllIn ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-950' : ''}
            transition-all
          `}
        >
          {nickname.charAt(0)}
        </div>

        {/* Position badge */}
        <span className="absolute -bottom-1 -right-1 bg-gray-800 border border-gray-600 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {position}
        </span>
      </div>

      {/* Name + style label */}
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-medium ${isUser ? 'text-amber-400' : 'text-gray-50'}`}>
          {nickname}
        </span>
        {botStyle && STYLE_LABELS[botStyle] && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STYLE_LABELS[botStyle].color}`}>
            {STYLE_LABELS[botStyle].text}
          </span>
        )}
      </div>

      {/* Chips */}
      <span className="text-gray-400 text-xs">
        {isAllIn ? (
          <span className="text-red-400 font-bold">ALL IN</span>
        ) : (
          `${chipCount} 筹码`
        )}
      </span>

      {/* Action label / thinking indicator */}
      {isThinking ? (
        <BotThinkingIndicator />
      ) : lastAction ? (
        <span className="text-sky-400 text-xs font-medium bg-sky-950 border border-sky-800 px-2 py-0.5 rounded-full">
          {lastAction}
        </span>
      ) : null}

      {/* Current bet (shown near seat) */}
      {currentBet > 0 && !isFolded && (
        <span className="text-amber-500 text-xs font-bold">
          {currentBet}
        </span>
      )}
    </div>
  );
}