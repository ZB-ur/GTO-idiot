import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface PlayerState {
  seatIndex: number;
  position: string;
  name?: string;
  stack: number;
  isActive: boolean;
  isBot: boolean;
  botStyle?: string;
  holeCards?: Card[];
  currentBet?: number;
  hasActed?: boolean;
}

interface PlayerSeatProps {
  player: PlayerState;
  isCurrentPlayer?: boolean;
  isDealer?: boolean;
  isHuman?: boolean;
  showAction?: { type: string; amount?: number };
  isThinking?: boolean;
  winner?: { handDescription: string; amount: number };
  className?: string;
}

const suitSymbols: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-400',
  d: 'text-sky-400',
  c: 'text-emerald-400',
};

const actionLabels: Record<string, { text: string; color: string }> = {
  fold: { text: 'Fold', color: 'text-gray-500' },
  check: { text: 'Check', color: 'text-gray-400' },
  call: { text: 'Call', color: 'text-emerald-400' },
  raise: { text: 'Raise', color: 'text-amber-400' },
  allIn: { text: 'ALL IN', color: 'text-red-400' },
};

const styleAvatars: Record<string, string> = {
  TAG: '🦅',
  LAG: '🔥',
  Fish: '🐟',
  Nit: '🐢',
  CallingStation: '📞',
};

const HoleCard: React.FC<{ card: Card }> = ({ card }) => (
  <div className="w-10 h-14 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center shadow-md">
    <span className={`text-sm font-bold leading-none ${suitColors[card.suit]}`}>
      {card.rank}
    </span>
    <span className={`text-xs leading-none ${suitColors[card.suit]}`}>
      {suitSymbols[card.suit]}
    </span>
  </div>
);

const FaceDownCard: React.FC = () => (
  <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-700/50 shadow-md flex items-center justify-center">
    <div className="w-6 h-8 rounded border border-blue-600/30 bg-blue-900/50" />
  </div>
);

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentPlayer = false,
  isDealer = false,
  isHuman = false,
  showAction,
  isThinking = false,
  winner,
  className = '',
}) => {
  const isFolded = !player.isActive;
  const displayName = player.name ?? (player.isBot ? `${player.botStyle ?? 'Bot'}` : 'You');
  const avatar = player.isBot ? (styleAvatars[player.botStyle ?? ''] ?? '🤖') : '👤';

  return (
    <div
      className={`relative flex flex-col items-center gap-2 ${isFolded ? 'opacity-40' : ''} ${className}`}
    >
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center shadow-lg z-10">
          D
        </div>
      )}

      {/* Avatar + name plate */}
      <div
        className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${
          isCurrentPlayer
            ? 'bg-gray-800 border-amber-500/50 shadow-lg shadow-amber-500/10'
            : winner
              ? 'bg-gray-800 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-gray-900 border-gray-700'
        }`}
      >
        {/* Avatar */}
        <div className="text-2xl">{avatar}</div>

        {/* Name + position */}
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-50 truncate max-w-[80px]">
            {displayName}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">{player.position}</div>
        </div>

        {/* Stack */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-950/50">
          <span className="text-amber-400 text-[10px]">●</span>
          <span className="text-xs font-mono font-semibold text-gray-50">
            {player.stack}
          </span>
        </div>

        {/* Bot style badge */}
        {player.isBot && player.botStyle && (
          <div className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {player.botStyle}
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Hole cards */}
      <div className="flex gap-1">
        {player.holeCards && player.holeCards.length === 2
          ? player.holeCards.map((card, i) => <HoleCard key={i} card={card} />)
          : !isFolded && (
              <>
                <FaceDownCard />
                <FaceDownCard />
              </>
            )}
      </div>

      {/* Action label */}
      {showAction && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div
            className={`px-2 py-0.5 rounded-lg bg-gray-900/90 border border-gray-700 text-xs font-semibold ${
              actionLabels[showAction.type]?.color ?? 'text-gray-400'
            }`}
          >
            {actionLabels[showAction.type]?.text ?? showAction.type}
            {showAction.amount ? ` ${showAction.amount}` : ''}
          </div>
        </div>
      )}

      {/* Winner badge */}
      {winner && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-center">
            <div className="text-xs font-semibold text-emerald-400">
              +{winner.amount}
            </div>
            <div className="text-[10px] text-emerald-300/70">{winner.handDescription}</div>
          </div>
        </div>
      )}

      {/* Current bet */}
      {player.currentBet !== undefined && player.currentBet > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-amber-500 text-xs">●</span>
          <span className="text-xs font-mono text-gray-400">{player.currentBet}</span>
        </div>
      )}
    </div>
  );
};