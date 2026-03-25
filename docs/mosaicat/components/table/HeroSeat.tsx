import React from 'react';
import PlayerSeat from './PlayerSeat';

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

interface HeroSeatProps {
  player: PlayerState;
  isCurrentActor: boolean;
}

export default function HeroSeat({ player, isCurrentActor }: HeroSeatProps) {
  // Hero seat always shows cards face-up and has a distinct visual treatment
  return (
    <div className="relative">
      {/* Hero glow effect */}
      {isCurrentActor && (
        <div className="absolute -inset-3 rounded-2xl bg-amber-400/10 blur-md pointer-events-none" />
      )}
      <div className="relative bg-emerald-800/40 rounded-2xl px-3 py-2 border border-emerald-600/30 backdrop-blur-sm">
        <PlayerSeat player={player} isCurrentActor={isCurrentActor} />
        {/* "YOU" label */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow uppercase tracking-wider">
          You
        </div>
      </div>
    </div>
  );
}