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

interface BotSeatProps {
  player: PlayerState;
  isCurrentActor: boolean;
  isThinking: boolean;
  difficulty: 'fish' | 'regular' | 'gto';
}

const difficultyConfig: Record<string, { color: string; icon: string; label: string }> = {
  fish: { color: 'from-cyan-400 to-cyan-600', icon: '🐟', label: 'Fish' },
  regular: { color: 'from-orange-400 to-orange-600', icon: '🎯', label: 'Reg' },
  gto: { color: 'from-purple-400 to-purple-600', icon: '🧠', label: 'GTO' },
};

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-amber-300 text-[10px] font-medium">Thinking…</span>
    </div>
  );
}

export default function BotSeat({ player, isCurrentActor, isThinking, difficulty }: BotSeatProps) {
  const config = difficultyConfig[difficulty] || difficultyConfig.fish;

  // Strip hole cards for bots unless at showdown (cards present means showdown)
  const botPlayer: PlayerState = {
    ...player,
    // Only show cards if explicitly provided (showdown), otherwise hide them
    holeCards: player.holeCards,
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Difficulty badge */}
      <div
        className={`absolute -top-1 -left-1 z-10 bg-gradient-to-r ${config.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      <PlayerSeat player={botPlayer} isCurrentActor={isCurrentActor} />

      {/* Thinking indicator */}
      {isThinking && <ThinkingIndicator />}
    </div>
  );
}