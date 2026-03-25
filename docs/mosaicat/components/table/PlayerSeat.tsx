import React from 'react';

// Types from API spec
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface PlayerState {
  seatIndex: number;
  name: string;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  chipStack: number;
  isActive: boolean;
  isBust: boolean;
  isHero: boolean;
  difficulty: 'fish' | 'regular' | 'gto';
  holeCards?: Card[];
  currentBet?: number;
  lastAction?: string | null;
  handRank?: string | null;
}

interface PlayerSeatProps {
  player: PlayerState;
  isCurrentActor: boolean;
}

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColor: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

function HoleCard({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center gap-0">
      <span className={`text-sm font-bold leading-none ${suitColor[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-base leading-none ${suitColor[card.suit]}`}>
        {suitSymbol[card.suit]}
      </span>
    </div>
  );
}

function PositionLabel({ position }: { position: string }) {
  return (
    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
      {position}
    </span>
  );
}

function ActionChip({ action }: { action: string }) {
  return (
    <div className="mt-1 bg-amber-400/90 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
      {action}
    </div>
  );
}

function HandRankLabel({ rank }: { rank: string }) {
  return (
    <div className="mt-1 bg-emerald-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap max-w-[140px] truncate">
      {rank}
    </div>
  );
}

export default function PlayerSeat({ player, isCurrentActor }: PlayerSeatProps) {
  const { name, position, chipStack, isActive, isBust, holeCards, lastAction, handRank } = player;

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-300 ${
        isBust ? 'opacity-40 grayscale' : ''
      } ${!isActive && !isBust ? 'opacity-60' : ''}`}
    >
      {/* Turn indicator ring */}
      <div
        className={`relative rounded-full p-0.5 ${
          isCurrentActor
            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-emerald-900 animate-pulse'
            : ''
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
            player.isHero
              ? 'bg-gradient-to-br from-blue-500 to-blue-700'
              : 'bg-gradient-to-br from-gray-500 to-gray-700'
          }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <PositionLabel position={position} />
      </div>

      {/* Name & chips */}
      <div className="mt-1 text-center">
        <div className="text-white text-xs font-semibold truncate max-w-[80px]">{name}</div>
        <div className="text-amber-400 text-xs font-mono">
          {isBust ? 'BUST' : `${chipStack}`}
        </div>
      </div>

      {/* Hole cards */}
      {holeCards && holeCards.length === 2 && (
        <div className="flex gap-0.5 mt-1">
          <HoleCard card={holeCards[0]} />
          <HoleCard card={holeCards[1]} />
        </div>
      )}

      {/* Face-down cards placeholder */}
      {!holeCards && isActive && !isBust && (
        <div className="flex gap-0.5 mt-1">
          <HoleCard faceDown />
          <HoleCard faceDown />
        </div>
      )}

      {/* Last action chip */}
      {lastAction && <ActionChip action={lastAction} />}

      {/* Hand rank at showdown */}
      {handRank && <HandRankLabel rank={handRank} />}

      {/* Current bet */}
      {player.currentBet != null && player.currentBet > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-600 shadow-sm" />
          <span className="text-white text-xs font-mono">{player.currentBet}</span>
        </div>
      )}
    </div>
  );
}