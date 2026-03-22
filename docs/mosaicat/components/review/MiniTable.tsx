import React from 'react';

export interface CardData {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export interface HandPlayerInfo {
  playerId: string;
  playerName: string;
  position: string;
  chipCount: number;
  isActive: boolean;
  isFolded: boolean;
  currentBet?: number;
  isHuman?: boolean;
}

interface MiniTableProps {
  communityCards: CardData[];
  pot: number;
  players: HandPlayerInfo[];
  activePlayerIds: string[];
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-green-700',
  spades: 'text-gray-900',
};

const CardComponent: React.FC<{ card: CardData }> = ({ card }) => (
  <div className="inline-flex items-center justify-center w-9 h-12 bg-white border border-gray-200 rounded-lg shadow-sm">
    <span className={`text-sm font-bold ${suitColors[card.suit]}`}>
      {card.rank}
      {suitSymbols[card.suit]}
    </span>
  </div>
);

const ChipStack: React.FC<{ amount: number; label?: string }> = ({ amount, label }) => (
  <div className="flex items-center gap-1">
    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500 shadow-sm" />
    <span className="text-xs font-semibold text-gray-700">
      {label ? `${label}: ` : ''}{amount.toFixed(1)}BB
    </span>
  </div>
);

export const MiniTable: React.FC<MiniTableProps> = ({
  communityCards,
  pot,
  players,
  activePlayerIds,
}) => {
  const activeSet = new Set(activePlayerIds);

  return (
    <div className="relative bg-emerald-800 border-4 border-emerald-900 rounded-xl p-6 shadow-md">
      {/* Pot display */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500" />
          <span className="text-xs font-bold text-yellow-100">Pot: {pot.toFixed(1)}BB</span>
        </div>
      </div>

      {/* Community cards */}
      <div className="flex items-center justify-center gap-1.5 mt-6 mb-4">
        {communityCards.map((card, i) => (
          <CardComponent key={i} card={card} />
        ))}
        {/* Empty card slots */}
        {Array.from({ length: Math.max(0, 5 - communityCards.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-9 h-12 bg-emerald-700/50 border border-emerald-600/50 rounded-lg"
          />
        ))}
      </div>

      {/* Players ring */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {players.map((player) => {
          const isActive = activeSet.has(player.playerId);
          return (
            <div
              key={player.playerId}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                player.isFolded
                  ? 'opacity-40'
                  : isActive
                  ? 'bg-yellow-400/20 ring-1 ring-yellow-400/60'
                  : 'bg-white/10'
              } ${player.isHuman ? 'ring-2 ring-blue-400/80' : ''}`}
            >
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">
                {player.position}
              </span>
              <span className={`text-xs font-semibold ${player.isHuman ? 'text-blue-300' : 'text-white'} truncate max-w-[60px]`}>
                {player.playerName}
              </span>
              <span className="text-[10px] text-emerald-300">
                {player.chipCount.toFixed(0)}BB
              </span>
              {player.currentBet !== undefined && player.currentBet > 0 && (
                <span className="text-[10px] text-yellow-300 font-medium mt-0.5">
                  ↳ {player.currentBet.toFixed(1)}BB
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniTable;