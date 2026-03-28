import React from 'react';

interface CardProps {
  rank?: 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
  suit?: 's' | 'h' | 'd' | 'c';
  faceDown?: boolean;
  className?: string;
}

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-50',
};

export const Card: React.FC<CardProps> = ({ rank, suit, faceDown = false, className = '' }) => {
  if (faceDown || !rank || !suit) {
    return (
      <div
        className={`relative w-16 h-22 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400 shadow-md flex items-center justify-center select-none ${className}`}
        style={{ height: '5.5rem' }}
      >
        <div className="w-10 h-14 rounded border border-amber-300/40 bg-amber-600/50" />
      </div>
    );
  }

  const symbol = suitSymbols[suit];
  const color = suitColors[suit];

  return (
    <div
      className={`relative w-16 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col justify-between p-1.5 select-none ${className}`}
      style={{ height: '5.5rem' }}
    >
      <div className={`flex flex-col items-start leading-none ${color}`}>
        <span className="text-sm font-bold">{rank}</span>
        <span className="text-xs">{symbol}</span>
      </div>
      <div className={`text-2xl text-center ${color}`}>{symbol}</div>
      <div className={`flex flex-col items-end leading-none rotate-180 ${color}`}>
        <span className="text-sm font-bold">{rank}</span>
        <span className="text-xs">{symbol}</span>
      </div>
    </div>
  );
};