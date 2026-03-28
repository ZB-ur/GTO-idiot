import React from 'react';

interface CardComponentProps {
  rank?: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit?: 's' | 'h' | 'd' | 'c';
  faceUp?: boolean;
  className?: string;
}

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-600',
};

const rankDisplay: Record<string, string> = {
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
};

export const CardComponent: React.FC<CardComponentProps> = ({
  rank,
  suit,
  faceUp = true,
  className = '',
}) => {
  const displayRank = rank ? (rankDisplay[rank] ?? rank) : '';
  const displaySuit = suit ? suitSymbols[suit] : '';
  const colorClass = suit ? suitColors[suit] : 'text-gray-900';

  if (!faceUp || !rank || !suit) {
    return (
      <div
        className={`relative w-16 h-[5.5rem] rounded-lg shadow-sm border border-gray-300 overflow-hidden select-none transition-transform duration-300 ${className}`}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 25%, #2563eb 50%, #1e3a5f 75%)',
        }}
      >
        <div className="absolute inset-1 rounded border border-white/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/30" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-16 h-[5.5rem] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between p-1.5 select-none transition-transform duration-300 hover:scale-105 ${colorClass} ${className}`}
    >
      {/* Top-left rank + suit */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm font-bold">{displayRank}</span>
        <span className="text-xs -mt-0.5">{displaySuit}</span>
      </div>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl">{displaySuit}</span>
      </div>

      {/* Bottom-right rank + suit (inverted) */}
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className="text-sm font-bold">{displayRank}</span>
        <span className="text-xs -mt-0.5">{displaySuit}</span>
      </div>
    </div>
  );
};

export default CardComponent;