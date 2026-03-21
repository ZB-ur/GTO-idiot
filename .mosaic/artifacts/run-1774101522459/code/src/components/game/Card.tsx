// ============================================================
// Card — SVG playing card with rank, suit, color
// ============================================================

import React from 'react';
import type { Card as CardType, Suit, Rank } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types';
import { cardEnterClass, dealCardStyle } from './animations';

export interface CardProps {
  card: CardType | null;
  /** Show card face or back */
  faceUp?: boolean;
  /** Index for staggered deal animation */
  dealIndex?: number;
  /** Whether to animate entrance */
  animate?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const SIZE_MAP = {
  sm: { w: 40, h: 56, text: 'text-xs', suit: 'text-sm' },
  md: { w: 56, h: 80, text: 'text-sm', suit: 'text-lg' },
  lg: { w: 72, h: 100, text: 'text-base', suit: 'text-xl' },
} as const;

const RANK_DISPLAY: Record<Rank, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9', 'T': '10',
  'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A',
};

function suitColorClass(suit: Suit): string {
  return SUIT_COLORS[suit] === 'red' ? 'text-card-heart' : 'text-card-spade';
}

const Card: React.FC<CardProps> = ({
  card,
  faceUp = true,
  dealIndex = 0,
  animate = false,
  size = 'md',
  className = '',
}) => {
  const dim = SIZE_MAP[size];
  const animClass = animate ? cardEnterClass(true) : '';
  const animStyle = animate ? dealCardStyle(dealIndex) : {};

  if (!card || !faceUp) {
    // Card back
    return (
      <div
        className={`relative rounded-lg shadow-md overflow-hidden flex-shrink-0 ${animClass} ${className}`}
        style={{ width: dim.w, height: dim.h, ...animStyle }}
      >
        <svg
          viewBox="0 0 56 80"
          width={dim.w}
          height={dim.h}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="56" height="80" rx="4" fill="#1e40af" />
          <rect x="4" y="4" width="48" height="72" rx="2" fill="#1e3a8a" />
          {/* Diamond pattern */}
          <pattern id="cardBack" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M6 0L12 6L6 12L0 6Z" fill="#2563eb" opacity="0.3" />
          </pattern>
          <rect x="4" y="4" width="48" height="72" rx="2" fill="url(#cardBack)" />
        </svg>
      </div>
    );
  }

  const symbol = SUIT_SYMBOLS[card.suit];
  const colorCls = suitColorClass(card.suit);
  const rank = RANK_DISPLAY[card.rank];

  return (
    <div
      className={`relative rounded-lg shadow-md overflow-hidden flex-shrink-0 bg-white ${animClass} ${className}`}
      style={{ width: dim.w, height: dim.h, ...animStyle }}
    >
      <svg
        viewBox="0 0 56 80"
        width={dim.w}
        height={dim.h}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="56" height="80" rx="4" fill="white" stroke="#d1d5db" strokeWidth="1" />
      </svg>
      {/* Top-left rank + suit */}
      <div className={`absolute top-0.5 left-1 leading-tight ${colorCls}`}>
        <div className={`${dim.text} font-bold`}>{rank}</div>
        <div className={`${dim.suit} -mt-1`}>{symbol}</div>
      </div>
      {/* Center suit */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorCls}`}>
        <span className="text-2xl">{symbol}</span>
      </div>
      {/* Bottom-right rank + suit (inverted) */}
      <div className={`absolute bottom-0.5 right-1 leading-tight rotate-180 ${colorCls}`}>
        <div className={`${dim.text} font-bold`}>{rank}</div>
        <div className={`${dim.suit} -mt-1`}>{symbol}</div>
      </div>
    </div>
  );
};

export default React.memo(Card);
