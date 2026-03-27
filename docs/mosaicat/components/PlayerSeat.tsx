import React from 'react';

interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type BotProfileType = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';

interface PlayerState {
  seatIndex: number;
  name: string;
  stackSize: number;
  position: Position;
  isBot: boolean;
  botProfile?: BotProfileType;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  holeCards?: Card[];
  currentBet?: number;
  lastAction?: ActionType;
  lastActionAmount?: number;
}

interface PlayerSeatProps {
  player: PlayerState;
  isDealer: boolean;
  isCurrentTurn: boolean;
  isThinking: boolean;
  seatPosition: number;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-400',
  clubs: 'text-emerald-400',
  spades: 'text-gray-100',
};

const actionLabels: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

const actionColors: Record<ActionType, string> = {
  fold: 'bg-gray-700 text-gray-400',
  check: 'bg-emerald-900/50 text-emerald-400',
  call: 'bg-sky-900/50 text-sky-400',
  bet: 'bg-amber-900/50 text-amber-400',
  raise: 'bg-orange-900/50 text-orange-400',
  all_in: 'bg-red-900/50 text-red-400',
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isDealer,
  isCurrentTurn,
  isThinking,
}) => {
  const { name, stackSize, position, isFolded, isAllIn, holeCards, lastAction, lastActionAmount } = player;

  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 ${
        isFolded ? 'opacity-40' : ''
      }`}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 text-gray-950 text-xs font-bold flex items-center justify-center shadow-md z-10">
          D
        </div>
      )}

      {/* Player Card Container */}
      <div
        className={`relative rounded-xl bg-gray-900 border ${
          isCurrentTurn
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
            : 'border-gray-700'
        } p-3 min-w-[120px] transition-all`}
      >
        {/* Thinking Indicator */}
        {isThinking && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {/* Name & Position */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-semibold text-gray-50 truncate max-w-[80px]">
            {name}
          </span>
          <span className="text-[10px] font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {position}
          </span>
        </div>

        {/* Hole Cards */}
        <div className="flex justify-center gap-1 mb-2">
          {holeCards && holeCards.length === 2 ? (
            holeCards.map((card, i) => (
              <div
                key={i}
                className="w-9 h-12 rounded-lg bg-gray-100 border border-gray-300 flex flex-col items-center justify-center shadow-sm"
              >
                <span className={`text-xs font-bold ${suitColors[card.suit]}`}>
                  {card.rank}
                </span>
                <span className={`text-sm leading-none ${suitColors[card.suit]}`}>
                  {suitSymbols[card.suit]}
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/50 shadow-sm" />
              <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/50 shadow-sm -ml-2" />
            </>
          )}
        </div>

        {/* Stack */}
        <div className="flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="8" />
          </svg>
          <span className="text-sm font-bold text-gray-50">
            {isAllIn ? 'ALL IN' : stackSize.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Label */}
      {lastAction && (
        <div
          className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${actionColors[lastAction]}`}
        >
          {actionLabels[lastAction]}
          {lastActionAmount != null && lastAction !== 'fold' && lastAction !== 'check'
            ? ` ${lastActionAmount}`
            : ''}
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;