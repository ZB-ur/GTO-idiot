/**
 * CardComponent — renders a single playing card with suit color and symbol.
 * Supports face-up, face-down, and dealing animation states.
 */

import React from 'react';
import type { Card, Suit } from '../../types';

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900 dark:text-gray-100',
  spades: 'text-gray-900 dark:text-gray-100',
};

interface CardComponentProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animationDelay?: number;
  highlight?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-11 text-xs',
  md: 'w-11 h-16 text-sm',
  lg: 'w-14 h-20 text-base',
} as const;

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  faceDown = false,
  size = 'md',
  animationDelay = 0,
  highlight = false,
  className = '',
}) => {
  const sizeClass = SIZE_CLASSES[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${sizeClass} rounded-md border border-gray-600
          bg-gradient-to-br from-blue-800 to-blue-900 shadow-md
          flex items-center justify-center select-none
          ${highlight ? 'ring-2 ring-yellow-400' : ''}
          ${className}`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="w-3/4 h-3/4 rounded-sm border border-blue-600 bg-blue-700/50 flex items-center justify-center">
          <span className="text-blue-400 text-[0.5rem] font-bold">GTO</span>
        </div>
      </div>
    );
  }

  const { rank, suit } = card;
  const suitSymbol = SUIT_SYMBOLS[suit];
  const colorClass = SUIT_COLORS[suit];

  return (
    <div
      className={`${sizeClass} rounded-md border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 shadow-md
        flex flex-col items-center justify-between p-0.5 select-none
        transition-transform duration-200 hover:scale-105
        ${highlight ? 'ring-2 ring-yellow-400 shadow-yellow-400/30' : ''}
        ${className}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={`${colorClass} font-bold leading-none self-start`}>
        <div>{rank}</div>
        <div className="text-[0.6em]">{suitSymbol}</div>
      </div>
      <div className={`${colorClass} text-lg leading-none`}>
        {suitSymbol}
      </div>
      <div className={`${colorClass} font-bold leading-none self-end rotate-180`}>
        <div>{rank}</div>
        <div className="text-[0.6em]">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default CardComponent;
